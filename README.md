# 🎙️ RescueVoice

## Interrupt. Correct. Continue.

RescueVoice is a realtime AI voice agent designed to handle one of the biggest problems in voice interaction: what happens when the user interrupts the AI or changes their request while the system is still speaking or processing?

Instead of continuing with an outdated request, RescueVoice immediately stops obsolete speech, invalidates the previous request, protects the conversation from stale results, and continues with the user's latest instruction.

---

## 🚨 The Problem

Traditional voice AI systems usually follow this flow:

**User speaks → AI processes → AI responds**

But real conversations are not perfectly sequential.

Users can:

- Interrupt the AI
- Correct themselves
- Change requirements
- Add new constraints
- Change their mind while the AI is processing
- Interrupt while a tool or API is still running

For example:

**USER:**

"Find me the cheapest train from Chennai to Bangalore tomorrow evening."

**AI:**

"I found three options. The cheapest one—"

**USER:**

"Wait! Not Bangalore. Hyderabad."

A poorly designed voice agent may continue speaking about Bangalore or allow the old result to return later and interfere with the updated request.

RescueVoice is designed to solve this problem.

---

# 💡 Our Solution

RescueVoice treats an interruption as a **state change**, not as noise.

The core principle is:

> **The latest user intention always wins.**

### Core Flow

```text
🎙️ User speaks
       ↓
🧠 AI processes request
       ↓
🔊 AI starts responding
       ↓
🛑 User interrupts
       ↓
⚡ Current response stops
       ↓
❌ Old request becomes obsolete
       ↓
🆕 New request becomes active
       ↓
🔎 Updated request is processed
       ↓
🔊 Correct response is spoken
```

---

# ✨ What Makes RescueVoice Different?

RescueVoice is not just another AI voice chatbot.

Its core innovation is an **Interruption & Recovery Manager** that keeps the conversation synchronized with the user's latest intent.

When an interruption happens:

### 1. STOP

Obsolete speech is stopped as quickly as possible.

### 2. INVALIDATE

The previous request is marked as obsolete.

### 3. RECOVER

Relevant conversation context is preserved.

### 4. RE-PLAN

The user's updated instruction becomes the active request.

### 5. PROTECT

Stale tool results are prevented from overwriting the current state.

### 6. CONTINUE

The agent responds according to the latest user intention.

---

# 🧠 Example

### Initial request

**USER:**

"Find me the cheapest train from Chennai to Bangalore tomorrow evening."

The agent begins processing and speaking.

### User interrupts

**USER:**

"Wait! Make it Hyderabad."

RescueVoice changes the conversation state:

```text
REQUEST #21
Chennai → Bangalore
❌ CANCELLED

        ↓

REQUEST #22
Chennai → Hyderabad
🟢 ACTIVE
```

If Request #21 finishes later, its result is treated as stale and is rejected.

Only Request #22 is allowed to control the final response.

---

# 🔥 Core Technical Innovation

## Request Versioning

Every request receives a unique request ID or generation number.

Example:

```text
Request #21 → ACTIVE
```

After interruption:

```text
Request #21 → CANCELLED

Request #22 → ACTIVE
```

If the old request finishes later:

```text
Request #21 result arrives
        ↓
Is Request #21 still active?
        ↓
       NO
        ↓
🚫 Reject stale result
```

This prevents asynchronous race conditions from causing outdated responses.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │      USER        │
                    │  Voice / Speech  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Speech-to-Text  │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌───────────────────────┐
                  │ Conversation State   │
                  │ + Request Versioning │
                  └──────────┬────────────┘
                             │
                     ┌───────┴────────┐
                     │                │
                     ▼                ▼
              ┌────────────┐   ┌─────────────┐
              │ LLM / Agent│   │ Tool / API  │
              └──────┬─────┘   └──────┬──────┘
                     │                │
                     └───────┬────────┘
                             ▼
                  ┌─────────────────────┐
                  │ Interruption &      │
                  │ Recovery Manager    │
                  └──────────┬──────────┘
                             │
                             ▼
                       ┌───────────┐
                       │ Rime TTS  │
                       └─────┬─────┘
                             │
                             ▼
                    🔊 Spoken Response
```

---

# 🎯 The Hard Voice Problem We Solve

RescueVoice focuses on:

## Realtime Interruption & Recovery

The system is designed for situations where:

- The AI is speaking
- A tool is still running
- The user changes the request
- The previous result arrives later

The goal is to keep the application consistent with the user's **latest instruction**.

Voice is not an optional feature in RescueVoice. It is the core interaction mechanism.

---

# 🎙️ Why Rime?

Rime provides the primary spoken output of the system.

The voice pipeline is:

```text
User Voice
    ↓
Speech Recognition
    ↓
Conversation State
    ↓
LLM / Tool
    ↓
Interruption & Recovery Manager
    ↓
Rime TTS
    ↓
🔊 Spoken Response
```

Rime is therefore an essential part of the actual product experience rather than a simple welcome message or optional playback.

---

# 🖥️ Product Experience

RescueVoice is designed around a focused realtime interface.

### 🎙️ Live Voice Agent

The main screen allows the user to speak naturally and see the current voice state.

Possible states include:

- Listening
- Thinking
- Speaking
- Interrupted
- Recovering
- Tool Running
- Completed
- Error

### 🔄 Conversation State

Displays:

- Current request
- Request ID
- Active status
- Cancelled requests
- Updated requests

### 🧾 Request Timeline

Shows exactly what happened during the interaction.

Example:

```text
09:42:18  User started request
09:42:20  Tool execution started
09:42:21  Agent started speaking
09:42:22  USER INTERRUPTED
09:42:22  Previous audio cancelled
09:42:22  Request #21 invalidated
09:42:23  Request #22 created
09:42:24  Updated response generated
```

### 📊 Evidence & Metrics

Displays measurable behaviour such as:

- First-audio latency
- Interruption response time
- State consistency
- Stale-result protection
- Recovery status

### 🧩 Architecture View

Provides a visual explanation of the complete realtime voice pipeline.

---

# 🧪 Acceptance Test

The main RescueVoice acceptance test is:

```text
1. Start a voice request
2. Delay the tool response
3. Let the agent begin speaking
4. Interrupt the agent
5. Change one part of the request
6. Verify that old audio stops
7. Verify that the old request is invalidated
8. Verify that the new request becomes active
9. Allow the old tool result to return
10. Verify that the stale result is rejected
11. Verify that the final response reflects the new request
```

### Expected Result

```text
Audio cancellation       ✅
Request invalidation     ✅
New state activation     ✅
Stale result protection  ✅
Correct final response   ✅
```

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React / Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Realtime Transport | LiveKit |
| Speech Recognition | STT Provider |
| Reasoning | LLM |
| Voice Output | Rime |
| Backend | Node.js |
| Testing | Interruption & Recovery Tests |

---

# 📂 Project Structure

```text
RescueVoice/
│
├── frontend/
├── backend/
├── tests/
│   └── interruption-test/
├── docs/
├── demo/
│
├── README.md
├── RIME_EVIDENCE.md
├── .env.example
└── .gitignore
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
cd RescueVoice
```

## 2. Install dependencies

```bash
npm install
```

If frontend and backend are separated:

```bash
cd frontend
npm install

cd ../backend
npm install
```

## 3. Configure environment variables

Create a `.env` file using `.env.example` as a template.

Add your own API credentials.

Never commit `.env` or private API keys to the repository.

## 4. Start the application

Run the development commands described in the project setup instructions.

## 5. Open the application

Open the local development URL shown by the development server.

---

# 🎬 Hackathon Demo

The main demonstration uses a travel-planning scenario.

### Step 1

**USER:**

"Find me the cheapest train from Chennai to Bangalore tomorrow evening."

### Step 2

The agent starts processing the request.

### Step 3

The agent begins speaking.

### Step 4

The user interrupts:

"Wait! Make it Hyderabad."

### Step 5

RescueVoice immediately:

```text
🛑 Stops obsolete speech
❌ Invalidates Request #21
🆕 Creates Request #22
🔎 Processes the updated request
🔊 Speaks the corrected response
```

### Step 6

A delayed result from Request #21 arrives.

RescueVoice rejects it because the request is no longer active.

---

# 📈 Why This Matters

Real users do not communicate with AI in perfectly isolated turns.

They interrupt.

They correct themselves.

They change their minds.

They add information.

A reliable realtime AI agent therefore needs more than good speech generation.

It needs reliable **conversation-state management**.

RescueVoice focuses on this problem:

> **Keeping AI behaviour synchronized with human intent in realtime.**

---

# 🔮 Future Scope

The RescueVoice architecture can be extended to support:

- Multilingual voice interaction
- Hands-free productivity
- Customer support
- Healthcare assistance
- Voice-based travel planning
- Realtime booking systems
- Telephony agents
- Accessibility applications
- Long-running autonomous tasks
- Multi-tool voice agents

---

# ⚠️ Known Limitations

This hackathon prototype prioritizes interruption and recovery over feature breadth.

Potential limitations include:

- Third-party API latency
- Browser microphone behaviour
- Network instability
- Speech recognition errors
- External tool availability
- Device-dependent realtime performance

These limitations are documented rather than hidden.

---

# 🔐 Security

Never commit:

```text
.env
API keys
Rime credentials
LLM credentials
LiveKit secrets
```

Use:

```text
.env.example
```

for configuration documentation.

---

# 🧪 Evidence

Detailed acceptance-test information and reproducibility notes are available in:

```text
RIME_EVIDENCE.md
```

This document contains the central voice claim, acceptance test, procedure, expected behaviour, measurements and limitations.

---

# 👥 Project Information

**Project:** RescueVoice  
**Track:** Rime Voice AI Challenge  
**Focus:** Realtime Interruption & Recovery

### Built Around

**Realtime AI × Voice × State Management × Reliability**

---

# ❤️ The Idea in One Line

> **RescueVoice is a realtime voice agent that can be interrupted, discard obsolete work, understand the correction, and continue from the user's latest intent.**

## ⭐ Interrupt. Correct. Continue.
