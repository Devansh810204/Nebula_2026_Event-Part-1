# 🚀 Nebula 2026 Coding Challenge — Deployment & Admin Guide

This guide details how to run the Nebula 2026 event application locally and deploy it as a high-performance Web Service on **Render** so all participating teams and admins can access it from any laptop or mobile device.

---

## 🌟 System Overview & Features

1. **Lightweight & High-Performance Architecture**:
   - Single Node.js + Express web service.
   - Real-time live synchronization using **Socket.IO** (instant disqualification notifications, live leaderboard updates, and team status).
   - Multi-language compiler engine (**Python 3, Java, C, C++**) powered by an isolated sandbox runner (Piston API) with native fallback.
   - Pre-seeded with **80 Participating Teams** (`team01` to `team80`) and **20 Curated DSA & Aptitude Questions**.

2. **Mystery Letter Unlock Loop**:
   - Each question has an assigned mystery character (e.g. `N`, `E`, `B`, `U`, `L`, `A`, `2`, `6`, etc.).
   - When a team solves a question correctly, a celebration pop-up modal reveals their unlocked letter.
   - When **8 characters are unlocked**, a grand celebration modal displays the full sequence, records the team's completion time, and automatically logs them out.
   - Finished teams cannot log back in.

3. **Strict Full-Screen Proctoring & Anti-Cheat**:
   - Fullscreen is mandatory upon starting the challenge.
   - **Strike 1 (Attempt 1)**: Screen freezes completely with a high-priority warning modal. The participant cannot touch or edit code until they click "I Understand — Re-enter Full-Screen".
   - **Strike 2 (Attempt 2)**: Immediate disqualification! The team is locked out and logged out. The admin portal receives an instant audio-visual alert.
   - Question text copying is blocked.
   - Team Name is watermarked repeatedly in a diagonal pattern across the entire background, along with the Nebula logo, to prevent photo leaks.

4. **Admin Command Center**:
   - **Live Leaderboard**: Real-time ranks sorted by letters unlocked, questions solved, and speed.
   - **Team Manager (80+ Teams)**: View credentials, edit names/passwords, filter by status, and **Re-Qualify** any team with one click if they were accidentally disqualified.
   - **CSV Export**: One-click download of all 80 team logins and passwords to print participant slips.
   - **Question Manager**: Add, edit, or delete questions; adjust the 10-minute timer per question; customize mystery letters.

---

## 💻 Local Testing & Verification

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser:
   - **Contest Login**: [http://localhost:3000](http://localhost:3000)
   - **Admin Command Center**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Default Credentials:
- **Admin**:
  - Username: `admin`
  - Password: `adminnebula2026`
- **Sample Teams (80 Available)**:
  - Team 1: ID `team01` | Password `nebula@01`
  - Team 2: ID `team02` | Password `nebula@02`
  - ...
  - Team 80: ID `team80` | Password `nebula@80`
  *(You can view/export all 80 passwords inside the Admin Portal via "Export CSV")*

---

## ☁️ Deploying to Render (Free Web Service)

Follow these step-by-step instructions to get your public URL (e.g., `https://nebula-2026.onrender.com`):

### Step 1: Push Code to GitHub
1. Initialize a git repository if not already done:
   ```bash
   git add .
   git commit -m "Nebula 2026 Contest App"
   ```
2. Create a new repository on your GitHub account (public or private).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/nebula-2026.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create a Web Service on Render
1. Go to [https://render.com](https://render.com) and log in.
2. In your Render Dashboard, click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `nebula-2026-challenge` (or your chosen name)
   - **Region**: Choose the region closest to your college (e.g. `Singapore` or `Frankfurt`)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Configure Environment Variables
Under **Environment Variables**, add the following keys:
| Key | Recommended Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `ADMIN_USER` | `admin` | Your admin username |
| `ADMIN_PASS` | `adminnebula2026` | Change to any strong password |
| `JWT_SECRET` | `nebula_super_secret_key_2026` | Any random secret string |

### Step 4: Deploy
1. Click **Create Web Service**.
2. Render will automatically build the service, install packages, and launch the server.
3. Once the build finishes, Render will provide your public URL (e.g. `https://nebula-2026-challenge.onrender.com`).
4. Share this URL with participants and projecting screens!

---

## 📋 Pre-Contest Organizer Checklist

1. Log into the **Admin Portal** (`/admin`).
2. Click **📥 Export CSV** to download `nebula_teams_credentials.csv`.
3. Print or share the team ID & passwords with participants.
4. Review the 20 pre-populated DSA questions and verify test cases.
5. If any student gets disqualified due to accidental OS popups or trackpad gestures, open the **Team Management** tab in the Admin Portal and click the green **✓ Re-Qualify** button to let them resume immediately.
