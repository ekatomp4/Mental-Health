import * as lancedb from "@lancedb/lancedb";

class VectorDB {
	// Convert text into a normalized vector of fixed size
	static textToVector(text, size = 100) {
		if (!text) {
			return Array(size).fill(0);
		}

		const chars = text
			.toLowerCase()
			.replace(/[^\w\s]/g, "")
			.split("");

		let vector = chars.map((c) => c.charCodeAt(0));

		const max = Math.max(...vector);
		// vector = vector.map((v) => (max ? v / max : 0));
		vector = vector.map((v) => v / 127);

		if (vector.length < size) {
			vector = vector.concat(Array(size - vector.length).fill(0));
		} else if (vector.length > size) {
			vector = vector.slice(0, size);
		}

		return vector;
	}
}

const db = await lancedb.connect("data/chatbot");

async function getOrCreateTable(db, tableName) {
	let table;
	try {
		// openTable loads an existing table; throws if it doesn't exist
		table = await db.openTable(tableName);
		console.log(`Loaded existing table: ${tableName}`);
	} catch (err) {
		if (err.message.toLowerCase().includes("not found") || err.message.toLowerCase().includes("does not exist")) {
			console.log(`Table not found, creating: ${tableName}`);
			table = await db.createTable(tableName, [
				{ id: 1, vector: VectorDB.textToVector("Hello"), response: "Hello! How are you today!" }
			]);
		} else {
			throw err;
		}
	}
	return table;
}

async function addTextItem(table, text, metadata = {}) {
	const vector = VectorDB.textToVector(text);
	await table.add([{ vector, text, ...metadata }]);
}

async function getItems(table, text, limit = 10) {
	const vector = VectorDB.textToVector(text);
	return await table.search(vector).limit(limit).toArray();
}

const table = await getOrCreateTable(db, "chatbot");


export { table, addTextItem, getItems };
export default VectorDB;
