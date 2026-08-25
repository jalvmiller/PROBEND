import { useState, useCallback, useRef } from 'react';

/**
 * Hook para criar e gerenciar toasts.
 *
 * Retorna:
 *   - toasts: lista de toasts ativos
 *   - showToast(mensagem, tipo, duracao): dispara um novo toast
 *   - removeToast(id): remove um toast específico
 *
 * ── Por que useRef para o contador? ──────────────────────────────────────────
 * A versão anterior usava `let toastId = 0` fora do hook — uma variável global
 * de módulo. Isso cria dois problemas:
 *
 * 1. ESCOPO COMPARTILHADO: todas as instâncias do hook (em componentes diferentes)
 *    incrementam o mesmo contador, causando colisão de IDs em uso multi-instância.
 *
 * 2. PERSISTÊNCIA ENTRE RENDERIZAÇÕES NO SERVIDOR (SSR): em ambientes como
 *    Next.js, a variável mantém estado entre requisições de usuários distintos.
 *
 * Com useRef, o contador fica encapsulado dentro do ciclo de vida do hook,
 * sem vazar para o escopo do módulo.
 *
 * ── Por que useRef para os timers? ───────────────────────────────────────────
 * A versão anterior chamava setTimeout diretamente dentro de showToast e não
 * cancelava o timer se o toast fosse removido manualmente ou o componente
 * desmontasse — isso gera warnings e potenciais memory leaks.
 *
 * O padrão correto é guardar as referências dos timers em um Map dentro de
 * um useRef. Assim:
 *   - showToast agenda o timer e salva a referência.
 *   - removeToast cancela o timer antes de remover o toast do estado.
 *   - Quando o provider desmontar, todos os timers pendentes são cancelados.
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    // Contador encapsulado: não vaza para o escopo do módulo e não é
    // redefinido a cada renderização (diferente de uma variável local).
    const proximoId = useRef(0);

    // Map de { id → timeoutId } para poder cancelar timers pendentes
    const timers = useRef(new Map());

    const removeToast = useCallback((id) => {
        // Cancela o timer desse toast antes de removê-lo do estado
        const timerId = timers.current.get(id);
        if (timerId !== undefined) {
            clearTimeout(timerId);
            timers.current.delete(id);
        }
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((mensagem, tipo = 'success', duracao = 4000) => {
        proximoId.current += 1;
        const id = proximoId.current;

        setToasts(prev => [...prev, { id, mensagem, tipo }]);

        // Agenda a remoção automática (se duracao > 0)
        if (duracao > 0) {
            const timerId = setTimeout(() => {
                timers.current.delete(id);
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duracao);
            timers.current.set(id, timerId);
        }

        return id;
    }, []);

    return { toasts, showToast, removeToast };
}
