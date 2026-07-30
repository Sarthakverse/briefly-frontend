<div align="center">
  <img src="public/favicon.svg" alt="Briefly AI Logo" width="80" />
  <h1 style="font-size: 3rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
    Briefly AI
  </h1>
  <p style="font-size: 1.2rem; color: #64748b; margin-top: 8px;">
    <em>Thrive with Change</em>
  </p>
  <p style="color: #94a3b8; max-width: 600px; margin: 16px auto;">
    An intelligent meeting intelligence platform that transforms Microsoft Teams transcripts into structured summaries, architectural flowcharts, speaker analyses, and actionable insights — all powered by AI.
  </p>

  <div style="margin: 32px 0;">
    <a href="#-demo-video" style="text-decoration: none;">
      <span style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #6366f1; color: white; border-radius: 999px; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
        ▶️ Watch Demo
      </span>
    </a>
  </div>
</div>

---

## 🎥 Demo Video

<div align="center" style="margin: 32px 0;">
  <video
    controls
    poster="https://via.placeholder.com/960x540/0f172a/6366f1?text=Briefly+AI+Demo"
    style="width: 100%; max-width: 960px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);"
    preload="metadata"
  >
    <source src="demo.mp4" type="video/mp4" />
    <source src="demo.webm" type="video/webm" />
    <p style="color: #94a3b8;">
      Your browser doesn't support HTML video.
      <a href="demo.mp4" style="color: #6366f1;">Download the demo</a> instead.
    </p>
  </video>

  <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 12px;">
    <em>Place your demo video at <code>public/demo.mp4</code> or replace the <code>&lt;source&gt;</code> above with a YouTube / Vimeo embed.</em>
  </p>
</div>

---

## ✨ Features

<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 16px; vertical-align: top; width: 50%;">
      <h3>🧠 AI-Powered Meeting Analysis</h3>
      <p style="color: #64748b;">Upload <code>.vtt</code>, <code>.docx</code>, or <code>.txt</code> transcripts. The platform extracts executive summaries, technical deep-dives, speaker contributions, and Mermaid flowcharts — all automatically.</p>
    </td>
    <td style="padding: 16px; vertical-align: top; width: 50%;">
      <h3>🤖 Intelligent Chatbot</h3>
      <p style="color: #64748b;">Ask natural-language questions about your data. The chatbot uses function-calling to query the database in real time and returns precise answers with source citations.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px; vertical-align: top;">
      <h3>📊 Rich Visualisations</h3>
      <p style="color: #64748b;">Interactive Mermaid diagrams for architecture flows, speaker contribution pie charts, and scrollable text panes — all in a split-view layout with zoom controls.</p>
    </td>
    <td style="padding: 16px; vertical-align: top;">
      <h3>🔔 Real-Time Notifications</h3>
      <p style="color: #64748b;">Every admin action broadcasts a notification to all users. Bell icon with unread badge, clickable links, and auto-refresh.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px; vertical-align: top;">
      <h3>📁 Hierarchical Data Model</h3>
      <p style="color: #64748b;">Adapters → Releases → Enhancements → Meetings, plus independent Tasks and private Workspace transcripts.</p>
    </td>
    <td style="padding: 16px; vertical-align: top;">
      <h3>⭐ Favorites & Search</h3>
      <p style="color: #64748b;">Star important meetings/transcripts for quick access. Full‑text search across all entities with smart ranking.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px; vertical-align: top;">
      <h3>📄 PDF Export</h3>
      <p style="color: #64748b;">One-click export of meeting intelligence reports with summaries, action items, decisions, and speaker breakdowns.</p>
    </td>
    <td style="padding: 16px; vertical-align: top;">
      <h3>🌙 Dark Mode</h3>
      <p style="color: #64748b;">System‑wide light/dark theme with smooth transitions and persistent preference.</p>
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

<div align="center">
  <pre style="background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 16px; text-align: left; display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.8;">
┌─────────────────────────────────────────────────────────┐
│                    <span style="color: #818cf8;">Frontend (React + Vite)</span>                      │
│  TypeScript · Tailwind CSS · Framer Motion · Recharts   │
│  Mermaid · marked · DOMPurify · Axios                   │
└─────────────────────┬───────────────────────────────────┘
                      │  REST API (Bearer JWT)
┌─────────────────────▼───────────────────────────────────┐
│                 <span style="color: #818cf8;">Backend (Express + Prisma)</span>                     │
│  Node.js · TypeScript · PostgreSQL · OpenAI/DeepSeek    │
│  Multer · Mammoth · Resend · bcryptjs · Zod             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              <span style="color: #818cf8;">PostgreSQL Database</span>                              │
│  Adapters · Releases · Enhancements · Meetings          │
│  Tasks · WorkspaceTranscripts · Favorites               │
│  Notifications · Users · RefreshTokens                  │
└─────────────────────────────────────────────────────────┘
  </pre>
</div>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts, Mermaid, Lucide Icons |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL |
| **AI / LLM** | OpenAI GPT‑4o‑mini / DeepSeek‑v4‑flash (configurable) |
| **Auth** | JWT access + refresh tokens, bcryptjs, refresh token rotation |
| **Email** | Resend (transactional OTP emails) |
| **File Parsing** | Mammoth (.docx), custom WebVTT parser |
| **Validation** | Zod (backend), inline validation (frontend) |

---

## 📂 Project Structure
