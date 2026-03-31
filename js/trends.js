/**
 * trends.js — Job Market Trends Module
 */

const TRENDS_SYSTEM_PROMPT = `You are a Kenyan labour market analyst. Reply ONLY with a single raw JSON object — no markdown, no code fences, no text before or after.

Use exactly this structure:
{"topJobs":[{"name":"string","demand":number}],"topSkills":[{"name":"string","growth":number}],"insights":["string"]}

Rules: topJobs = 6 items, topSkills = 6 items. demand/growth = integers 40-100. insights = 4 short sentences about Kenya job market. Mix sectors: tech, fintech, agriculture, healthcare, NGO, government.`;

async function loadTrends() {
    setTrendsLoading();
    try {
        const raw  = await callClaude(
            [{ role: 'user', content: 'Give me current Kenyan job market trend data for 2025-2026.' }],
            TRENDS_SYSTEM_PROMPT,
            CONFIG.MAX_TOKENS_JSON
        );
        const data = parseJSON(raw);

        // Defensive: accept alternate key names Gemini might use
        const jobs   = data.topJobs   || data.jobs   || data.topRoles  || data.roles  || [];
        const skills = data.topSkills || data.skills  || data.topSkill  || [];
        const insights = data.insights || data.marketInsights || data.tips || [];

        if (!jobs.length && !skills.length) {
            throw new Error("Gemini returned unexpected data format. Click Refresh to try again.");
        }

        renderDemandBars(jobs);
        renderSkillsBars(skills);
        renderInsights(insights);

    } catch (error) {
        console.error('Trends error:', error);
        showTrendsError(error.message);
    }
}

function setTrendsLoading() {
    const html = (t) => `<div class="loading"><div class="spinner"></div>${t}</div>`;
    document.getElementById('demandBars').innerHTML      = html('Loading job demand data…');
    document.getElementById('skillsBars').innerHTML     = html('Analyzing skills trends…');
    document.getElementById('marketInsights').innerHTML = html('Generating market insights…');
}

function showTrendsError(message) {
    const errHtml = `<p style="color:var(--accent2);padding:12px;font-size:.88rem">
        ⚠️ ${escHtml(message)}<br>
        <span style="color:var(--text-dim)">Click Refresh to try again.</span>
    </p>`;
    document.getElementById('demandBars').innerHTML      = errHtml;
    document.getElementById('skillsBars').innerHTML     = errHtml;
    document.getElementById('marketInsights').innerHTML = errHtml;
}

function renderDemandBars(jobs) {
    if (!Array.isArray(jobs) || !jobs.length) {
        document.getElementById('demandBars').innerHTML = '<p style="color:var(--text-dim);padding:12px">No data — click Refresh.</p>';
        return;
    }
    const max = Math.max(...jobs.map(j => Number(j.demand || j.value || 50)));
    document.getElementById('demandBars').innerHTML = jobs.map(job => {
        const val = Number(job.demand || job.value || 50);
        return `
        <div class="job-bar">
            <div class="job-name">${escHtml(job.name || job.title || 'Role')}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${(val/max)*100}%"></div></div>
            <div class="bar-pct">${val}%</div>
        </div>`;
    }).join('');
}

function renderSkillsBars(skills) {
    if (!Array.isArray(skills) || !skills.length) {
        document.getElementById('skillsBars').innerHTML = '<p style="color:var(--text-dim);padding:12px">No data — click Refresh.</p>';
        return;
    }
    const max = Math.max(...skills.map(s => Number(s.growth || s.value || 50)));
    document.getElementById('skillsBars').innerHTML = skills.map(skill => {
        const val = Number(skill.growth || skill.value || 50);
        return `
        <div class="job-bar">
            <div class="job-name">${escHtml(skill.name || skill.skill || 'Skill')}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${(val/max)*100}%"></div></div>
            <div class="bar-pct">${val}%</div>
        </div>`;
    }).join('');
}

function renderInsights(insights) {
    if (!Array.isArray(insights) || !insights.length) {
        document.getElementById('marketInsights').innerHTML = '<p style="color:var(--text-dim);padding:12px">No insights — click Refresh.</p>';
        return;
    }
    document.getElementById('marketInsights').innerHTML = insights.map(i => `
        <div class="skill-item">
            <div class="dot have"></div>
            <span>${escHtml(String(i))}</span>
        </div>`).join('');
}
