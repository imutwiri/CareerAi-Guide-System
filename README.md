# 🎯 CareerAI Kenya
### AI-Powered Career Guidance System for Kenyan University Students
**Final Year Project — 2026**

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [How to Run (Step by Step)](#how-to-run)
5. [Getting Your API Key](#getting-your-api-key)
6. [Technologies Used](#technologies-used)
7. [Troubleshooting](#troubleshooting)

---

## Project Overview

CareerAI Kenya is a web-based AI career guidance system designed for Kenyan university students and recent graduates. It uses the Google Gemini API to provide real-time, Kenya-specific career counselling through four intelligent modules:

- **Career Chat** — Ask any career question and get expert AI advice
- **Job Market Trends** — See what jobs and skills are most in demand in Kenya
- **Skills Gap Analyzer** — Find out exactly what skills you need for your target career
- **Course Recommendations** — Get a curated list of courses to bridge your skills gap

The system is built with plain **HTML, CSS, and JavaScript** — no frameworks, no installations required.

---

## Features

| Module | What it does |
|---|---|
| 💬 Career Chat | Multi-turn AI conversation about any Kenyan career topic |
| 📊 Job Market Trends | AI-generated bar charts of top jobs and fastest-growing skills |
| 🔍 Skills Gap Analyzer | Scores your readiness (0–100) and lists missing skills with learning tips |
| 🎓 Course Recommendations | 6 AI-curated courses per category, with Kenya-specific relevance |

---

## Project Structure

```
CareerAI_Kenya/
│
├── index.html          ← Main entry point (open this in your browser)
│
├── css/
│   └── style.css       ← All styling (dark theme, responsive layout)
│
├── js/
│   ├── config.js       ← ⚠️  PUT YOUR API KEY HERE
│   ├── api.js          ← Shared Claude API communication utility
│   ├── chat.js         ← Career Chat module
│   ├── trends.js       ← Job Market Trends module
│   ├── gap.js          ← Skills Gap Analyzer module
│   ├── courses.js      ← Course Recommendations module
│   └── app.js          ← Navigation controller & app initialisation
│
└── README.md           ← This file
```

---

## How to Run

### Method 1 — Open Directly in Browser (Simplest)

> ✅ This works for demos, presentations, and submission.

1. **Download / clone** the project folder to your computer.
2. **Set your API key** (see [Getting Your API Key](#getting-your-api-key) below).
3. **Open `index.html`** in Google Chrome or Firefox — just double-click the file.
4. The app loads immediately. Click any tab to explore features.

> ⚠️ **Note:** Some browsers block API calls from `file://` URLs due to CORS policy.
> If the app doesn't call the API, use **Method 2** below.

---

### Method 2 — Run a Local Web Server (Recommended)

This is the most reliable method and takes only 30 seconds.

#### Option A: Using Python (if Python is installed)

```bash
# Navigate to the project folder in your terminal
cd CareerAI_Kenya

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open your browser and go to: **http://localhost:8000**

---

#### Option B: Using VS Code Live Server (Easiest for students)

1. Install **Visual Studio Code** from https://code.visualstudio.com
2. Install the **Live Server** extension (search "Live Server" in Extensions)
3. Open the `CareerAI_Kenya` folder in VS Code
4. Right-click `index.html` → **"Open with Live Server"**
5. Browser opens automatically at **http://127.0.0.1:5500**

---

#### Option C: Using Node.js

```bash
# Install a simple server globally (one-time)
npm install -g serve

# Run from the project folder
cd CareerAI_Kenya
serve .

# Open the URL shown in the terminal (usually http://localhost:3000)
```

---

## Getting Your API Key

The app uses the **Google Gemini API**. You need an API key to make it work.

### Step 1 — Create a Google Cloud project
1. Go to: **https://console.cloud.google.com/**
2. Create or select an existing project.
3. Enable the **Generative AI API** (a.k.a. Gemini).

### Step 2 — Generate an API Key
1. In the Cloud Console, go to **APIs & Services > Credentials**
2. Click **Create Credentials > API key**
3. Copy the key.

### Step 3 — Add the Key to the Project
Open the file `js/config.js` in any text editor and change it to:

```javascript
const CONFIG = {
    API_KEY: "YOUR_GOOGLE_GEMINI_API_KEY_HERE"
};
```

Then replace `YOUR_GOOGLE_GEMINI_API_KEY_HERE` with your key and save.

The app will now connect to Gemini.

### ⚠️ Keeping Your Key Safe
- **Never share your API key** in public repositories or screenshots
- **Never commit it to GitHub** — add `js/config.js` to `.gitignore` if using version control
- The free tier includes enough credits for hundreds of test queries

---

## Technologies Used

| Technology | Purpose | Version |
|---|---|---|
| HTML5 | Page structure and content | Standard |
| CSS3 | Styling, animations, responsive layout | Standard |
| JavaScript (ES6+) | Application logic | Standard |
| Google Gemini API | AI-powered responses | gemini-2.0-flash |
| Google Fonts | Typography (Syne + DM Sans) | Latest |
| Fetch API | HTTP requests to Claude | Browser built-in |

**No npm install. No build step. No framework.**

---

## Troubleshooting

### ❌ "API Key Not Set" warning appears
Open `js/config.js` and make sure `CONFIG.API_KEY` is set to your Google Gemini key.

### ❌ Chat sends but nothing comes back
- Check that your API key is correct (copy it fresh from console.anthropic.com)
- Make sure you have internet connection
- Open browser DevTools (F12) → Console tab for error details

### ❌ App looks broken / styles missing
Make sure you are opening `index.html` from inside the `CareerAI_Kenya` folder,
not a copy of the HTML file on its own. The CSS and JS files must be in the same folder.

### ❌ CORS error in browser console
Use **Method 2** (local server) instead of opening the file directly.
Run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.

### ❌ "Failed to fetch" error
This usually means no internet connection or the API endpoint is blocked by a network firewall.
Try on a different network (personal hotspot).

---

## Academic Information

| Field | Detail |
|---|---|
| Project Type | Final Year Project (FYP) |
| Academic Year | 2025/2026 |
| AI Engine | Anthropic Claude (claude-sonnet-4-20250514) |
| Target Users | Kenyan university students & graduates |
| Problem Solved | Career guidance gap in Kenyan universities |

---

*CareerAI Kenya — Bridging the gap between education and employment in Kenya.*
