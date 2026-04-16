/**
 * api.js — Google Gemini API Utility
 * Auto-retries on rate limit (429) AND server overload (503/high demand).
 */

// Track retry attempts to avoid infinite loops
async function callClaude(messages, systemPrompt, maxTokens = CONFIG.MAX_TOKENS, retryCount = 0) {
    const MAX_RETRIES = 3;

    const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const url = `${CONFIG.API_BASE}/${CONFIG.MODEL}:generateContent?key=${CONFIG.API_KEY}`;

    let response;
    try {
        response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
                generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
            })
        });
    } catch (networkError) {
        throw new Error(diagnoseFetchError());
    }

    const data = await response.json();
    const errMsg = data?.error?.message || '';

    // ── 429: Rate limit — auto-retry with exact countdown ──────
    if (response.status === 429) {
        const seconds = parseRetrySeconds(errMsg);
        await showCountdownAndWait(seconds, '⏳ Rate limit reached', '#f59e0b', 'Free tier: 20 requests/min — no action needed');
        return callClaude(messages, systemPrompt, maxTokens, 0);
    }

    // ── 503 / "high demand" — auto-retry with short wait ───────
    const isOverloaded =
        response.status === 503 ||
        response.status === 500 ||
        errMsg.toLowerCase().includes('high demand') ||
        errMsg.toLowerCase().includes('overloaded') ||
        errMsg.toLowerCase().includes('temporarily unavailable') ||
        errMsg.toLowerCase().includes('try again later');

    if (isOverloaded && retryCount < MAX_RETRIES) {
        // Wait 8 seconds on first retry, 15 on second, 25 on third
        const waitSeconds = [8, 15, 25][retryCount] || 25;
        await showCountdownAndWait(
            waitSeconds,
            `🔄 Gemini busy — retrying (${retryCount + 1}/${MAX_RETRIES})`,
            '#7c6af7',
            'Google servers are under high demand — auto-retrying shortly'
        );
        return callClaude(messages, systemPrompt, maxTokens, retryCount + 1);
    }

    if (!response.ok) {
        throw new Error(errMsg || `Gemini API Error ${response.status}`);
    }

    const candidate = data?.candidates?.[0];
    if (!candidate) throw new Error("No response received. Please try again.");

    return candidate.content.parts[0].text;
}

/**
 * Diagnose why fetch() itself threw (before reaching Google).
 */
function diagnoseFetchError() {
    if (window.location.protocol === 'file:') {
        return `FILE:// PROTOCOL — Open a terminal in the CareerAI_Kenya folder and run: python -m http.server 8000 — then go to http://localhost:8000`;
    }
    if (!navigator.onLine) {
        return `NO INTERNET — You are offline. Please check your Wi-Fi or mobile data and try again.`;
    }
    return `NETWORK ERROR — Could not reach Google's servers. Check your internet connection and try again.`;
}

function parseRetrySeconds(msg) {
    const match = msg.match(/retry in ([\d.]+)s/i);
    return match ? Math.ceil(parseFloat(match[1])) : 30;
}

/**
 * Show a countdown banner and resolve after the wait.
 * Used for both rate limit (429) and server overload (503) retries.
 */
function showCountdownAndWait(seconds, title, color, subtitle) {
    return new Promise(resolve => {
        document.getElementById('rateLimitBanner')?.remove();
        const banner = document.createElement('div');
        banner.id = 'rateLimitBanner';
        banner.style.cssText = `
            position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
            z-index:9999; background:var(--surface2);
            border:1px solid ${color}; border-radius:14px;
            padding:16px 28px; text-align:center;
            font-family:'DM Sans',sans-serif; font-size:.9rem;
            color:var(--text); box-shadow:0 8px 32px rgba(0,0,0,.5);
            min-width:320px;
        `;

        let remaining = seconds;
        const tick = () => {
            banner.innerHTML = `
                <div style="color:${color};font-weight:600;margin-bottom:6px">${title}</div>
                <div style="color:var(--text-dim);font-size:.85rem;margin-bottom:10px">
                    Auto-retrying in <strong style="color:var(--text);font-size:1.1rem">${remaining}s</strong>
                </div>
                <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden">
                    <div style="height:100%;background:${color};border-radius:2px;
                        width:${((seconds - remaining) / seconds) * 100}%;transition:width 1s linear"></div>
                </div>
                <div style="color:var(--text-muted);font-size:.78rem;margin-top:8px">${subtitle}</div>`;
        };
        tick();
        document.body.appendChild(banner);

        const interval = setInterval(() => {
            remaining--;
            tick();
            if (remaining <= 0) {
                clearInterval(interval);
                banner.remove();
                resolve();
            }
        }, 1000);
    });
}

function parseJSON(raw) {
    let cleaned = raw.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end   = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        return JSON.parse(repairJSON(cleaned));
    }
}

function repairJSON(str) {
    let s = str;
    s = s.replace(/,\s*"[^"]*$/, '');
    s = s.replace(/,\s*"[^"]*":\s*"[^"]*$/, '');
    s = s.replace(/,\s*"[^"]*":\s*\d*$/, '');
    s = s.replace(/,\s*$/, '');
    const opens = [];
    let inStr = false, escape = false;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (escape)     { escape = false; continue; }
        if (c === '\\') { escape = true;  continue; }
        if (c === '"')  { inStr = !inStr;  continue; }
        if (inStr) continue;
        if (c === '{' || c === '[') opens.push(c);
        if (c === '}' || c === ']') opens.pop();
    }
    if (inStr) s += '"';
    for (let i = opens.length - 1; i >= 0; i--) s += opens[i] === '{' ? '}' : ']';
    return s;
}

function escHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function markdownToHtml(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}
