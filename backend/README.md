# VEYORA Backend Server

This is the standalone Node.js, Express, and MongoDB backend application for the VEYORA Client Operations SaaS platform.

## Features
- **Multi-Tenant REST API**: Built on Express with tenant-scoping models.
- **Mongoose / MongoDB Integration**: Structured schemas with indices.
- **Robust JWT Security**: Comprehensive access & refresh token rotation with HTTP-only cookies.
- **AI-Powered Workflows**: Server-side Gemini API prompt orchestration.

## Local Setup & Development

### 1. Configure Environment Variables
Copy the template `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Provide your actual `MONGODB_URI` and any custom JWT secrets.

### 2. Install Dependencies
Run npm install in the `backend/` directory:
```bash
npm install
```

### 3. Run Development Server
Start the auto-reloading developer runtime:
```bash
npm run dev
```
The server will boot and run on **`http://localhost:5000`** by default.

---

## Deployment to Render

This backend application is completely self-contained and ready to deploy to Render.

1. Create a **Web Service** on Render.
2. Select your repository.
3. Set the following Build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Define your environment variables in Render's configuration panel (matching your local `.env`).
