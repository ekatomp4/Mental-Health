
/*
How messages need to be saved:
["message 1", "message 2", "..."]
or
"message"
*/
// Note - Testing 
// modules are ran after normal scripts
// modules do not share variables with other files
// you can import and export variables and functions in modules

const toggle = document.getElementById("chatbotToggle");
const chatWindow = document.getElementById("chatWindow");
const chatSend = document.getElementById("chatSend");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Conversation storage (simple string array)
let messages = [];
let isWaiting = false; // prevents spamming while bot is "typing"

/* UI CONTROLS */

// Toggle chatbot window
toggle.addEventListener("click", () => {
    chatWindow.style.display =
        chatWindow.style.display === "flex" ? "none" : "flex";
});

/* MAIN SEND FUNCTION */

function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg || isWaiting) return; // block send if bot hasn't responded yet

    handleUserInput(msg);
    chatInput.value = "";
}

/* USER INPUT PLACEHOLDER (Backend) */

async function handleUserInput(userText) {
    saveMessage(userText);
    addMessageToUI(userText, "userMessage");

    showTypingIndicator();

    // Simulated AI delay
    // setTimeout(() => {
        removeTypingIndicator();

        const aiResponse = await generateAIResponse(userText); // evan will replace later maybe
        handleAIResponse(aiResponse);
    // }, 700);
}

/* AI RESPONSE HANDLER */

function handleAIResponse(responseText) {
    saveMessage(responseText);
    addMessageToUI(responseText, "botMessage");
}

/* MESSAGE STORAGE */

function saveMessage(text) {
    messages.push(text); // format: ["message 1", "message 2"]
    console.log("Conversation:", messages);
}

/* UI RENDERING */

function addMessageToUI(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatMessage ${className}`;
    messageDiv.textContent = text;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* TYPING INDICATOR */

function showTypingIndicator() {
    isWaiting = true;
    chatSend.disabled = true;

    const typingDiv = document.createElement("div");
    typingDiv.className = "chatMessage botMessage typingIndicator";
    typingDiv.id = "typingIndicator";
    // Animated dots text
    typingDiv.innerHTML = "<span></span><span></span><span></span>";

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById("typingIndicator");
    if (typingDiv) typingDiv.remove();

    isWaiting = false;
    chatSend.disabled = false;
    chatInput.focus(); // refocus input after bot responds
}

/* TEMP LOGIC FOR TESTING AI - "Work with evan for backend stuff" */

async function sendMessageToBackend(message) {
    const res = await fetch("/api/sendchatbotmessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.response;
}

async function generateAIResponse(userMessage) {
    const text = userMessage.toLowerCase();

    // migration to backend:

    const aiResponse = await sendMessageToBackend(text);
    return aiResponse

    // mock responses:
    // if (text.includes("sad")) {
    //     return "I'm really sorry you're feeling sad. Do you want to talk about what's been weighing on you?";
    // }

    // if (text.includes("anxious")) {
    //     return "Anxiety can feel overwhelming. Would you like to try a short breathing exercise?";
    // }

    // if (text.includes("stressed")) {
    //     return "Stress can build up quickly. What's been causing the most pressure lately?";
    // }

    // return "I'm here to listen. Tell me more about how you're feeling.";
}

/* EVENT LISTENERS */

chatSend.addEventListener("click", sendMessage);

// keydown instead of keypress (keypress is deprecated)
// Shift+Enter inserts a newline, plain Enter sends
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});