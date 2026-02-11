# 🎓 TeachForAll

> **Empowering inclusive education through AI-generated, personalized learning resources.**

![Project Banner Placeholder](https://placehold.co/1200x400?text=TeachForAll+Banner)

## 📖 Overview

**TeachForAll** is an AI-powered platform designed to assist special education teachers, therapists, and parents in creating customized learning materials for students with diverse needs.

In inclusive classrooms, educators often struggle to find resources that match every student's specific communication level, sensory preferences, and cultural context. **TeachForAll** solves this by generating personalized **Social Stories**, **PECS (Picture Exchange Communication System) cards**, and **Adapted Worksheets** in seconds, tailored specifically to each child's unique profile.

## ✨ Key Features

- **👤 Smart Student Profiles**: Detail-rich profiles tracking communication levels, sensory preferences, interests, and AET (Autism Education Trust) progression framework levels.
- **📚 Instant Resource Generation**:
  - **Social Stories API**: Custom narratives to help students navigate social situations, with AI-generated illustrations.
  - **Visual Supports (PECS)**: On-demand communication cards for daily routines and vocabulary.
  - **Adapted Worksheets**: Skill-building exercises generated based on the student's current learning goals.
- **🌍 Multilingual Support**: seamless generation in **English** and **Arabic** (and more) to support diverse classrooms.
- **💾 Resource Library**: Save, organize, and reprint materials anytime.
- **🖼️ AI Image Synthesis**: Zero-setup image generation that creates consistent, child-friendly visuals for all materials.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)

### Backend
- **Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/)
- **Authentication**: Passport.js (Session-based)

### AI & Cloud
- **LLM**: [Google Gemini](https://deepmind.google/technologies/gemini/) (Text & Logic)
- **Image Generation**: Nano Banana (via Google AI Studio)
- **Storage**: Supabase Storage (for persisting generated assets)

## 🏗️ System Architecture

```mermaid
graph TD
    User[👩‍🏫 Teacher] -->|Manage Students| Client[💻 React Client]
    Client -->|REST API| Server[🚀 Express Server]
    
    subgraph "Backend Services"
        Server -->|Auth & Data| DB[(🗄️ Database)]
        Server -->|Prompt Engineering| GenAI[🧠 Google Gemini AI]
    end
    
    subgraph "Asset Management"
        GenAI -->|Generate Content| Server
        GenAI -->|Generate Images| Server
        Server -->|Store Images| Storage[☁️ Supabase Storage]
    end
```

## 🚀 Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database (or a Supabase project)
- Google AI Studio API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/teach-for-all.git
cd teach-for-all
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/teachforall

# AI Service
GEMINI_API_KEY=your_google_gemini_api_key

# Image Storage (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=5000
SESSION_SECRET=your_secret_key
```

### 4. Database Setup
Push the schema to your database:
```bash
npm run db:push
```

### 5. Run the Application
Start the development server (runs both client and server):
```bash
npm run dev
```
Access the app at `http://localhost:5000`.

## 📖 Usage Guide

1.  **Dashboard**: View your recent activity and quick stats.
2.  **Add a Student**: Go to the **Students** tab and create a profile. Be specific about their "Interests" (e.g., "Dinosaurs", "Trains") for better AI personalization.
3.  **Generate a Resource**:
    -   Navigate to generic **Generator** or select a student and click "Create Resource".
    -   Choose a type: **Story**, **PECS**, or **Worksheet**.
    -   Enter a topic (e.g., "Going to the Dentist").
    -   Click **Generate**.
4.  **Review & Save**: The AI will generate text and images. Review the content, then click **Save to Library**.

## 🧠 AI Implementation Details

The system uses a sophisticated **Prompt Library** (`server/promptLibrary.ts`) to construct AET Framework context-aware prompts.
- **Context Injection**: Student metadata (age, sensory needs) is injected into the system prompt to ensure appropriateness.
- **Structured Output**: We force the LLM to return strict JSON structures for consistent UI rendering.
- **Visuals**: Text prompts for images are derived from the generated story steps/vocabulary words and sent to the image generation model.

## 🛡️ Security & Privacy

- **Data Isolation**: Student data is logically separated by the creating teacher's account.
- **Authentication**: Secure session-based auth strategies.
- **Content Safety**: Google's safety filters are enabled on the model level to prevent inappropriate content generation.

## 🔮 Future Improvements

- [ ] **Mobile App**: Native app for parents to use resources on the go.
- [ ] **Teacher Community**: Sharing successful resources with other educators.
- [ ] **Voice Output**: Text-to-speech for generated stories.
- [ ] **Data Analytics**: Tracking student progress on worksheets over time.


---

Built with ❤️ for **Al Karamah School Hackathon 2026 @ 42 Abu Dhabi by Shahd, Kabita & Suhail.**