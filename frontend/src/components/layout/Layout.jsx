import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DemoBanner from './DemoBanner';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useAuth } from '../../hooks/useAuth';
import { SCROLLBAR_CLASSES } from '../../utils/scrollbarUtils';

// Layout é o container principal
// Recebe children (conteúdo) que será exibido no espaço principal, Dashboard.jsx
// fullHeight: remove padding e overflow do main para que o conteúdo (ex: split-pane) ocupe toda a altura
function Layout({ children, fullHeight = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { vimAtivo } = useAccessibility();
  const { isVisitor } = useAuth();

  return (
    // Fundo sutil com gradiente ambiente
    <div className={`flex flex-col h-screen bg-[#f4f6f8] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 transition-colors duration-200 ${SCROLLBAR_CLASSES}`}>
      {/* Navbar no topo */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Container com sidebar + conteúdo principal */}
      <div className={`relative z-10 flex flex-1 overflow-hidden ${vimAtivo ? 'pb-10' : ''}`}>
        {/* Sidebar na lateral */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo principal (children) */}
        <main className={fullHeight ? `flex-1 overflow-hidden ${SCROLLBAR_CLASSES}` : `flex-1 overflow-y-auto p-6 ${SCROLLBAR_CLASSES}`}>
          {isVisitor && <DemoBanner />}
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

