# 🚀 Developer Setup Guide

Welcome to the **Greek Football Logos** project! This guide will help you set up your local development environment from scratch on a new laptop (Windows, macOS, or Linux).

---

## 📋 Table of Contents
1. [Tech Stack Overview](#-tech-stack-overview)
2. [Prerequisites](#-prerequisites)
3. [Quick Start (Installation)](#-quick-start-installation)
   - [1. Clone Repository](#1-clone-repository)
   - [2. Frontend Setup (Angular 19)](#2-frontend-setup-angular-19)
   - [3. Backend Setup (Spring Boot 3 / Java 17)](#3-backend-setup-spring-boot-3--java-17)
4. [Environment Variables & Configuration](#-environment-variables--configuration)
5. [Useful Scripts & Commands](#-useful-scripts--commands)
6. [Admin Panel Access](#-admin-panel-access)
7. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🛠 Tech Stack Overview

- **Frontend:**
  - Angular 19 (Standalone components, SSR)
  - TypeScript & Tailwind CSS
  - Leaflet (Interactive Stadium Map)
  - Hosted on **Vercel** (`https://greek-football-logos.site`)
- **Backend:**
  - Java 17 + Spring Boot 3.2.4 (REST API, JPA / Hibernate, Flyway)
  - PostgreSQL Database
  - GitHub REST API integration for logo uploads
  - Hosted on **Render** (`https://greek-football-logos-backend.onrender.com`)

---

## 📦 Prerequisites

Before starting, make sure the following tools are installed on your computer:

| Tool | Recommended Version | Download Link | Verification Command |
| :--- | :--- | :--- | :--- |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `git --version` |
| **Node.js** | **v20 LTS** (or v18+) | [nodejs.org](https://nodejs.org/) | `node -v` & `npm -v` |
| **Java JDK** | **17 LTS** (Eclipse Temurin) | [adoptium.net](https://adoptium.net/) | `java -version` |
| **Apache Maven** | 3.9+ | [maven.apache.org](https://maven.apache.org/download.cgi) | `mvn -v` |
| **Angular CLI** | 19.x *(Optional)* | `npm install -g @angular/cli` | `ng version` |

> [!TIP]
> **Windows Users:**
> - Ensure **Node.js**, **Git**, and **Java** are added to your system `PATH` during installation.
> - After installing, **close and reopen your terminal / VS Code** so the updated `PATH` takes effect.

---

## ⚡ Quick Start (Installation)

### 1. Clone Repository

```bash
git clone https://github.com/Stavroskiig/greek-football-logos.git
cd greek-football-logos
```

---

### 2. Frontend Setup (Angular 19)

1. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Generate the logos manifest:
   ```bash
   npm run generate-logos
   ```

4. Start the Angular development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   👉 **`http://localhost:4200`**

> **Note on API proxying:**
> In development (`npm start`), Angular is configured in `src/environments/environment.development.ts` to call the backend at `http://localhost:8080/api`. If you don't run the backend locally, you can change `apiUrl` in `environment.development.ts` to `https://greek-football-logos-backend.onrender.com/api` to connect directly to the staging/production backend.

---

### 3. Backend Setup (Spring Boot 3 / Java 17)

1. Open a separate terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. **Database Options:**
   - **Option A (Local PostgreSQL with DBeaver):**
     1. Ensure PostgreSQL is running locally on port `5432` with a database named `greek_football_logos` (user `postgres`, password `stavros`).
     2. Open **DBeaver**, connect to `greek_football_logos`.
     3. Open the file **`backend/init-local-db.sql`** in DBeaver (or open a New SQL Script and paste its content) and click **Execute (Alt+X)**.
        *(This creates the baseline tables needed by Flyway migrations on a fresh installation).*
   - **Option B (Remote Database from Render):**
     Provide your remote database URL via environment variable:
     ```bash
     # PowerShell (Windows)
     $env:DATABASE_URL="jdbc:postgresql://<host>:5432/<db>"
     $env:DB_USERNAME="<user>"
     $env:DB_PASSWORD="<password>"

     # Bash (macOS / Linux)
     export DATABASE_URL="jdbc:postgresql://<host>:5432/<db>"
     export DB_USERNAME="<user>"
     export DB_PASSWORD="<password>"
     ```

3. Build and run the backend:
   ```bash
   mvn clean spring-boot:run
   ```

4. The backend will be running at:
   👉 **`http://localhost:8080`**
   - Health check: `http://localhost:8080/api/health`
   - Swagger / OpenAPI Docs: `http://localhost:8080/swagger-ui.html`

---

## 🔑 Environment Variables & Configuration

### Backend Environment Variables (`backend`)

| Variable | Description | Default (Local) | Production (Render) |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL JDBC Connection URL | `jdbc:postgresql://localhost:5432/greek_football_logos` | Configured on Render |
| `DB_USERNAME` | Database username | `postgres` | Configured on Render |
| `DB_PASSWORD` | Database password | `stavros` | Configured on Render |
| `PORT` | HTTP Server port | `8080` | Assigned by Render |
| `GITHUB_TOKEN` | GitHub Fine-Grained Personal Access Token with `Contents: Read/Write` (for admin logo uploads) | Empty (falls back to local disk in dev) | Set in Render Environment |
| `GITHUB_REPO_OWNER` | Owner of repository | `Stavroskiig` | `Stavroskiig` |
| `GITHUB_REPO_NAME` | Name of repository | `greek-football-logos` | `greek-football-logos` |
| `GITHUB_BRANCH` | Default branch | `main` | `main` |

> [!IMPORTANT]
> To enable web logo uploads directly to GitHub, generate a fine-grained token from [GitHub Settings](https://github.com/settings/tokens?type=beta) with **Repository permissions > Contents: Read and write** and export `GITHUB_TOKEN`. See [GITHUB_LOGO_UPLOAD_SETUP.md](file:///c:/Users/stavr/Documents/GitHub/greek-football-logos/GITHUB_LOGO_UPLOAD_SETUP.md) for full details.

---

## 📜 Useful Scripts & Commands

### Frontend (`cd frontend`)

- `npm start` – Run local Angular development server on `http://localhost:4200`.
- `npm run generate-logos` – Scans `src/assets/logos/`, updates `src/assets/logos-manifest.json`, and rebuilds `sitemap.xml`. (Runs automatically before `npm start` and `npm run build`).
- `npm run build:prod` – Compile production bundle to `dist/greek-football-logos/`.
- `npm test` – Run Karma unit tests.

### Backend (`cd backend`)

- `mvn clean spring-boot:run` – Run Spring Boot locally.
- `mvn clean package -DskipTests` – Build the production executable JAR (`target/api-0.0.1-SNAPSHOT.jar`).
- `docker build -t gfl-backend .` – Build containerized backend image using Dockerfile.

---

## 🛡 Admin Panel Access

1. Navigate to: `http://localhost:4200/admin` (or `/admin-login`).
2. **Admin Password:** `stavrosadmin` (defined in `frontend/src/app/services/admin.service.ts`).
3. **Features in Admin Panel:**
   - **Collections (`/admin/collections`):** Create and curate team logo collections.
   - **Teams (`/admin/teams`):** Edit team details, stadiums, colors, achievements, and historical logos.
   - **Upload Logo (`/admin/upload-logo`):** Drag-and-drop logo upload directly committing files to GitHub.
   - **Stadiums (`/admin/stadiums`):** Add & edit stadium locations for the interactive map.
   - **Tags (`/admin/tags`):** Manage classification tags.
   - **Sync Logos DB:** Button in the top header to sync all filesystem logos into PostgreSQL.

---

## ❓ Troubleshooting & FAQ

### Q: Why do I see TypeScript errors in VS Code like `"Cannot find module '@angular/core'"`?
**A:** You haven't run `npm install` yet! Open your terminal, go to `cd frontend`, and run `npm install`.

### Q: `node` or `mvn` is not recognized in terminal?
**A:**
1. Install Node.js from [nodejs.org](https://nodejs.org/) and Maven from [maven.apache.org](https://maven.apache.org/).
2. Make sure they are added to your environment `PATH`.
3. Restart your terminal or IDE.

### Q: Logos don't show up after adding new images?
**A:** Run `npm run generate-logos` inside `frontend/`. This script indexes all images in `src/assets/logos/` and generates `logos-manifest.json`.
