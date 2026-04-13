/**
 * app.js — Main Application Controller
 * ──────────────────────────────────────
 * Handles tab navigation and initialises modules on first visit.
 */

// Track which panels have been loaded
const panelLoaded = {
    chat:    true,   // Chat is the default tab — always ready
    trends:  false,
    gap:     false,
    courses: false
};

/**
 * Switch the active panel when a navigation tab is clicked.
 *
 * @param {string} panelId - One of: 'chat', 'trends', 'gap', 'courses'
 * @param {HTMLElement} clickedTab - The tab button that was clicked
 */
function showPanel(panelId, clickedTab) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    // Deactivate all tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Show selected panel and activate tab
    document.getElementById('panel-' + panelId).classList.add('active');
    clickedTab.classList.add('active');

    // Lazy-load panel data on first visit
    if (panelId === 'trends' && !panelLoaded.trends) {
        panelLoaded.trends = true;
        loadTrends();
    }

    if (panelId === 'courses' && !panelLoaded.courses) {
        panelLoaded.courses = true;
        // Load the default category
        const defaultChip = document.querySelector('.filter-chip[data-cat]');
        if (defaultChip) {
            getCourses(defaultChip.dataset.cat);
        }
    }
}

// ── Startup checks ───
document.addEventListener('DOMContentLoaded', () => {
    // Warn the user if the API key hasn't been configured
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 9999;
            background: rgba(255,107,53,0.15); border: 1px solid var(--accent2);
            color: var(--text); padding: 16px 20px; border-radius: 14px;
            font-family: 'DM Sans', sans-serif; font-size: .88rem;
            max-width: 340px; line-height: 1.55;
            box-shadow: 0 8px 32px rgba(0,0,0,.4);
        `;
        warning.innerHTML = `
            <strong style="color:var(--accent2)">⚠️ API Key Not Set</strong><br>
            Open <code style="background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px">js/config.js</code>
            and replace <code style="background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px">YOUR_GEMINI_API_KEY_HERE</code>
            with your actual Gemini API key.<br>
            <span style="color:var(--text-dim);font-size:.8rem;display:block;margin-top:6px">
                See README.md for instructions.
            </span>
            <button onclick="this.parentElement.remove()" style="
                background:none;border:none;color:var(--text-muted);cursor:pointer;
                float:right;font-size:1.1rem;margin-top:-2px">✕</button>
        `;
        document.body.appendChild(warning);
    }
});
