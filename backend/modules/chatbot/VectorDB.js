import * as lancedb from "@lancedb/lancedb";
import { pipeline } from "@xenova/transformers";
import Config from "../../constants/Config";

// ─── VectorDB ─────────────────────────────────────────────────────────────────

class VectorDB {
  static _pipe = null;

  /**
   * Lazily loads the embedding pipeline on first call.
   * Model: all-MiniLM-L6-v2 — 384 dimensions, fast, semantic, free.
   * Weights are downloaded once (~25MB) and cached in node_modules/.cache
   */
  static async getPipeline() {
    if (!VectorDB._pipe) {
      VectorDB._pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return VectorDB._pipe;
  }

  /**
   * Converts text to a real 384-dim semantic embedding.
   * Mean-pools the token outputs and returns a plain JS array.
   */
  static async textToVector(text) {
    if (!text) return Array(384).fill(0);

    const extractor = await VectorDB.getPipeline();

    // { pooling: "mean", normalize: true } gives cosine-ready unit vectors
    const result = await extractor(text, { pooling: "mean", normalize: true });

    // result.data is a Float32Array — LanceDB needs a plain Array
    return Array.from(result.data);
  }
}

// ─── DB Setup ─────────────────────────────────────────────────────────────────

const db = await lancedb.connect("data/chatbot");

// Build seed data with real embeddings — awaited before table creation
const SEED_DATA_RAW = [
  { id: 1,  text: "Hello",          response: "Hey there! 🐼 I'm Bean, your MentalPanda companion. Whether you need info about our site or just someone to talk to, I'm here. How can I help?" },
  { id: 2,  text: "Hi",             response: "Hi! I'm Bean the panda 🐼 — here to help you navigate MentalPanda and support your mental wellness journey. What's on your mind?" },
  // ... rest of your seed entries unchanged
];

// Vectors are now computed async up front so the table is ready to use
const SEED_DATA = await Promise.all(
  SEED_DATA_RAW.map(async (item) => ({
    ...item,
    vector: await VectorDB.textToVector(item.text),
  }))
);

// ─── Table Management ─────────────────────────────────────────────────────────

async function getOrCreateTable(db, tableName) {
  let table;
  try {
    table = await db.openTable(tableName);

    const schema = await table.schema();
    const hasTextField = schema.fields.some((f) => f.name === "text");

    // Also check vector dimension — if it's 100 (old char-based), recreate
    const vectorField = schema.fields.find((f) => f.name === "vector");
    const storedDim = vectorField?.type?.listSize;
    const expectedDim = 384;

    if (!hasTextField || storedDim !== expectedDim) {
      console.warn(`Table "${tableName}" has stale schema (dim: ${storedDim}). Recreating...`);
      await db.dropTable(tableName);
      table = await db.createTable(tableName, SEED_DATA);
      console.log(`Recreated table: ${tableName}`);
    } else {
      console.log(`Loaded existing table: ${tableName}`);
    }
  } catch (err) {
    if (
      err.message.toLowerCase().includes("not found") ||
      err.message.toLowerCase().includes("does not exist")
    ) {
      console.log(`Table not found, creating: ${tableName}`);
      table = await db.createTable(tableName, SEED_DATA);
    } else {
      throw err;
    }
  }
  return table;
}

async function addItem(table, text, response) {
  const vector = await VectorDB.textToVector(text);
  const id = Date.now();
  await table.add([{ id, vector, text, response }]);
}

async function searchItems(table, text, limit = 5) {
  const vector = await VectorDB.textToVector(text);
  return await table.search(vector).limit(limit).toArray();
}

const table = await getOrCreateTable(db, "chatbot");

// ─── Mock AI Fallback ─────────────────────────────────────────────────────────

async function fetchAIResponse(message) {
  await new Promise((r) => setTimeout(r, 300));
  return `[AI mock] I'm Bean 🐼, and I'm not quite sure about "${message}" — but I'm here to help! Try asking about our Conditions page, Find Therapists, or mental health tips.`;
}

// ─── ChatBot ──────────────────────────────────────────────────────────────────

class ChatBot {
  static prompt = Config.AI_Prompt.trim();

  /**
   * With normalized semantic vectors, cosine distance lives in [0, 2].
   * 0 = identical, 2 = opposite. A threshold of 0.5 is a good starting point —
   * tighten toward 0.3 for stricter matching, loosen toward 0.8 for fuzzier.
   */
  static DISTANCE_THRESHOLD = 0.5;

  static async respond(message) {
    const results = await searchItems(table, message, 1);

    if (results.length > 0) {
      const best = results[0];
      const distance = best._distance ?? Infinity;

      if (distance <= ChatBot.DISTANCE_THRESHOLD) {
        return best.response;
      }
    }

    const aiResponse = await fetchAIResponse(message);
    await addItem(table, message, aiResponse);
    console.log("→ Saved AI response to VectorDB.");

    return aiResponse;
  }
}

export { table, addItem, searchItems, VectorDB };
export default ChatBot;