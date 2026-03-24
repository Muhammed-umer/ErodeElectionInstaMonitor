# Instagram Election Monitoring Dashboard - Project Report

## 1. Project Overview
The **Instagram Election Monitoring Dashboard** is a full-stack web application designed to track, aggregate, and analyze Instagram posts related to specific election hashtags. It fetches recent media from Instagram, performs sentiment analysis on the captions to determine public opinion (Positive, Negative, Neutral), and presents these insights on a web dashboard.

## 2. Technology Stack
The project utilizes the **MERN** stack along with modern frontend tools and machine learning APIs:
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide-react (icons), React Router DOM, Axios.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Bottleneck (rate limiting), Node-cron (scheduling).
- **External AI/APIs:**
  - **Facebook Graph API (v18.0):** Used to search for Instagram Hashtag IDs and retrieve recent media for those hashtags.
  - **HuggingFace Inference API:** Used to perform NLP sentiment analysis on post captions.

## 3. Architecture & Core Features

### Backend Architecture (`backend/src/`)
- **Models:**
  - `Post.js`: Stores captured Instagram posts including the `username`, `caption`, extracted `hashtags`, `timestamp`, `mediaType` (Post/Reel), and the computed `sentiment`. Posts are configured to auto-expire after 7 days.
  - `Hashtag.js`: Manages the tracked keywords and their mapped `igHashtagId` from the Instagram API.
  - `SystemConfig.js`: Stores the dynamically selected machine learning model.
- **Services:**
  - `instagramService.js`: Handles API calls to Facebook's Graph API. It is properly rate-limited using `bottleneck` (max 3 requests per minute) to prevent API bans. It fetches recent posts based on tracked keywords and avoids database duplication.
  - `scheduler.js`: Likely runs periodic automated tasks to pull new data for active hashtags seamlessly.
  - `sentimentService.js`: Routes captions to HuggingFace for analysis. It dynamically supports three different Natural Language Processing models: `distilbert`, `roberta` (Twitter RoBERTa), and `bertweet`, adapting to different response formats (e.g., "LABEL_2" vs "POSITIVE").

### Frontend Architecture (`frontend/src/`)
- A modern Single Page Application built with **Vite** and styled with **Tailwind CSS**.
- The main entry point is `Dashboard.jsx`, which acts as the control center to view analytics, sentiments, and tracked hashtags.

## 4. Project Progress (What has been done so far)
Based on the Git history and current state, the project was freshly initialized and significantly built out **today (March 24, 2026)**.

### Timeline of Contributions:
1. **Initial Setup (Muhammed Umer S):**
   - Initialized the foundational directory structures for both frontend and backend.
   - Built the basic project boilerplate and committed the setup (`10:32 AM` & `10:36 AM`).
2. **Database & Environment Setup (Muhammed Umer S):**
   - Configured the MongoDB local connection and modified the structure to adapt to local development instead of Atlas.
   - Added standard `.env.example` to guide key configuration (`11:29 AM` & `11:42 AM`).
3. **Core Development (Kishore-Krish19 & Muhammed Umer S):**
   - Pushed the functional logic spanning models, services, React components, and intelligent rate-limited API workers (`11:51 AM`).

### Current Run State:
- Both segments of the application are actively running on your machine:
  - **Frontend** (`npm run dev`) has been running flawlessly on `localhost` for about 24 minutes.
  - **Backend** (`npm start`) has been running for about 5 minutes.

## 5. Summary
You have successfully laid down a robust, production-ready foundation today. The architecture is highly scalable—incorporating rate limiters out of the box to respect Instagram's strict Graph API limits and allowing dynamic model-switching for sentiment analysis without fundamentally rewriting the pipeline.
