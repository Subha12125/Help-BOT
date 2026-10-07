# Rani — Emotional Wellness & Mental Health Companion

Rani is a private, thoughtful AI-powered companion designed to support emotional well-being, mindfulness, and de-stressing. Powered by Groq's high-speed inference engine, Rani combines empathetic conversational guidance with practical grounding and somatic calming tools.

---

## ✨ Features

- **Empathetic AI Companion**: Guided by a dedicated mental wellness system prompt focused on emotional validation, active listening, cognitive reframing (CBT-inspired), and self-compassion.
- **Modern, Distraction-Free UI**: Clean dark aesthetic built with pure CSS, crisp SVG iconography, and zero distracting gimmicks or emojis.
- **Interactive Wellness Toolkit**:
  - **Box Breathing (4-4-4-4)**: Interactive visual guide to slow heart rate and activate the vagus nerve.
  - **5-4-3-2-1 Sensory Grounding**: Step-by-step sensory checklist to anchor racing thoughts in the physical present.
  - **Gentle Daily Reminders**: Compassionate affirmations for self-kindness.
- **24/7 Crisis Support**: Quick-access modal with verified emergency helplines:
  - **India**: Tele-MANAS (`14416` / `1800-891-4416`) & KIRAN (`1800-599-0019`)
  - **United States & Canada**: 988 Suicide & Crisis Lifeline (`988`)
  - **United Kingdom**: NHS (`111`) & Crisis Text Line (`SHOUT` to `85258`)
  - **International**: Direct link to [findahelpline.com](https://findahelpline.com)
- **Subtle Audio Chime**: Synthesized 432 Hz calming audio feedback using the Web Audio API (no external sound assets required, toggleable).
- **Fast Groq Inference**: High-speed responses with automatic fallback redundancy (`openai/gpt-oss-120b` with fallback to `qwen/qwen3.8-27b`).

---

## 🛠️ Tech Stack

- **Backend**: Node.js (ES Modules), Express 5
- **AI Engine**: Groq API via the OpenAI Node SDK (`baseURL: https://api.groq.com/openai/v1`)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (no heavy frontend framework dependencies)

---

## 📁 Project Structure

```
RaniBot/
├── .env                  # Environment variables & Groq API key
├── package.json          # Node dependencies and scripts
├── public/
│   ├── index.html        # Main web interface
│   ├── style.css         # Minimal dark design system & animations
│   └── app.js            # Frontend logic (chat, breathing orb, grounding)
└── src/
    ├── app.js            # Express server configuration & SYSTEM_PROMPT
    └── server.js         # HTTP server entry point (Port 3000)
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- A Groq API key (configured in `.env`)

### 2. Installation

Clone or open the repository directory and install dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create or update `.env` in the project root:

```env
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### 4. Running the Application

To start the server:

```bash
npm start
```

Or for development with automatic restart on file changes:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 API Reference

### `POST /api/chat`
Sends a message to Rani and returns the AI companion's response.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "message": "I feel overwhelmed with work and need a quick breathing exercise."
  }
  ```
- **Response**:
  ```json
  {
    "reply": "I hear how much you're carrying right now...",
    "model": "openai/gpt-oss-120b"
  }
  ```

*(Also supports plain text `text/plain` requests for backward compatibility).*

### `DELETE /api/chat`
Clears the current conversation turn history.

- **Response**:
  ```json
  {
    "success": true,
    "message": "Conversation history cleared."
  }
  ```

### `GET /api/health`
Health check endpoint reporting API status and model configuration.

---

## 🧠 System Prompt & Safety Architecture

Rani is guided by structured safety protocols:
1. **Compassionate Validation First**: Rani acknowledges and normalizes emotional strain before proposing perspective or coping tools.
2. **Digestible Length**: Responses are kept concise (2–3 short paragraphs) to avoid overwhelming individuals in high-stress states.
3. **Medical & Diagnostic Boundary**: Rani explicitly operates as an AI companion, never as a physician, psychotherapist, or psychiatric emergency service.
4. **Immediate Crisis Escalation**: If severe distress, self-harm, or suicidal ideation is detected, Rani prioritizes the user's safety and immediately surfaces direct 24/7 crisis hotlines.

---

## ⚠️ Important Disclaimer

> **Rani is an AI wellness assistant and does not provide clinical diagnosis, psychiatric therapy, or emergency medical treatment.**  
> If you or someone you know is in immediate distress or danger, please contact local emergency services or call **14416** (India) or **988** (US/Canada).
