import { createContext, useContext, useState, useCallback } from 'react';

const VIM_STORAGE_KEY = 'probend_vim_ativo';

/**
 * Contexto global de acessibilidade.
 *
 * Gerencia dois estados independentes:
 *
 * 1. MODO DE EDIÇÃO (mode: 'normal' | 'insert')
 *    Controla se o WASD está navegando (normal) ou se o usuário está
 *    digitando livremente (insert). Só tem efeito quando vimAtivo = true.
 *
 * 2. VIM ATIVO (vimAtivo: boolean)
 *    Liga/desliga toda a navegação por teclado estilo Vim.
 *    Padrão: false — o usuário opta por ativar em Configurações.
 *    Persiste no localStorage para sobreviver a reloads.
 */
const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
    const [mode, setMode] = useState('normal'); // 'normal' | 'insert'

    // Lê a preferência salva; padrão é false (Vim desligado)
    const [vimAtivo, setVimAtivoState] = useState(
        () => localStorage.getItem(VIM_STORAGE_KEY) === 'true'
    );

    const enterInsertMode = useCallback(() => setMode('insert'), []);
    const enterNormalMode = useCallback(() => setMode('normal'), []);
    const toggleMode     = useCallback(() => setMode(m => m === 'normal' ? 'insert' : 'normal'), []);

    // Persiste a preferência e redefine o mode para 'normal' ao desligar
    const setVimAtivo = useCallback((ativo) => {
        setVimAtivoState(ativo);
        localStorage.setItem(VIM_STORAGE_KEY, String(ativo));
        if (!ativo) setMode('normal');
    }, []);

    return (
        <AccessibilityContext.Provider value={{
            mode,
            enterInsertMode,
            enterNormalMode,
            toggleMode,
            vimAtivo,
            setVimAtivo,
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const ctx = useContext(AccessibilityContext);
    if (!ctx) throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider');
    return ctx;
}
