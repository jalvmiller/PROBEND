/**
 * useScreenReader
 *
 * Hook para leitura de conteúdo em voz alta via Web Speech API (PT-BR).
 *
 * Uso:
 *   const { speak, pararLeitura } = useScreenReader();
 *   speak('Resolução enviada com sucesso');
 */
export function useScreenReader() {
    const speak = (texto, prioridade = false) => {
        if (!window.speechSynthesis) return;

        // Cancela leitura anterior se prioridade alta
        if (prioridade) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        utterance.pitch = 1;
        utterance.volume = 0.95;

        window.speechSynthesis.speak(utterance);
    };

    const pararLeitura = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    /**
     * Lê o conteúdo do elemento focado no momento.
     * Tenta: aria-label → aria-description → textContent → innerText
     */
    const lerElementoFocado = () => {
        const el = document.activeElement;
        if (!el || el === document.body) {
            speak('Nenhum elemento selecionado');
            return;
        }

        const texto =
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-description') ||
            el.getAttribute('title') ||
            el.textContent?.trim() ||
            el.innerText?.trim() ||
            el.tagName.toLowerCase();

        const tipo =
            el.tagName === 'BUTTON' ? 'Botão' :
            el.tagName === 'A' ? 'Link' :
            el.tagName === 'INPUT' ? 'Campo de entrada' :
            el.tagName === 'TEXTAREA' ? 'Área de texto' :
            el.tagName === 'SELECT' ? 'Seleção' : '';

        speak(tipo ? `${tipo}: ${texto}` : texto, true);
    };

    return { speak, pararLeitura, lerElementoFocado };
}
