/**
 * courses.js — Course Recommendation Engine
 */

const COURSES_SYSTEM_PROMPT = `You are a course recommendation engine for Kenyan university students.
Reply ONLY with a single raw JSON object — no markdown, no code fences, no text outside the JSON.

Structure:
{"courses":[{"title":"string","platform":"string","description":"string","duration":"string","level":"Beginner|Intermediate|Advanced","free":boolean,"relevance":"string"}]}

Rules: exactly 6 courses. level must be Beginner, Intermediate, or Advanced exactly. free = boolean. Mix 3 free + 3 paid. Use REAL course names from Coursera, edX, Udemy, Google, Microsoft, ALX Africa, Ajira Digital, YouTube. relevance = 1 sentence mentioning Kenya.`;

async function getCourses(category) {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = `
        <div class="loading" style="grid-column:1/-1;justify-content:center;padding:32px">
            <div class="spinner"></div>
            Loading ${escHtml(category)} courses…
        </div>`;

    try {
        const raw  = await callClaude(
            [{ role: 'user', content: `Recommend 6 courses for a Kenyan student interested in: ${category}.` }],
            COURSES_SYSTEM_PROMPT,
            CONFIG.MAX_TOKENS_JSON
        );
        const data = parseJSON(raw);

        // Accept alternate key names
        const courses = data.courses || data.recommendations || data.results || [];

        if (!Array.isArray(courses) || !courses.length) {
            throw new Error("No courses returned. Please try again.");
        }

        renderCourses(courses);
    } catch (error) {
        console.error('Courses error:', error);
        grid.innerHTML = `
            <div style="grid-column:1/-1;padding:32px;text-align:center;color:var(--text-dim)">
                <p>⚠️ Could not load recommendations</p>
                <p style="font-size:.85rem;margin-top:6px">${escHtml(error.message)}</p>
                <p style="font-size:.85rem;margin-top:8px">
                    <button class="refresh-btn" onclick="getCourses('${escHtml(category)}')">🔄 Try Again</button>
                </p>
            </div>`;
    }
}

function renderCourses(courses) {
    if (!Array.isArray(courses) || !courses.length) return;

    document.getElementById('coursesGrid').innerHTML = courses.map(course => {
        // Defensive: handle missing fields gracefully
        const title    = course.title       || course.name        || 'Untitled Course';
        const platform = course.platform    || course.provider    || 'Online';
        const desc     = course.description || course.summary     || '';
        const duration = course.duration    || course.length      || 'Self-paced';
        const level    = course.level       || course.difficulty  || 'Beginner';
        const isFree   = course.free === true || course.cost === 'free' || course.price === 0;
        const relevance = course.relevance  || course.why         || '';

        const freeColor = isFree ? 'var(--accent)'      : 'var(--accent2)';
        const freeBg    = isFree ? 'rgba(0,212,170,.1)' : 'rgba(255,107,53,.1)';

        return `
        <div class="course-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                <span class="course-platform">${escHtml(platform)}</span>
                <span style="font-size:.72rem;padding:3px 10px;border-radius:10px;background:${freeBg};color:${freeColor}">
                    ${isFree ? '🆓 Free' : '💳 Paid'}
                </span>
            </div>
            <div class="course-title">${escHtml(title)}</div>
            <div class="course-desc">${escHtml(desc)}</div>
            ${relevance ? `<div style="font-size:.8rem;color:var(--accent);margin-bottom:12px;line-height:1.4">🇰🇪 ${escHtml(relevance)}</div>` : ''}
            <div class="course-meta">
                <span>⏱ ${escHtml(duration)}</span>
                <span>📈 ${escHtml(level)}</span>
            </div>
        </div>`;
    }).join('');
}

// Filter chip listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            getCourses(this.dataset.cat);
        });
    });
});
