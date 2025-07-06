# Dial-112_Analyzer
Initial commit: Complete "Dial 112 Analyzer" Web App for Andhra Pradesh Police Use Case 5.

Features:
- Audio transcription and metadata extraction pipeline (Telugu & English)
- Crime type/subtype classification and severity tagging
- Interactive geolocation resolution with Google Maps API
- Ticket creation (JSON format) with timestamp, location, and caller metadata
- Real-time heatmap visualization of incidents by crime category
- Modular UI for audio upload, transcript view, and expanded analysis
- MUI-based modern dashboard with dark theme support
- Markdown rendering for detailed crime ticket information
- Error handling, retries, and multi-turn chatbot simulation

This application supports both batch audio uploads and live Voice AI agent workflows for rapid emergency call classification and visualization.


# 📞 Dial 112 Analyzer – AP Police Emergency Call Dashboard

A modern web-based AI tool designed to streamline emergency response workflows by transcribing, classifying, and visualizing 112 emergency calls. Built for Use Case 5 of the Andhra Pradesh Police AI Hackathon in collaboration with 4SightAI.

---

## 🚨 Problem Statement

The Central Command Center handles hundreds of emergency (Dial 112) calls daily. Legacy systems require manual data entry, leading to operator fatigue, missed context, and delayed insights.

---

## 🌟 Project Features

### 🧠 AI-Powered Call Handling
- Converts Telugu/English audio into structured text
- Extracts: caller info, incident time, crime type & subtype, freeform summary
- Auto-detects and confirms precise GPS coordinates via spoken landmark descriptions

### 🌍 Real-Time Heatmap Visualization
- Dynamic, interactive map of incidents across Andhra Pradesh
- Filter by crime type/subtype, severity, or date
- Timeline slider for viewing past-hour, day, or custom windows

### 💬 Voice AI Agent Simulation
- Simulates a multi-turn chatbot that interacts with callers
- Collects incident details in a natural conversation
- Performs fallback prompts for unclear input

---

## 🧩 Tech Stack

- **Frontend:** React.js, MUI v5 (Material UI), Tailwind CSS
- **State Management:** React Hooks
- **Visualization:** Recharts, Map APIs (e.g., Google Maps)
- **Speech Processing:** Whisper / Vosk (for ASR)
- **Markdown Rendering:** `markdown-to-jsx`
- **Backend (optional):** Node.js + PostgreSQL (for ticket persistence)

---
