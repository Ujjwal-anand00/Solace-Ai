# Solace AI — Hackathon Presentation & Live Demo Script

**Project**: Solace AI — Intelligent Mental Wellness Companion  
**Target Duration**: 2.5 – 3.0 Minutes  
**Demo Persona**: **Sarah Chen**, 29-year-old Senior Software Engineer experiencing burnout, sleep difficulties, and deadline-related anxiety.

---

## Part 1: High-Impact Video Presentation Script (2.5 – 3.0 Minutes)

### [0:00 – 0:30] Hook & Problem Statement
*Visual: Title slide transition to Solace AI mobile app opening with a gentle fade-in of the Sage Green sanctuary interface.*

> **Presenter:**  
> "Over 1 in 5 adults live with a mental health condition, yet traditional wellness apps too often feel like cold clinical spreadsheets or rigid habit checklists. Meanwhile, modern AI chatbots can feel detached, robotic, or dangerously unmoored when a user is in genuine emotional distress—often indexing private thoughts without true consent.
>
> We built **Solace AI** to change that: a private, empathetic, and intelligent digital sanctuary that helps individuals feel, heal, and grow through mindful reflection, active support, and continuous emotional empowerment."

---

### [0:30 – 1:10] Core Innovation: Gemini Multi-Model Fallback & Emotional Intelligence
*Visual: Cut to AI Companion conversation. Show natural, contextual, trauma-informed response streaming in ~1.1 seconds.*

> **Presenter:**  
> "At the heart of Solace is our Google Gemini-powered Companion engine. We engineered an adaptive multi-model fallback pipeline anchored by `gemini-3.5-flash-lite`, automatically cascading to `gemini-3.1-flash-lite` and `gemini-3.5-flash` with sub-1.2-second response latency.
>
> Unlike generic LLM wrappers, Solace’s Companion operates under strict trauma-informed conversation rules. It doesn't lecture or dish out generic advice. It validates feelings, mirrors emotional energy, supports three user-selected tones—Gentle, Balanced, and Direct—and dynamically recommends grounding exercises right inside the chat.
>
> And safety is non-negotiable: the moment crisis signals or self-harm keywords are detected, Solace instantly transitions into a crisis safety protocol, prioritizing verified life-saving resources including the 988 Suicide & Crisis Lifeline and the 741741 Crisis Text Line."

---

### [1:10 – 1:45] The Sanctuary: Guided Care & Strict Consent Journaling
*Visual: Screen transitions through the Daily Mood Check-in, Box Breathing somatic animation, and into the Private Journal Sanctuary.*

> **Presenter:**  
> "Solace AI provides an end-to-end wellness toolkit:
> - **Daily Emotional Check-Ins** that track mood valence, intensity, and environmental triggers over time.
> - **Interactive Guided Somatic Practices** like Box Breathing and 4-7-8 Breathing with synchronized haptic pacing.
> - **Dynamic AI Wellness Plans** tailored from clinically informed stress and burnout assessments.
> - And our crown jewel: the **Private Journal Sanctuary**.
>
> Mental health notes demand absolute privacy. In Solace AI, journal entries are strictly partitioned. Content is never automatically passed to the AI Companion, training pipelines, or analytics. AI reflection insights are only generated when the user explicitly taps 'Request Reflection' and grants single-use consent. Without it, our backend privacy guard strictly refuses data exposure."

---

### [1:45 – 2:25] Robust Architecture & Hackathon Readiness
*Visual: Architecture diagram slide displaying Expo SDK 52 mobile client, Express.js server, MongoDB database, and `@solace/shared` contract library, followed by the terminal showing 100% test pass rate.*

> **Presenter:**  
> "Behind this serene experience is an enterprise-grade full-stack TypeScript monorepo:
> - **Mobile**: React Native 0.76 & Expo SDK 52, featuring NativeWind styling, Reanimated fluid transitions, and zero client-side API secrets.
> - **Server**: Express.js with Mongoose ODM, JWT token rotation, rate-limiting, and deep Gemini API integration.
> - **Integrations**: Zero mock fallbacks—every single user journey is live, verified, and backed by MongoDB.
> - **Quality Assurance**: Our automated end-to-end master test suite verifies 40 distinct user journeys across two isolated multi-tenant accounts with a 100% pass rate."

---

### [2:25 – 2:50] Conclusion & Call to Action
*Visual: Mobile app showing the Achievements screen unlocking 'Sanctuary Keeper' and the daily streak counter ticking to 7 days.*

> **Presenter:**  
> "Solace AI bridges the gap between conversational AI intelligence and deep, compassionate human care—proving that modern technology can be gentle, trustworthy, and deeply protective of our peace of mind.
>
> Solace AI is fully built, tested, and ready for release. Thank you."

---

## Part 2: Step-by-Step 16-Point Live Demo User Journey

Follow this exact sequence for live judging demonstrations or recorded screen captures using the **Sarah Chen** persona.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SARAH CHEN — DEMO PERSONA PROFILE                    │
├────────────────────────────────────────────────────────────────────────┤
│ • Name: Sarah Chen                                                     │
│ • Age: 29 | Occupation: Senior Software Engineer                       │
│ • Current State: High work stress, mental fatigue, restless sleep      │
│ • Goal: Decompress after work, express thoughts safely, reset focus   │
└────────────────────────────────────────────────────────────────────────┘
```

| Step # | Screen / Feature | User Action | Key Observation / Talking Point |
|---|---|---|---|
| **1** | **Splash & Onboarding** | Launch app; view fluid splash animation; tap "Begin Sanctuary". Select goals: *Stress Management*, *Better Sleep*, *Daily Reflection*. | Seamless onboarding persists user wellness preferences to local state and syncs to MongoDB. |
| **2** | **Account Registration** | Register as `sarah.chen@solace.demo` with secure credentials. | Demonstrates bcrypt hashing, JWT access token generation, and automatic session restoration. |
| **3** | **Home Sanctuary** | Land on Home Dashboard. Notice personalized greeting: *"Good evening, Sarah"* and Sage Green palette. | Spacing hierarchy is balanced; no floating gear icon or debug overlays; bottom tab bar docked cleanly. |
| **4** | **Daily Affirmation** | Read the daily affirmation card: *"I give myself permission to pause and breathe."* Tap the share icon. | Native share sheet opens; users can save or share daily uplifting affirmations. |
| **5** | **Daily Mood Check-In** | Tap "Anxious / Overwhelmed" mood chip. Adjust intensity slider to 7/10. Select tags: *Work*, *Deadlines*, *Fatigue*. Save check-in. | Instant persistence to MongoDB; dashboard immediately updates today's emotional state with color-coded feedback. |
| **6** | **AI Companion Entry** | Navigate to the AI Companion tab. Observe real-time status: *"Solace Companion • Online & Ready"* with subtle breathing mascot. | Lazy Google Gemini initialization with live status health check. |
| **7** | **Empathetic Dialogue** | Tap quick-starter: *"I'm feeling overwhelmed by work deadlines."* Send message. | Sub-1.2s response streaming via `gemini-3.5-flash-lite`. Response is empathetic, non-judgmental, and suggests a grounding pause. |
| **8** | **Tone Customization** | Tap Settings / Tone icon in chat header. Switch Companion Tone from *Balanced* to *Gentle*. Send a follow-up: *"I feel like I'm falling behind."* | Model dynamically adapts phrasing, providing gentler reassurance without lecturing or repeating generic advice. |
| **9** | **Crisis Safety Guardrail** | Send safety trigger: *"I just feel like giving up on everything, I can't take this anymore."* | Solace detects distress signals immediately and presents the Crisis Safety Protocol with direct links to **988 Lifeline** and **741741 Text Line**. |
| **10** | **Guided Somatic Breathing** | Navigate to Wellness tab. Select **Box Breathing (4-4-4-4)**. Complete a 1-minute cycle. | Reanimated expanding/contracting circle guides breath pacing with tactile haptic feedback on inhalation and holding. |
| **11** | **Clinical Wellness Assessment** | Navigate to Assessments. Launch **Stress Assessment (PSS-10)**. Submit answers reflecting high deadline pressure. | Server calculates clinical score and presents tailored recommendations based on validated scoring bands. |
| **12** | **AI Wellness Plan Generation** | Tap "Generate 7-Day Plan" focusing on *Stress Management* (15 min/day). | Server invokes Gemini to structure a customized 7-day progressive plan. Sarah activates the plan and completes Day 1's mindfulness task. |
| **13** | **Private Journal Sanctuary** | Open Journal tab. Tap "Write Freely". Title: *"Late Night Deployments"*. Body: *"Finally finished the sprint, but my heart is still racing."* | Saved with zero AI analysis by default. Entry is strictly private to Sarah. |
| **14** | **Consent-Based AI Reflection** | Open the entry. Notice the Privacy Notice: *"AI reflection requires explicit consent"*. Tap "Request Reflection" with consent toggle ON. | Server verifies explicit `consent: true` and generates a compassionate, strength-based reflection analyzing emotional subtext. |
| **15** | **Resource Library** | Open Resource Library tab. Browse "Managing Burnout". Bookmark article and mark reading as completed. | Curated educational content; updates user reading metrics and progress achievements. |
| **16** | **Profile, GDPR Data & Security** | Open Profile tab. View earned achievements ("First Reflection", "Sanctuary Keeper"), export personal data as JSON, and view privacy toggles. | Full user data autonomy: transparent data export and instantaneous cascading account deletion available on demand. |

---

## Part 3: Judge & Evaluator FAQ / Talking Points

### Q1: How does Solace AI prevent AI hallucinations or dangerous mental health advice?
> **Answer**:  
> "Solace AI enforces a 3-layer safety architecture:  
> 1. **Trauma-Informed System Guardrails**: The companion prompt strictly prohibits clinical diagnosing, prescribing, or replacing professional therapists.  
> 2. **Rule-Based Crisis Interceptor**: Mentions of suicide, self-harm, or severe crisis bypass standard LLM processing and trigger verified crisis resources (988 Lifeline and Crisis Text Line 741741) with prominent visual alerts.  
> 3. **Structured Outputs**: Plans and assessments use strict Zod schemas, preventing malformed or dangerous prompt injections."

### Q2: Why is the Journal feature separated from the AI Companion?
> **Answer**:  
> "Mental health privacy is our highest priority. Users will not be honest in a digital journal if they fear their deepest vulnerabilities are silently feeding an AI model or profile. Solace AI enforces a cryptographic and architectural separation: journal entries are encrypted and stored in an isolated collection. The AI backend will refuse to generate reflections unless an explicit, single-use `consent: true` payload is passed by the user."

### Q3: What happens if the Gemini API has an outage or rate limit?
> **Answer**:  
> "We implemented an enterprise-grade multi-model fallback chain: `gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-3-flash-preview` -> `gemini-3.5-flash`. If Google experiences regional rate limiting, the server seamlessly falls back without user disruption. Furthermore, all core mindfulness tools, breathing guides, mood tracking, and journals operate 100% independently of third-party AI availability."

### Q4: Is this a working prototype or a production-ready application?
> **Answer**:  
> "It is a production-ready, fully integrated system. The mobile app compiles to Android APK via EAS and runs cleanly in Expo Go. The backend runs on Node.js/Express with MongoDB, complete with rate limiting, JWT token rotation, and zero mock fallbacks. Our automated master verification suite tests 40 end-to-end integration journeys with a 100% pass rate."

