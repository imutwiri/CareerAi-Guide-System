/**
 * api.js — Google Gemini API Utility
 * Auto-retries on rate limit with countdown timer.
 */

async function callClaude(messages, systemPrompt, maxTokens = CONFIG.MAX_TOKENS) {
    const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const url = `${CONFIG.API_BASE}/${CONFIG.MODEL}:generateContent?key=${CONFIG.API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
        })
    });

    const data = await response.json();

    // ── Rate limit: auto-retry with countdown ──────────────
    if (response.status === 429) {
        const errMsg   = data?.error?.message || '';
        const seconds  = parseRetrySeconds(errMsg);
        await showCountdownAndWait(seconds);
        // Retry once after waiting
        return callClaude(messages, systemPrompt, maxTokens);
    }

    if (!response.ok) {
        throw new Error(data?.error?.message || `Gemini API Error ${response.status}`);
    }

    const candidate = data?.candidates?.[0];
    if (!candidate) throw new Error("No response from Gemini. Try rephrasing your question.");

    return candidate.content.parts[0].text;
}

/**
 * Extract "retry in X seconds" from Gemini rate limit error message.
 * Falls back to 30 seconds if not found.
 */
function parseRetrySeconds(msg) {
    const match = msg.match(/retry in ([\d.]+)s/i);
    return match ? Math.ceil(parseFloat(match[1])) : 30;
}

/**
 * Show a visible countdown banner and resolve after the wait.
 * Updates every second so the user knows what's happening.
 */
function showCountdownAndWait(seconds) {
    return new Promise(resolve => {
        // Remove any existing banner
        document.getElementById('rateLimitBanner')?.remove();

        const banner = document.createElement('div');
        banner.id = 'rateLimitBanner';
        banner.style.cssText = `
            position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
            z-index:9999; background:var(--surface2);
            border:1px solid #f59e0b; border-radius:14px;
            padding:16px 28px; text-align:center;
            font-family:'DM Sans',sans-serif; font-size:.9rem;
            color:var(--text); box-shadow:0 8px 32px rgba(0,0,0,.5);
            min-width:300px;
        `;

        let remaining = seconds;

        function update() {
            banner.innerHTML = `
                <div style="color:#f59e0b;font-weight:600;margin-bottom:6px">
                    ⏳ Free tier limit reached
                </div>
                <div style="color:var(--text-dim);font-size:.85rem;margin-bottom:10px">
                    Auto-retrying in <strong style="color:var(--text);font-size:1.1rem">${remaining}s</strong>
                </div>
                <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden">
                    <div style="height:100%;background:#f59e0b;border-radius:2px;
                        width:${((seconds - remaining) / seconds) * 100}%;
                        transition:width 1s linear"></div>
                </div>
                <div style="color:var(--text-muted);font-size:.78rem;margin-top:8px">
                    Free tier: 20 requests/min — no action needed
                </div>`;
        }

        update();
        document.body.appendChild(banner);

        const interval = setInterval(() => {
            remaining--;
            update();
            if (remaining <= 0) {
                clearInterval(interval);
                banner.remove();
                resolve();
            }
        }, 1000);
    });
}

/**
 * Robustly parse JSON from Gemini — handles fences, truncation, alternate keys.
 */
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
