# GitHub Logo Upload Setup Guide

This project now supports **uploading logos directly from the web admin panel into your GitHub repository**.

---

## 1. How It Works

```
[Web Admin Panel]
       │
       ▼ (multipart/form-data)
[Spring Boot Backend on Render]
       │
       ▼ (GitHub Contents REST API with GITHUB_TOKEN)
[GitHub Repository: Stavroskiig/greek-football-logos]
       │  (File committed to frontend/src/assets/logos/{league}/{filename})
       ▼ (Webhook triggers auto-deploy)
[Vercel CI/CD Build]
       │  (Runs generate-logos-manifest.js & updates sitemap)
       ▼
[Live Website Updated!]
```

1. **Admin uploads logo** via `/admin/upload-logo` or from the **Team Manager** historical logos tab.
2. The **backend commits the file directly into GitHub** using a secure GitHub Token.
3. If assigned to a team, the backend immediately updates the PostgreSQL database record (`TeamLogo`).
4. **Vercel detects the new commit** on the `main` branch, rebuilds the site, runs `generate-logos-manifest.js`, and serves the new logo on your live CDN.

---

## 2. Generating Your GitHub Token

To allow the backend to commit files to your repo:

1. Go to [GitHub Tokens (Fine-grained personal access tokens)](https://github.com/settings/tokens?type=beta).
2. Click **"Generate new token"**.
3. Set the following settings:
   - **Token name:** `Greek Football Logos Admin Upload`
   - **Expiration:** Choose your preferred expiration (e.g. 90 days, 1 year, or Custom)
   - **Repository access:** Select **"Only select repositories"** -> Choose `Stavroskiig/greek-football-logos`.
   - **Permissions:**
     - Under **Repository permissions**, find **"Contents"** and select **"Access: Read and write"**.
4. Click **"Generate token"** and copy the generated token (`github_pat_...`).

---

## 3. Configuring the Backend on Render

1. Open your [Render Dashboard](https://dashboard.render.com/).
2. Select your backend service (`greek-football-logos-backend`).
3. Go to the **Environment** tab.
4. Add the following environment variable:
   - **Key:** `GITHUB_TOKEN`
   - **Value:** `<paste your github_pat_... token here>`
5. (Optional, defaults are already configured in `application.properties`):
   - `GITHUB_REPO_OWNER`: `Stavroskiig`
   - `GITHUB_REPO_NAME`: `greek-football-logos`
   - `GITHUB_BRANCH`: `main`
6. Click **Save Changes**. Render will automatically restart your backend.

---

## 4. How to Use the Feature

### Option A: Dedicated Logo Uploader (`/admin/upload-logo`)
1. Log in to the Admin panel at `/admin-login`.
2. Click the new **"Upload Logo"** tab in the admin navigation.
3. Drag & drop or browse for your image file (`.png`, `.svg`, `.webp`, `.jpg`).
4. Choose the target League / Folder (or type a custom folder name).
5. Specify the filename (without extension).
6. *(Optional)* Check **"Link this logo directly to an existing team"**, select the team, and choose whether it's the **Primary Logo** or a **Historical Logo** (with start and end years).
7. Click **"Commit & Upload to GitHub"**.
8. You will receive a success banner with a direct link to the commit on GitHub!

### Option B: Team Manager (`/admin/teams`)
1. Go to **Admin > Teams**.
2. Select a team from the list.
3. Switch to the **Historical Logos** tab.
4. Click **"Upload Image"** next to the Logo Path input.
5. Select the file: it will automatically upload to `assets/logos/history/`, commit to GitHub, link to the team, and update the UI!
