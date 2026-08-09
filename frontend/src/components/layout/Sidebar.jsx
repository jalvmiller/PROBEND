// Ícones
import { useState } from 'react';
import { X, LogOut, Home, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { SCROLLBAR_CLASSES } from '../../utils/scrollbarUtils';

// Sidebar fica na lateral esquerda
// Recebe isOpen para saber se está aberta (em mobile) e onClose para fechar, PROPS
function Sidebar({ isOpen, onClose }) {
    const { logout } = useAuth();
    const [colapsado, setColapsado] = useState(() => {
        return localStorage.getItem('probend_sidebar_collapsed') === 'true';
    });

    const toggleColapsado = () => {
        setColapsado(prev => {
            const novo = !prev;
            localStorage.setItem('probend_sidebar_collapsed', String(novo));
            return novo;
        });
    };

    return (
        <>
            {/* Overlay escuro em mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-30"
                    onClick={onClose}
                />
            )}

            {/* A sidebar em si */}
            {/* 
                aside é só semantica
                fixed         -> fixado como antes, acompanha a scrollbar
                lg:static     -> em tela grande (lg), a sidebar se comporta
                como um elemento normal
                left-0        -> posiciona no canto esquerdo
                top-0         -> combinando com o left, posiciona no superior esquerdo
                h-screen      -> altura total da tela
                text-slate    -> cor do texto
                shadow-lg     -> sombra ao redor

                transform transition-all duration-300
                -> habilita transformação e transição de largura com animação de 300ms

                z-40              -> sidebar fica acima do overlay
                ${ isOpen ..      -> uma expressão, se for verdade
                translate-x-0    -> se verdade, não move no eixo X
                translate-x-full -> se não for verdade
                desloca 100% da largura para a esquerda
                
                lg:translate-x-0  -> se for tela grande, nunca fica escondida                 
            */}
            <aside
                className={`fixed lg:static left-0 top-0 h-screen bg-white dark:bg-[#161e2e] text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shadow-lg transition-all duration-300 z-40 flex flex-col ${colapsado ? 'lg:w-20' : 'lg:w-64'
                    } w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                role="navigation"
                aria-label="Menu de navegação principal"
            >
                {/* Header da sidebar com botão de fechar (apenas mobile) e botão de retrar/expandir (desktop) */}
                {/* 
                    flex items-center justify-between -> alinhamento e espaçamento
                    p-4                               -> padding
                    border-b border-slate-200         -> borda bottom
                    chama onClose para fechar
                    o X é o ícone de fechar
                */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className={`text-xl font-bold transition-opacity duration-200 ${colapsado ? 'lg:hidden' : 'block'}`}>
                        Menu
                    </h2>

                    {/* Botão fechar em mobile */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 lg:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={18} />
                    </button>

                    {/* Botão de retrar/expandir em desktop */}
                    <button
                        onClick={toggleColapsado}
                        className="hidden lg:flex items-center justify-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label={colapsado ? "Expandir menu lateral" : "Recolher menu lateral"}
                        title={colapsado ? "Expandir menu lateral" : "Recolher menu lateral"}
                    >
                        {colapsado ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Lista de navegação com os links: Dashboard - Questões - Configurações */}
                {/* space-y-2                    -> espaçamento vertical entre todos os elementos 
                    flex items-center gap-3      -> coloca tudo na mesma linha, gap é espaçamento entre ícone e texto
                    hover:bg-indigo-50 transition -> muda a cor do fundo ao passar o mouse, transição suave de cor                
                */}
                <nav className="p-3 space-y-2 flex-1">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-3 py-3 rounded text-slate-700 dark:text-slate-200 hover:bg-indigo-50/80 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition font-medium ${colapsado ? 'lg:justify-center' : ''
                            }`}
                        title="Dashboard"
                        aria-label="Dashboard"
                    >
                        <Home size={20} className="flex-shrink-0" />
                        <span className={colapsado ? 'lg:hidden' : 'block'}>Dashboard</span>
                    </Link>

                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-3 py-3 rounded text-slate-700 dark:text-slate-200 hover:bg-indigo-50/80 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition font-medium ${colapsado ? 'lg:justify-center' : ''
                            }`}
                        title="Questões"
                        aria-label="Questões"
                    >
                        <BookOpen size={20} className="flex-shrink-0" />
                        <span className={colapsado ? 'lg:hidden' : 'block'}>Questões</span>
                    </Link>

                    <Link
                        to="/configuracoes"
                        className={`flex items-center gap-3 px-3 py-3 rounded text-slate-700 dark:text-slate-200 hover:bg-indigo-50/80 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition font-medium ${colapsado ? 'lg:justify-center' : ''
                            }`}
                        title="Configurações"
                        aria-label="Configurações"
                    >
                        <Settings size={20} className="flex-shrink-0" />
                        <span className={colapsado ? 'lg:hidden' : 'block'}>Configurações</span>
                    </Link>
                </nav>

                {/* Botão Sair no rodapé da sidebar */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={logout}
                        className={`flex items-center w-full gap-3 px-3 py-3 rounded
                        hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition
                        text-left font-medium ${colapsado ? 'lg:justify-center' : ''}`}
                        title="Sair da conta"
                        aria-label="Sair da conta"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className={colapsado ? 'lg:hidden' : 'block'}>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
