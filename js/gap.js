/**
 * gap.js — Skills Gap Analyzer Module
 */

const GAP_SYSTEM_PROMPT = `You are a career skills analyst for Kenya's job market.
Reply ONLY with a single raw JSON object — no markdown, no code fences, no text outside the JSON.

Structure:
{"readinessScore":number,"summary":"string","haveSkills":["string"],"missingSkills":[{"skill":"string","importance":"Critical|High|Medium","howToLearn":"string"}],"partialSkills":[{"skill":"string","gap":"string"}],"nextSteps":["string","string","string","string"],"timeToReady":"string"}

Rules: readinessScore = 0-100. importance must be exactly Critical, High, or Medium. howToLearn = affordable resource in Kenya. nextSteps = 4 concrete Kenya-specific actions.`;

async function analyzeGap() {
    const targetCareer  = document.getElementById('targetCareer').value.trim();
    const currentSkills = document.getElementById('currentSkills').value.trim();
    const education     = document.getElementById('education').value.trim();
    const experience    = document.getElementById('experience').value.trim();
    const industry      = document.getElementById('industry').value.trim();

    if (!targetCareer || !currentSkills) {
        alert('Please enter at least your Target Career and Current Skills to continue.');
        return;
    }

    const btn = document.getElementById('analyzeBtn');
    btn.disabled = true;
    btn.textContent = '⏳  Analyzing…';

    const resultsEl = document.getElementById('gapResults');
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = `
        <div class="loading" style="padding:32px;justify-content:center">
            <div class="spinner"></div>
            Analyzing profile for <strong>${escHtml(targetCareer)}</strong>…
        </div>`;

    const userMessage = `Target Role: ${targetCareer}
Current Skills: ${currentSkills}
Education: ${education || 'Not specified'}
Experience: ${experience || '0 years'}
Industry: ${industry || 'General'}
Analyze the skills gap for the Kenyan job market.`;

    try {
        const raw  = await callClaude([{ role: 'user', content: userMessage }], GAP_SYSTEM_PROMPT, CONFIG.MAX_TOKENS_JSON);
        const data = parseJSON(raw);
        renderGapResults(data, targetCareer);
    } catch (error) {
        console.error('Gap error:', error);
        resultsEl.innerHTML = `
            <div class="card" style="border-color:var(--accent2)">
                <p style="color:var(--accent2)">⚠️ Analysis failed: ${escHtml(error.message)}</p>
                <p style="color:var(--text-dim);font-size:.88rem;margin-top:8px">Please try again.</p>
            </div>`;
    }

    btn.disabled = false;
    btn.textContent = '🔍  Analyze My Skills Gap';
}

function renderGapResults(d, targetCareer) {
    // Defensive defaults for every field
    const score        = Number(d.readinessScore ?? d.score ?? d.rating ?? 50);
    const summary      = d.summary      || d.overview    || 'Analysis complete.';
    const timeToReady  = d.timeToReady  || d.timeframe   || d.duration || 'A few months of focused effort';
    const haveSkills   = Array.isArray(d.haveSkills)   ? d.haveSkills   : (Array.isArray(d.existingSkills)   ? d.existingSkills   : []);
    const missingSkills= Array.isArray(d.missingSkills) ? d.missingSkills: (Array.isArray(d.skillsNeeded)     ? d.skillsNeeded     : []);
    const partialSkills= Array.isArray(d.partialSkills) ? d.partialSkills: (Array.isArray(d.improvementAreas) ? d.improvementAreas : []);
    const nextSteps    = Array.isArray(d.nextSteps)     ? d.nextSteps    : (Array.isArray(d.actionPlan)       ? d.actionPlan       : []);

    const scoreColor = score >= 70 ? 'var(--accent)' : score >= 40 ? '#f59e0b' : 'var(--accent2)';
    const scoreEmoji = score >= 70 ? '🟢' : score >= 40 ? '🟡' : '🔴';

    const haveHtml = haveSkills.map(s =>
        `<div class="skill-item"><div class="dot have"></div><span style="font-size:.88rem">${escHtml(String(s))}</span></div>`
    ).join('') || '<p style="color:var(--text-muted);font-size:.88rem;padding:8px 0">No matching skills found</p>';

    const missHtml = missingSkills.map(s => {
        const skill = s.skill || s.name || String(s);
        const imp   = s.importance || s.priority || 'Medium';
        const how   = s.howToLearn || s.resource || s.tip || '';
        const impColor = imp === 'Critical' ? 'var(--accent2)' : '#f59e0b';
        const impBg    = imp === 'Critical' ? 'rgba(255,107,53,.15)' : 'rgba(245,158,11,.15)';
        return `
        <div class="skill-item" style="flex-direction:column;align-items:flex-start;gap:6px">
            <div style="display:flex;align-items:center;gap:8px;width:100%">
                <div class="dot miss"></div>
                <span style="font-size:.88rem;font-weight:500">${escHtml(skill)}</span>
                <span style="margin-left:auto;font-size:.72rem;padding:2px 8px;border-radius:8px;background:${impBg};color:${impColor}">${escHtml(imp)}</span>
            </div>
            ${how ? `<div style="font-size:.8rem;color:var(--text-dim);padding-left:18px">💡 ${escHtml(how)}</div>` : ''}
        </div>`;
    }).join('') || '<p style="color:var(--accent);font-size:.88rem;padding:8px 0">No critical gaps found!</p>';

    const partialHtml = partialSkills.length ? `
        <div style="margin-top:16px">
            <h4 style="font-size:.78rem;color:var(--text-dim);margin-bottom:12px;text-transform:uppercase;letter-spacing:.07em">⚡ Needs Improvement</h4>
            ${partialSkills.map(s => {
                const skill = s.skill || s.name || String(s);
                const gap   = s.gap   || s.description || '';
                return `<div class="skill-item"><div class="dot partial"></div>
                    <span style="font-size:.88rem"><strong>${escHtml(skill)}</strong>${gap ? ' — ' + escHtml(gap) : ''}</span>
                </div>`;
            }).join('')}
        </div>` : '';

    const stepsHtml = nextSteps.map((step, i) => `
        <div class="skill-item">
            <div style="width:26px;height:26px;background:linear-gradient(135deg,var(--accent),var(--accent3));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#000;flex-shrink:0">${i+1}</div>
            <span style="font-size:.9rem">${escHtml(String(step))}</span>
        </div>`).join('') || '<p style="color:var(--text-dim);font-size:.9rem">No steps available — try again.</p>';

    document.getElementById('gapResults').innerHTML = `
        <div class="card" style="margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:28px;margin-bottom:24px;flex-wrap:wrap">
                <div style="text-align:center;min-width:90px">
                    <div style="font-family:'Syne',sans-serif;font-size:3rem;font-weight:800;color:${scoreColor};line-height:1">${score}%</div>
                    <div style="font-size:.78rem;color:var(--text-dim);margin-top:6px">Readiness Score</div>
                </div>
                <div style="flex:1;min-width:200px">
                    <h3 style="font-family:'Syne',sans-serif;font-size:1.15rem;margin-bottom:8px">${scoreEmoji} Path to: ${escHtml(targetCareer)}</h3>
                    <p style="color:var(--text-dim);font-size:.9rem;line-height:1.6">${escHtml(summary)}</p>
                    <p style="color:var(--accent);font-size:.84rem;margin-top:8px">⏱ Time to job-ready: <strong>${escHtml(timeToReady)}</strong></p>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:16px">
                <div>
                    <h4 style="font-size:.78rem;color:var(--text-dim);margin-bottom:12px;text-transform:uppercase;letter-spacing:.07em">✅ Skills You Have</h4>
                    ${haveHtml}
                </div>
                <div>
                    <h4 style="font-size:.78rem;color:var(--text-dim);margin-bottom:12px;text-transform:uppercase;letter-spacing:.07em">❌ Skills You Need</h4>
                    ${missHtml}
                </div>
            </div>
            ${partialHtml}
        </div>
        <div class="card">
            <h3 style="font-family:'Syne',sans-serif;margin-bottom:16px">🚀 Your Action Plan</h3>
            ${stepsHtml}
        </div>`;
}
