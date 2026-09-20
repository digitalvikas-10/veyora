# VEYORA — Multi-Tenant Client Operations SaaS

VEYORA is a highly secure, modern, multi-tenant Client Operations SaaS platform engineered for freelancers, software agencies, and service businesses to manage workspaces, clients, projects, tasks, invoices, and operations seamlessly.

## Architecture & Layout

This repository has been fully restructured into a clean, decoupled, and standalone two-tier architecture:

- **Frontend Client (`/frontend`)**: Independently installable and deployable React + Vite SPA using Tailwind CSS and Motion.
- **Backend API (`/backend`)**: Independently installable and deployable Node.js, Express, and MongoDB API server.

---

## Getting Started (Local Development)

To run the application locally on your computer, clone the repository and run the frontend and backend services in separate terminal windows.

### Terminal 1: Backend Server Setup
1. Change into the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Update the `MONGODB_URI` inside `.env` with your actual MongoDB connection string)*.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *Your backend API will be running at **`http://localhost:5000`**.*

### Terminal 2: Frontend Client Setup
1. Change into the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the React/Vite development server:
   ```bash
   npm run dev
   ```
   *Your frontend will be running at **`http://localhost:5173`**.*

---

## Deployment Playbook

### Frontend Deployment (Vercel)
The `/frontend` folder is optimized for 1-click deployments on **Vercel**:
1. Connect your GitHub repository to Vercel.
2. Configure the project settings as follows:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add the `VITE_API_URL` environment variable pointing to your live backend domain.

### Backend Deployment (Render)
The `/backend` folder is ready to run as a native service on **Render**:
1. Create a new **Web Service** on Render.
2. Link your repository.
3. Configure the parameters in the dashboard:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add all configuration variables from `backend/.env.example` under the Environment section.
