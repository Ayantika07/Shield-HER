# SHIELD HER — Women's Safety & Digital Protection Platform

> **Tagline:** Your Safety. Your Privacy. Your Power.  
> **Hackathon:** recHERsion'26  
> **Target Audience:** Women, students, working professionals, digital citizens, and emergency response allies.

---

## 🌟 Executive Summary

**SHIELD HER** is an integrated, human-centered physical safety, digital protection, emergency assistance, and offline preparedness web application engineered for the **recHERsion'26** hackathon. 

Rather than relying on superficial mockups, generic card grids, or deceptive promises of automatic police intervention, **SHIELD HER** is built as a functional Minimum Viable Product (MVP). It combines a high-performance **React + Vite** frontend, a dark-navy accessible design system, **IndexedDB** client-side forensic storage, a **Leaflet GPS** resource map, a multi-tier **AI / Heuristic Cyber Harassment Detector**, and an optional **Node.js Express** authentication backend.

---

## 🛡️ Core Platform Modules

### 1. Discreet SOS & Emergency Assistance
- **Indian National Emergency 112 & Women Helpline 1091:** One-tap calling protocols.
- **Accidental Trigger Shield:** 5-second countdown with an immediate cancel button to prevent accidental emergency activation.
- **Live GPS Broadcasting:** Precise latitude, longitude, accuracy radius, and street-level reverse geocoding.
- **Multi-Channel Distribution:** Native Web Share API integration (WhatsApp / SMS / Telegram) + direct clipboard formatting.
- **Privacy Disguise Mode:** Instant one-click transformation into an interactive functional notepad or scientific calculator.

### 2. Safe Journey Companion
- **Real-Time Transit Monitoring:** Enter origin, destination, vehicle details (cab number, auto, metro), and expected arrival time (ETA).
- **Automated Check-In Reminders:** "I'm Safe" check-in button with timed intervals (10, 15, 30, 45 mins).
- **Missed Check-In Alerting:** Escalates alert banners and enables one-click status sharing if a check-in is overdue.
- **Historical Transit Log:** Stored in IndexedDB for personal accountability and travel timelines.

### 3. AI Cyber Harassment & Threat Detector
- **Dual-Engine Architecture:** Local rule-based safety heuristics engine (works 100% offline without sending private chats to servers) + optional **Google Gemini API** integration.
- **Three-Tier Risk Classification:** *Safe*, *Suspicious*, or *Potentially Dangerous*.
- **Forensic Indicator Flagging:** Flags bodily harm threats, extortion / non-consensual imagery blackmail, location stalking, unsolicited persistence, and misogynistic slurs.
- **One-Click Evidence Transfer:** Instantly packages the analyzed message and risk report into the Private Evidence Locker.
- **Hackathon Test Presets:** Built-in sample messages for rapid judge evaluation.

### 4. Private Evidence Locker
- **Local Forensic Repository:** Stores incident reports, suspect handles, locations, dates, and file attachments (screenshots, PDFs) inside browser IndexedDB.
- **Zero Third-Party Leaks:** Evidence is stored locally on the user's device and is never uploaded without explicit consent.
- **Search & Filter:** Category filters and instant keyword search.
- **Dossier Export:** Export all records into a single portable `.json` file for legal counsel or police submission.

### 5. GPS Safety Map & Resource Hub
- **Interactive Leaflet Mapping:** High-contrast dark map tiles with categorized color-coded markers.
- **Categories Covered:** 24x7 Police Stations with Women Help Desks, Emergency Hospitals & Trauma Centers, Metro Stations with CISF / RPF booths, and Illuminated Safe Havens / 24x7 Pharmacies.
- **Location Centering:** One-tap GPS centering on user coordinates.
- **Accessible Directory List:** Switch between interactive map and accessible text directory.
- **Offline Cache:** Essential emergency locations are cached in IndexedDB and remain accessible without an active internet connection.

### 6. Official Women's Police Assistance & Escort Protocols
- **Official Emergency Numbers:** 112 (National Emergency), 1091 (Women in Distress), 1930 (National Cyber Crime Helpline).
- **Night Patrol & Safe Escort Guidance:** Step-by-step instructions for utilizing official police night-drop programs (e.g., Delhi Police PCR night drops, Bengaluru Pink Hoysalas, Mumbai Nirbhaya Squads).
- **Official Complaint Reference Tracker:** Lets users log their 112 CAD or police FIR reference numbers, investigating officer names, and contact details for follow-up.
- **Direct Portal Links:** Verified links to `cybercrime.gov.in`, `ncw.nic.in`, and `112.gov.in`.

### 7. Digital Privacy Guardian
- **Interactive Security Checklist:** Practical audits across 2FA, password strength, social media lock-downs, continuous app location permissions, and breach recovery.
- **Progress Tracking:** Live progress bar and completion percentage.
- **Step-by-Step Action Guides:** Concise "How to complete" steps in plain language.

### 8. Offline Safety Mode & Crisis Handbook
- **PWA Service Worker:** Caches application shell and assets for offline use.
- **Zero-Internet Readiness:** Saved emergency contacts and safety instructions are fully accessible offline.
- **Actionable Emergency Handbook:**
  - Street Safety & Confrontation Protocols
  - First 10 Minutes: Cyber Extortion & Intimate Image Leaks (StopNCII.org integration)
  - Legal Rights of Women in India (Right to Zero FIR, Section 46(4) CrPC arrest restrictions, Section 164 private statements).

### 9. Low-Battery Safety Reminder
- **Hardware Sensor Integration:** Monitors live battery level and charging state via `navigator.getBattery()`.
- **Configurable Threshold:** Adjustable warning slider (10% to 30%).
- **Low-Battery Advisory:** Triggers actionable recommendations to message contacts and pre-cache routes before the device powers down.
- **Evaluator Simulator:** Built-in toggle to test low-battery behavior on desktop browsers.

---

## 💻 Windows Setup & Beginner Instructions

Follow these step-by-step instructions to run **SHIELD HER** on any Windows 10/11 computer.

### Step 1: Install Node.js LTS
1. Download the latest **LTS version** of Node.js from [nodejs.org](https://nodejs.org/).
2. Run the installer and accept default settings.
3. Open Windows PowerShell and verify installation:
   ```powershell
   node -v
   npm.cmd -v
   ```

> **Windows PowerShell Execution Policy Note:** If Windows displays `File npm.ps1 cannot be loaded because running scripts is disabled`, use `npm.cmd` instead of `npm`, or run:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

### Step 2: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Go to **File > Open Folder...** and select the `Shield HER` folder.
3. Open the integrated terminal in VS Code by pressing **`` Ctrl + ` ``** (Ctrl + Backtick).

---

### Step 3: Install Frontend Dependencies
In the root directory terminal, run:
```powershell
npm.cmd install
```
This installs `react`, `react-dom`, `react-router-dom`, `leaflet`, `react-leaflet`, `lucide-react`, and `idb`.

---

### Step 4: Install Backend Dependencies (Optional but Recommended)
Open a second terminal window or navigate into `server/`:
```powershell
cd server
npm.cmd install
cd ..
```

---

### Step 5: Start the Application

#### Option A: Running the Frontend (Dual-Mode / Instant Demo)
In the root folder:
```powershell
npm.cmd run dev
```
Open your browser to: **`http://localhost:5173/`**

#### Option B: Running Both Frontend & Backend
- **Terminal 1 (Backend API on port 5000):**
  ```powershell
  cd server
  npm.cmd start
  ```
- **Terminal 2 (Frontend on port 5173):**
  ```powershell
  npm.cmd run dev
  ```

---

### Step 6: Quick Demo Login for Hackathon Judges
On the login screen, click the **⚡ Instant Demo Access** button to sign in immediately as **Aanya Sharma** (`aanya.sharma@shieldher.org`). No password typing is needed for evaluation.

---

### Step 7: Build for Production
To generate the optimized production bundle:
```powershell
npm.cmd run build
```
The compiled static assets will be created in the `dist/` directory.

---

### Step 8: Deploy to GitHub
In the root folder terminal:
```powershell
git init
git add .
git commit -m "feat: complete SHIELD HER platform for recHERsion'26"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/shield-her.git
git push -u origin main
```

---

### Step 9: Free Cloud Deployment
- **Frontend (Vercel):** Connect your GitHub repository to [Vercel](https://vercel.com/) with root directory set to `./`, framework preset `Vite`, and build command `npm run build`.
- **Backend (Render):** Deploy the `server` directory on [Render](https://render.com/) as a free Web Service running `node server.js`.

---

## 🔒 Security, Privacy & Architectural Ethics

- **No Plaintext Passwords:** Backend authentication uses 10 rounds of `bcryptjs` password hashing and signed JWT tokens.
- **Client-Side Data Sovereignty:** Incident evidence and GPS coordinates remain on the user's personal device in IndexedDB. No automatic data transmission occurs without deliberate user sharing.
- **Realistic Safety Expectations:** The platform explicitly avoids misleading users into believing that clicking a web button magically dispatches armed police. It connects users directly to certified cellular emergency dialers (`tel:112`) and official government reporting infrastructures.

---

## 🏆 Hackathon Submission Metadata

- **Project Name:** SHIELD HER
- **Hackathon:** recHERsion'26
- **Status:** Complete Functional MVP (0 Dead Buttons, 0 Mock Stubs)
- **Built with:** React 19, Vite, Leaflet, Lucide, IndexedDB, Node.js, Express.
