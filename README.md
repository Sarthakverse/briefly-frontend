<div align="center">
  <img src="/favicon.svg" alt="Briefly AI" width="80" />
  <h1 style="margin-top:0;">Briefly</h1>
  <p><em>Thrive with Change – AI‑Powered Meeting Intelligence</em></p>
</div>

<!-- VIDEO DEMO -->
<div align="center" style="margin: 30px 0;">
  <video width="100%" style="max-width: 800px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" controls autoplay muted loop>
    <source src="https://drive.google.com/file/d/1h4n77kILcHQfjhho2AdKir0g-NIZdGRN/view?usp=sharing" type="video/mp4">
    Your browser does not support the video tag.
  </video>
  <p style="font-size: 13px; color: #64748b; margin-top: 8px;">
    ▶ Replace <code>src</code> with your actual demo video URL
  </p>
</div>

---

## 🧠 AI at the Core

Briefly is a **full‑stack meeting intelligence platform** that turns raw transcripts into structured insights.  
The **entire summarisation pipeline, chat assistant, and search** are powered by **Large Language Models** (OpenAI / DeepSeek), making AI not just a feature but the **heart** of the application.

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/48/artificial-intelligence.png" width="40"/><br/>
        <b>AI Summaries</b><br/>
        <sub>Executive, technical & speaker</sub>
      </td>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/48/chat.png" width="40"/><br/>
        <b>AI Chat Assistant</b><br/>
        <sub>Multi‑turn, context‑aware Q&A</sub>
      </td>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/48/search.png" width="40"/><br/>
        <b>Smart Search</b><br/>
        <sub>Fuzzy + token‑based across all data</sub>
      </td>
    </tr>
  </table>
</div>

---

## ✨ Key Features

- 📥 **Upload transcripts** (`.vtt`, `.docx`, `.txt`) and get instant, structured meeting reports.
- 🧠 **AI‑generated summaries** – Executive summary, technical details, speaker contributions, and Mermaid flowcharts.
- 💬 **Integrated AI chatbot** – Ask questions about your meetings, releases, adapters, and workspace data.
- 🔔 **Real‑time notifications** – Broadcasts when any admin creates/updates/deletes entities.
- 🌓 **Dark mode** – Smooth, animated theme switching.
- 📱 **Responsive design** – Optimised for desktop, tablet, and mobile.

---

## 🛠 Tech Stack

**Frontend**  
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) 
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript) 
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite) 
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss) 
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer)

**AI / Backend**  
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai) 
![DeepSeek](https://img.shields.io/badge/DeepSeek-V4--Flash-0A0A0A?logo=deepseek) 
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs) 
![Express](https://img.shields.io/badge/Express-5-000000?logo=express) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/briefly-frontend.git
cd briefly-frontend

# 2. Install dependencies
npm install

# 3. Set environment variables (see .env.example)
echo "VITE_API_BASE_URL=http://localhost:4000/api" > .env.local

# 4. Start development server
npm run dev