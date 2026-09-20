import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { UIProvider } from './context/UIContext';
import { DataProvider } from './context/DataContext';
import AppHeader from './components/navigation/AppHeader';
import AppSidebar from './components/navigation/AppSidebar';
import ToastContainer from './components/common/ToastContainer';
import CommandPalette from './components/common/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <UIProvider>
          <DataProvider>
            <div className="h-screen max-h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
              {/* App Shell Header with Workspace Switcher & Persona Controller */}
              <div className="shrink-0">
                <AppHeader />
              </div>

              {/* Body with Collapsible Sidebar & Content Area */}
              <div className="flex-1 flex min-h-0 overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                  <HomePage />
                </main>
              </div>

              {/* Global UI Overlays */}
              <ToastContainer />
              <CommandPalette />
              <AuthModal />
            </div>
          </DataProvider>
        </UIProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

