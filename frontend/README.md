# VEYORA Frontend Client

This is the standalone React + Vite frontend client for VEYORA Multi-Tenant Client Operations SaaS.

## Features
- **Modern User Experience**: Responsive interfaces using Tailwind CSS and Motion.
- **Role-Based Workspaces**: Multi-tenant workspace layouts tailored to Staff, Team Members, Clients, and Administrators.
- **Secure Sessions**: Access control integrated with centralized secure cookie authentication state.

## Local Setup & Development

### 1. Configure Environment Variables
Copy the template `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` points to your backend server instance.

### 2. Install Dependencies
Run npm install in the `frontend/` directory:
```bash
npm install
```

### 3. Run Development Client
Start the local development server:
```bash
npm run dev
```
The application will run on **`http://localhost:5173`** with automated reverse proxying for backend routes under `/api`.

---

## Deployment to Vercel

The frontend client is designed to be easily deployed to Vercel.

1. Create a new project on **Vercel**.
2. Select your repository.
3. Configure the following project parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set up the `VITE_API_URL` environment variable inside Vercel's console pointing to your deployed backend.
