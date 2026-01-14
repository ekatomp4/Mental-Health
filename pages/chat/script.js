(function initChatWhenReady() {
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  if (!chatMessages || !chatInput || !chatSend) {
    // elements not injected yet — try again next tick
    requestAnimationFrame(initChatWhenReady);
    return;
  }

  // prevent double-init if loader reinjects
  if (chatMessages.dataset.ready) return;
  chatMessages.dataset.ready = "true";

  const mockMessages = [
    { user: "Alex", text: "Welcome to MentalPanda chat." },
    { user: "Jamie", text: "This is a shared study room." },
    { user: "Alex", text: "Ask questions or just hang out." }
  ];

  function appendMessage(user, text) {
    const msg = document.createElement("div");
    msg.className = "mb-2";
    msg.innerHTML = `<strong>${user}:</strong> ${text}`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // load mock messages
  for (const m of mockMessages) {
    appendMessage(m.user, m.text);
  }

  chatSend.addEventListener("click", () => {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage("You", text);
    chatInput.value = "";
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      chatSend.click();
    }
  });
})();