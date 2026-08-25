/**
 * Helper hook para mapear o nível de dificuldade (0, 1, 2)
 * para texto e classes Tailwind de badge / glow / bordas.
 */
export function useDificuldade(dificuldade) {
    const textoDificuldade =
        dificuldade === 2 ? 'Difícil' :
        dificuldade === 1 ? 'Médio' : 'Fácil';

    const badgesDificuldade =
        dificuldade === 2 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40' :
        dificuldade === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-amber-400 dark:border-amber-900/40' :
                            'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/40';

    const glowDificuldade =
        dificuldade === 2 ? 'bg-red-500/10 dark:bg-red-500/20' :
        dificuldade === 1 ? 'bg-amber-500/10 dark:bg-amber-500/20' :
                            'bg-green-500/10 dark:bg-green-500/20';

    const hoverBorderDificuldade =
        dificuldade === 2 ? 'hover:border-red-300 dark:hover:border-red-900/60' :
        dificuldade === 1 ? 'hover:border-amber-300 dark:hover:border-amber-900/60' :
                            'hover:border-green-300 dark:hover:border-green-900/60';

    return { textoDificuldade, badgesDificuldade, glowDificuldade, hoverBorderDificuldade };
}
