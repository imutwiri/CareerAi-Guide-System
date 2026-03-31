/**
 * chat.js — Career Chat Module
 * ──────────────────────────────
 * Handles the multi-turn AI career conversation.
 * Maintains chat history in memory for context-aware replies.
 */

// ── System prompt: gives the AI its Kenya-specific persona ──
const CHAT_SYSTEM_PROMPT = `You are CareerAI Kenya — a warm, expert AI career counselor built specifically for Kenyan university students and graduates.

You have deep, current knowledge of:
- Kenya's job market across tech, finance, agri-business, NGOs, healthcare, government, and informal sectors
- Kenyan universities: UoN, Strathmore, JKUAT, KU, MKU, Daystar, USIU, Moi University, Egerton, and others
- HELB loans, government scholarships, KUCCPS, and the CBC transition
- Kenya Vision 2030, Hustler Fund, Digital Economy Blueprint, and their impact on careers
- Typical salary ranges in Kenya by sector, experience, and location (Nairobi vs upcountry)
- Remote work, gig economy (Upwork, Fiverr, Toptal), and global opportunities for Kenyan graduates
- Professional certifications valued in Kenya: CPA(K), ACCA, AWS, Google, Cisco, PMP, CFA, CISM
- Common Kenyan interview styles, CV expectations, and recruitment processes
- Major Kenyan employers: Safaricom, KCB, Equity, KPMG, PwC, Deloitte, UN agencies, World Bank, NGOs

Give practical, specific, Kenya-contextualized advice. Use bullet points for lists when helpful.
Keep responses clear and actionable. Occasionally use Swahili phrases naturally (e.g. "Habari!", "Sawa").
Avoid generic global advice — always ground answers in the Kenyan context.`;

// ── In-memory conversation history ──────────────────────────
const chatHistory = [];

// ── DOM helpers ──────────────────────────────────────────────

/**
 * Append a message bubble to the chat window.
 * @param {'ai'|'user'} role
 * @param {string} htmlContent - Safe HTML to render inside the bubble
 */
function appendMessage(role, htmlContent) {
    const container = document.getElementById('chatMessages');
    const isUser = role === 'user';

    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}`;
    wrapper.innerHTML = `
        <div class="avatar ${isUser ? 'user-av' : 'ai-av'}">${isUser ? '👤' : '🤖'}</div>
        <div class="bubble">${htmlContent}</div>
    `;

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

/** Show the animated typing indicator while waiting for the AI. */
function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const el = document.createElement('div');
    el.className = 'message ai';
    el.id = 'typingIndicator';
    el.innerHTML = `
        <div class="avatar ai-av">🤖</div>
        <div class="bubble">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
}

/** Remove the typing indicator from the DOM. */
function removeTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

// ── Main send function ────────────────────────────────────────

/** Called when the user sends a chat message. */
async function sendChat() {
    const inputEl = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const text = inputEl.value.trim();
    if (!text) return;

    // Clear input and reset height
    inputEl.value = '';
    inputEl.style.height = 'auto';

    // Show user message
    appendMessage('user', escHtml(text));
    chatHistory.push({ role: 'user', content: text });

    // Disable send button, show typing indicator
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const reply = await callClaude(chatHistory, CHAT_SYSTEM_PROMPT);
        removeTypingIndicator();
        appendMessage('ai', markdownToHtml(reply));
        chatHistory.push({ role: 'assistant', content: reply });
    } catch (error) {
        removeTypingIndicator();
        appendMessage('ai', `⚠️ <strong>Connection error:</strong> ${escHtml(error.message)}. Please check your API key in js/config.js and try again.`);
        console.error('Chat API error:', error);
    }

    sendBtn.disabled = false;
    inputEl.focus();
}

// ── Utility functions ─────────────────────────────────────────

/** Send a quick-prompt without the user typing anything. */
function sendQuick(promptText) {
    document.getElementById('chatInput').value = promptText;
    sendChat();
}

/** Handle Enter key (send) vs Shift+Enter (new line). */
function handleKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChat();
    }
}

/** Auto-resize the textarea as the user types. */
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
