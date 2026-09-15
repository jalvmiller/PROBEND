import { useEffect, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useScreenReader } from './useScreenReader';

/**
 * Seletor abrangente de elementos interativos e navegáveis no DOM.
 */
const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="article"]',
    '[role="button"]',
].join(', ');

/**
 * Gera um "whoosh" suave via Web Audio API.
 */
function playWhoosh() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.13);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.13);

        osc.onended = () => ctx.close();
    } catch {
        // Web Audio não disponível
    }
}

/**
 * Aplica visual highlight de foco para o modo Normal do Vim.
 */
function aplicarHighlight(el) {
    document.querySelectorAll('[data-vim-focus]').forEach(e => {
        e.removeAttribute('data-vim-focus');
        e.style.outline = '';
        e.style.outlineOffset = '';
        e.style.boxShadow = '';
        e.style.transition = '';
    });

    if (!el) return;

    el.setAttribute('data-vim-focus', 'true');
    el.style.outline = '2px solid #6366f1';
    el.style.outlineOffset = '3px';
    el.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.22)';
    el.style.transition = 'outline 0.15s ease, box-shadow 0.15s ease';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Retorna todos os elementos interativos visíveis no documento.
 */
function getFocusaveis() {
    return Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => {
        const rect = el.getBoundingClientRect();
        return (
            rect.width > 0 &&
            rect.height > 0 &&
            !el.closest('[aria-hidden="true"]') &&
            getComputedStyle(el).visibility !== 'hidden'
        );
    });
}

/**
 * useVimNavigation
 *
 * Suporte completo 100% via teclado para navegação estilo Vim:
 *
 * MODO NORMAL (Padrão quando Vim ativado):
 *   - J / S / ↓   → Próximo elemento / card
 *   - K / W / ↑   → Elemento / card anterior
 *   - L / D / →   → Próximo elemento no eixo horizontal
 *   - H / A / ←   → Elemento anterior no eixo horizontal
 *   - Enter       → Ativa / clica elemento (se input/textarea, entra em Insert)
 *   - i / Esc     → Alterna para MODO INSERT (para digitar livremente)
 *   - F           → Leitura em voz alta do elemento focado (Screen Reader)
 *   - T           → Abre/fecha o painel de atalhos
 *
 * MODO INSERT:
 *   - Teclado em digitação livre (inputs, textareas)
 *   - Esc         → Retorna ao MODO NORMAL e desfoca o input
 */
export function useVimNavigation({ onToggleHelp }) {
    const { mode, vimAtivo, enterInsertMode, enterNormalMode } = useAccessibility();
    const { lerElementoFocado } = useScreenReader();
    const modeRef = useRef(mode);
    const vimRef  = useRef(vimAtivo);

    useEffect(() => { modeRef.current = mode; },     [mode]);
    useEffect(() => { vimRef.current  = vimAtivo; }, [vimAtivo]);

    // Entra automaticamente em Insert Mode se o usuário focar em um input/textarea
    useEffect(() => {
        const handleFocusIn = (e) => {
            if (!vimRef.current) return;
            const tag = e.target.tagName;
            if ((tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) && modeRef.current !== 'insert') {
                enterInsertMode();
            }
        };
        window.addEventListener('focusin', handleFocusIn);
        return () => window.removeEventListener('focusin', handleFocusIn);
    }, [enterInsertMode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!vimRef.current) return;

            const currentMode = modeRef.current;

            // ── INSERT MODE ────────────────────────────────────────────────
            if (currentMode === 'insert') {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    enterNormalMode();
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    const focado = document.querySelector('[data-vim-focus]');
                    if (focado) aplicarHighlight(focado);
                }
                return;
            }

            // ── NORMAL MODE ─────────────────────────────────────────────────
            const focusaveis = getFocusaveis();
            if (focusaveis.length === 0) return;

            const elementoAtual = document.querySelector('[data-vim-focus]') || document.activeElement;
            let indiceAtual = focusaveis.indexOf(elementoAtual);
            if (indiceAtual === -1) indiceAtual = 0;

            switch (e.key) {
                // Próximo elemento (vertical / sequencial)
                case 'j':
                case 'J':
                case 's':
                case 'S':
                case 'ArrowDown': {
                    e.preventDefault();
                    const proximo = indiceAtual < focusaveis.length - 1 ? focusaveis[indiceAtual + 1] : focusaveis[0];
                    proximo.focus();
                    aplicarHighlight(proximo);
                    playWhoosh();
                    break;
                }

                // Elemento anterior (vertical / sequencial)
                case 'k':
                case 'K':
                case 'w':
                case 'W':
                case 'ArrowUp': {
                    e.preventDefault();
                    const anterior = indiceAtual > 0 ? focusaveis[indiceAtual - 1] : focusaveis[focusaveis.length - 1];
                    anterior.focus();
                    aplicarHighlight(anterior);
                    playWhoosh();
                    break;
                }

                // Eixo horizontal (direita)
                case 'l':
                case 'L':
                case 'd':
                case 'D':
                case 'ArrowRight': {
                    e.preventDefault();
                    const proximo = indiceAtual < focusaveis.length - 1 ? focusaveis[indiceAtual + 1] : focusaveis[0];
                    proximo.focus();
                    aplicarHighlight(proximo);
                    playWhoosh();
                    break;
                }

                // Eixo horizontal (esquerda)
                case 'h':
                case 'H':
                case 'a':
                case 'A':
                case 'ArrowLeft': {
                    e.preventDefault();
                    const anterior = indiceAtual > 0 ? focusaveis[indiceAtual - 1] : focusaveis[focusaveis.length - 1];
                    anterior.focus();
                    aplicarHighlight(anterior);
                    playWhoosh();
                    break;
                }

                // Interagir com o elemento (Enter)
                case 'Enter': {
                    e.preventDefault();
                    const el = focusaveis[indiceAtual];
                    if (el) {
                        const tag = el.tagName;
                        if (tag === 'INPUT' || tag === 'TEXTAREA') {
                            el.focus();
                            enterInsertMode();
                        } else if (el.getAttribute('role') === 'article') {
                            const linkOuBotao = el.querySelector('a[href], button');
                            linkOuBotao?.click();
                        } else {
                            el.click();
                        }
                    }
                    break;
                }

                // Entrar em Insert Mode (i ou Esc)
                case 'i':
                case 'I':
                case 'Escape': {
                    e.preventDefault();
                    enterInsertMode();
                    const el = focusaveis[indiceAtual];
                    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                        el.focus();
                    }
                    break;
                }

                // Leitura em voz alta (F)
                case 'f':
                case 'F': {
                    e.preventDefault();
                    lerElementoFocado();
                    break;
                }

                // Painel de atalhos (T)
                case 't':
                case 'T': {
                    e.preventDefault();
                    onToggleHelp?.();
                    break;
                }

                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enterInsertMode, enterNormalMode, lerElementoFocado, onToggleHelp]);
}
