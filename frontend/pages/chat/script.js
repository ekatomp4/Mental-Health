(function initChatWhenReady() {
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");

    if (!chatMessages || !chatInput || !chatSend) {
        requestAnimationFrame(initChatWhenReady);
        return;
    }

    if (chatMessages.dataset.ready) return;
    chatMessages.dataset.ready = "true";

    const MAX_RENDERED_MESSAGES = 50;
    const BOTTOM_THRESHOLD_PX = 24;

    function isNearBottom() {
        const distanceFromBottom = chatMessages.scrollHeight - (chatMessages.scrollTop + chatMessages.clientHeight);
        return distanceFromBottom <= BOTTOM_THRESHOLD_PX;
    }

    function appendMessage(user, text, color) {
        const shouldStickToBottom = isNearBottom();

        const row = document.createElement("div");
        row.className = "mb-2";

        const name = document.createElement("strong");
        name.textContent = `${user}: `;
        if (color) {
            name.style.color = color;
        }

        const message = document.createElement("span");
        message.textContent = text;

        row.appendChild(name);
        row.appendChild(message);
        chatMessages.appendChild(row);

        while (chatMessages.children.length > MAX_RENDERED_MESSAGES) {
            chatMessages.removeChild(chatMessages.firstElementChild);
        }

        if (shouldStickToBottom) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function setSendEnabled(enabled) {
        chatInput.disabled = !enabled;
        chatSend.disabled = !enabled;
    }

    const USERNAME_COLORS = {
        RED: "#dc3545",
        ORANGE: "#fd7e14",
        YELLOW: "#d4a017",
        GREEN: "#198754",
        BLUE: "#0d6efd",
        PURPLE: "#6f42c1",
        BLACK: "#111111"
    };

    setSendEnabled(false);
    appendMessage("System", "Connecting to chat...");

    window.MentalPanda.connectSocket()
        .then((socket) => {
            if (!socket) {
                window.loadPageByPath("/auth");
                return;
            }

            setSendEnabled(true);
            appendMessage("System", "Connected.");

            socket.on("gateway:connected", () => {
                appendMessage("System", "Welcome to the global chat.");
            });

            socket.on("chat:message", (payload) => {
                const color = USERNAME_COLORS[payload?.color] || USERNAME_COLORS.BLACK;
                appendMessage(payload?.username || "Unknown", payload?.message || "", color);
            });

            socket.on("chat:error", (payload) => {
                appendMessage("System", payload?.error || "Unable to send message.");
            });

            socket.on("disconnect", () => {
                setSendEnabled(false);
                appendMessage("System", "Disconnected from chat.");
            });

            chatSend.addEventListener("click", () => {
                const text = chatInput.value.trim();
                if (!text) return;
                socket.emit("chat:message", { message: text });
                chatInput.value = "";
            });

            chatInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    chatSend.click();
                }
            });
        })
        .catch((error) => {
            setSendEnabled(false);
            appendMessage("System", error?.message || "Chat connection failed.");
        });
})();
