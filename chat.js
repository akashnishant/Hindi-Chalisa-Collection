let isOpen = false;
let conversationHistory = [];
let WORKER_ENDPOINT = "https://chalisa.akashnishant25.workers.dev";

// Auto-resize textarea
document.getElementById("messageInput").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 100) + "px";
});

// API Key handling
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

messageInput.disabled = false;
sendBtn.disabled = false;
messageInput.placeholder = "Type your message...";

// Enter key to send message
document
  .getElementById("messageInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

function toggleChat() {
  if (isOpen) {
    closeChat();
  } else {
    openChat();
  }
}

function openChat() {
  document.getElementById("chatWindow").style.display = "flex";
  document.querySelector(".chat-bubble").style.display = "none";
  isOpen = true;
}

function closeChat() {
  document.getElementById("chatWindow").style.display = "none";
  document.querySelector(".chat-bubble").style.display = "flex";
  isOpen = false;
}

function minimizeChat() {
  closeChat();
}

function formatBotMessage(message) {
  // Convert markdown-like formatting to HTML for better readability
  let formatted = message;

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert numbered lists
  formatted = formatted.replace(/^\d+\.\s(.+)$/gm, "• $1");

  // Convert dashes to bullet points
  formatted = formatted.replace(/^-\s(.+)$/gm, "• $1");

  // Convert tables to readable format
  if (formatted.includes("|")) {
    const lines = formatted.split("\n");
    let inTable = false;
    let formattedLines = [];

    for (let line of lines) {
      if (line.includes("|") && !line.match(/^\|[-\s|]+\|$/)) {
        if (!inTable) {
          inTable = true;
        }
        // Convert table row to readable format
        const cells = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        if (cells.length >= 2) {
          formattedLines.push(`${cells[0]}: ${cells.slice(1).join(" - ")}`);
        }
      } else if (line.match(/^\|[-\s|]+\|$/)) {
        // Skip table separator lines
        continue;
      } else {
        if (inTable && line.trim() === "") {
          inTable = false;
          formattedLines.push("");
        }
        formattedLines.push(line);
      }
    }
    formatted = formattedLines.join("\n");
  }

  // Clean up extra spaces and line breaks
  formatted = formatted.replace(/\n\s*\n\s*\n/g, "\n\n");

  return formatted;
}

function addMessage(message, isUser = false, isLoading = false) {
  const messagesContainer = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");

  if (isLoading) {
    messageDiv.className = "loading-message";
    messageDiv.innerHTML = `
                    <span>AI is thinking</span>
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                `;
    messageDiv.id = "loadingMessage";
  } else {
    messageDiv.className = isUser ? "user-message" : "bot-message";
    if (isUser) {
      messageDiv.textContent = message;
    } else {
      // Format bot messages for better readability
      const formatted = formatBotMessage(message);
      messageDiv.innerHTML = formatted;
    }
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return messageDiv;
}

function removeLoadingMessage() {
  const loadingMessage = document.getElementById("loadingMessage");
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

function showError(message) {
  const messagesContainer = document.getElementById("chatMessages");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  messagesContainer.appendChild(errorDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function callGroqAPI(requestBody) {
  if (
    !WORKER_ENDPOINT ||
    WORKER_ENDPOINT !== "https://chalisa.akashnishant25.workers.dev"
  ) {
    throw new Error("Cloudflare Worker endpoint not configured");
  }

  const response = await fetch(WORKER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Worker Error Response:", errorText);
    throw new Error(`Worker Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function searchWeb(requestBody) {
  if (
    !WORKER_ENDPOINT ||
    WORKER_ENDPOINT !== "https://chalisa.akashnishant25.workers.dev"
  ) {
    throw new Error("Cloudflare Worker endpoint not configured");
  }

  const response = await fetch(WORKER_ENDPOINT+'/search', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Worker Error Response:", errorText);
    throw new Error(`Worker Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!message) return;

  // Add user message
  addMessage(message, true);
  messageInput.value = "";
  messageInput.style.height = "auto";

  // Add to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Show loading
  const loadingMessage = addMessage("", false, true);

  try {
    // First, try to get response from Groq
    let systemPrompt = `You are a specialized AI assistant focused exclusively on Indian mythology. You can only provide information about:

- Hindu mythology (Puranas, Vedas, epics like Ramayana and Mahabharata)
- Buddhist mythology and Jataka tales
- Jain mythology and stories
- Regional Indian mythological traditions
- Indian gods, goddesses, and deities
- Mythological characters, stories, and legends from India
- Religious festivals and their mythological significance
- Sacred texts and scriptures of Indian origin
- Temples and their mythological connections

If a user asks about anything outside of Indian mythology (like world history, science, technology, other cultures' mythology, general knowledge, current events, etc.), respond politely with:

"I apologize, but I'm specifically designed to help with Indian mythology only. I can discuss Hindu, Buddhist, Jain mythologies, Indian epics like Ramayana and Mahabharata, Indian deities, sacred texts, and related mythological stories. Please feel free to ask me anything about Indian mythology!"

When providing mythological information, format your responses clearly using:
- Use bullet points (•) for lists
- Use **bold** for important names, terms, or headings
- Structure information with clear sections
- Keep responses well-organized and easy to read

If you need current information about Indian mythology topics (like recent discoveries, temple news, etc.), respond with "I need to search for current information about this Indian mythology topic."

If the user asks anything about the upcoming festivals or dates about festivals or mythological events, then also respond with "I need to search for current information about this Indian mythology topic."`;

    const requestBody = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
      ],
      temperature: 0.1,
      max_tokens: 1000,
    };

    const data = await callGroqAPI(requestBody);
    let aiResponse = "";
    if(data && data?.choices?.length) {
      aiResponse = data?.choices[0]?.message?.content;
    } else if(aiResponse?.error?.message === "Internal Server Error") {
      aiResponse = "There is some error at my end. Please try after some time."
    } else {
      aiResponse = "Please try after few minutes";
    }
    

    // Check if AI indicates it needs web search
    if (aiResponse.includes("I need to search for current information about this Indian mythology topic.")) {
      // Perform web search
      let webSearchMsg = document.getElementById("loadingMessage");
      webSearchMsg.innerHTML = `
                    <span>Searching the Web</span>
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>`;
      // Get AI response with search context
        const contextRequestBody = {
          query: message,
          search_depth: "advanced",
          include_answer: true,
          include_images: false
        };

        const data2 = await searchWeb(contextRequestBody);
        aiResponse = data2?.answer;
    }

    // Remove loading message and add AI response
    removeLoadingMessage();
    addMessage(aiResponse, false);

    // Add to conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });
  } catch (error) {
    removeLoadingMessage();
    console.error("Error:", error);
    showError(
      `Error: ${error.message}. Something went wrong. Please try again later!`
    );
  }
}
