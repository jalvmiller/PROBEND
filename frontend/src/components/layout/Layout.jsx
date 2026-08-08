import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAccessibility } from '../../contexts/AccessibilityContext';

// Layout é o container principal
// Recebe children (conteúdo) que será exibido no espaço principal, Dashboard.jsx
// fullHeight: remove padding e overflow do main para que o conteúdo (ex: split-pane) ocupe toda a altura
function Layout({ children, fullHeight = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { vimAtivo } = useAccessibility();

  return (
    <div className="relative flex flex-col h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Fundo sutil com gradiente ambiente */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950 pointer-events-none -z-10" />

      {/* Navbar no topo */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Container com sidebar + conteúdo principal */}
      <div className={`relative z-10 flex flex-1 overflow-hidden ${vimAtivo ? 'pb-10' : ''}`}>
        {/* Sidebar na lateral */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo principal (children) */}
        <main className={fullHeight ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto p-6'}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
