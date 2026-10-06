# Friendship Test ❤️

A lightweight, cute, animated friendship quiz web platform. One user creates a custom friendship test, generates a unique shareable link, and sends it to their friend. The friend answers the questions and submits them. **The friend NEVER sees the answers or owner dashboard.** Only the test owner can privately view the submitted answers and compare them with the expected answers!

---

## 🧸 Architecture & Render Deployment

The application is engineered for **seamless deployment on Render** as a unified single Web Service:

```text
Browser
   ↓
https://your-app.onrender.com
   ↓
FastAPI Web App (Docker)
   ├── REST API (/api/public, /api/owner, /health)
   └── React SPA Static Files (Vite build)
        ↓
    Render PostgreSQL
```

- **One deployment, one domain**: No CORS issues or separate frontend hosting required.
- **Optimized Performance**: Mobile-first, lightweight vector SVG animations (original Teddy character), respects `prefers-reduced-motion: reduce`.
- **Private Server-Side Storage**: Text normalization (casing, punctuation, whitespaces), multiple accepted answers, zero data leak on submit.

---

## 🚀 Deploy to Render

### Option 1: Automatic Blueprint (Recommended)
1. Push this repository to your GitHub account.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml`.
5. Render will provision:
   - A **PostgreSQL Database** (`friendship-test-db`)
   - A **Web Service** (`friendship-test`) using the multi-stage `Dockerfile`.
6. Click **Apply**.
7. Once deployed, Render will provide your public URL (e.g. `https://friendship-test-xxxx.onrender.com`).
8. (Optional) Set `PUBLIC_BASE_URL` in the Web Service environment variables to your custom domain or Render URL. If omitted, the service automatically detects the incoming request host!

### Option 2: Manual Render Setup
1. Create a **PostgreSQL** database on Render:
   - Name: `friendship-test-db`
   - Copy the **Internal Database URL**.
2. Create a **Web Service** on Render:
   - Connect repository.
   - Runtime: **Docker**
   - Health Check Path: `/health`
   - Set Environment Variables:
     - `DATABASE_URL`: Your Render PostgreSQL Internal URL
     - `ENVIRONMENT`: `production`
     - `SECRET_KEY`: (Click Generate)
     - `SESSION_SECRET`: (Click Generate)
     - `PUBLIC_BASE_URL`: `https://your-service-name.onrender.com`

---

## 🔒 Security & Privacy Guarantees

1. **Owner Authentication ≠ Responder Token**:
   - Responder token (`/test/{token}`) allows **only** reading sanitized public questions and submitting answers.
   - Owner actions (`/api/owner/*`) require an owner session token. Responder tokens can never authorize owner endpoints.
2. **Strict Responder API Privacy**:
   - `POST /api/public/tests/{token}/submit` returns **strictly**:
     ```json
     {
       "success": true,
       "message": "Answers submitted successfully"
     }
     ```
   - It **never** returns `score`, `percentage`, `is_correct`, or expected answers.
3. **Duplicate Submission Protection**:
   - Once a responder submits, the test is marked completed. Further submissions are rejected with a friendly message.
4. **Link Rotation**:
   - Owners can click "Generate New Link" at any time to invalidate a leaked responder token without losing question data.

---

## 🧪 Verification & Acceptance Tests

Before production, verify the acceptance test matrix:

- **Test A (Public View)**: Open `/test/{token}`. Verify questions and options appear without showing correct answers.
- **Test B (Network Inspection)**: Inspect network tab for `GET /api/public/tests/{token}`. Verify `correctAnswer` and `acceptedAnswers` are absent.
- **Test C (Submission Privacy)**: Submit answers. Confirm response payload does not include any answer data.
- **Test D (Auth Barrier)**: Attempt to call `/api/owner/tests` or `/api/owner/tests/{id}/answers` using the responder token. Confirm it returns `401 Unauthorized` or `403 Forbidden`.
- **Test E (Owner Dashboard)**: Open `/dashboard`. Confirm the completed test shows up as completed with "View Answers".
- **Test F (Answer Review)**: In the owner dashboard, verify the side-by-side comparison of expected answers vs responder answers.
- **Test G (Link Rotation)**: Rotate the link in the owner dashboard. Confirm the old responder link returns 404 or inactive.
- **Test H (Health Check)**: Check `GET /health`. Confirm `{ "status": "ok" }`.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server (Express + Vite middlewares on port 3000)
npm run dev

# Build production frontend
npm run build
```
