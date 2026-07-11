import { renderizarTextoMath } from '../../utils/mathRenderer';

function ResolucaoCard({ resolucao }) {
    return (

        // Janela do Card de Resolução
        <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 space-y-4 transition hover:shadow-xl transition-colors duration-300'>
            <div className='flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2'>
                {/* Informações sobre quem postou a resolução */}
                <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>
                    Respondido por: <span className='text-slate-800 dark:text-slate-200'>{resolucao.autor?.nome || resolucao.autor?.username}</span>
                </span>
            </div>

            {/* Renderização do conteúdo da resolução
            * leading-relaxed aumenta o espaçamento entre linhas para melhor leitura
            * o leading-relaxed seta a altura da linha com 1.625 ou 162.5% do tamanho da fonte
            * desse modo o texto fica menos "apertado"
            * o whitespace-pre-wrap mantém a formatação do texto (incluindo quebras de linha)
            * sendo que o conteúdo vem do banco de dados com quebras de linha \n         
            */}
            <div className='text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap transition-colors duration-300'>
                {renderizarTextoMath(resolucao.conteudo)}
            </div>

            {/* Renderização do trecho de código (se houver) */}
            {resolucao.trechoCodigo && (
                // Janela do trecho de código
                <div className='rounded-xl overflow-hidden border border-slate-800 dark:border-slate-750 shadow-md'>
                    {/* Cabeçalho do trecho de código */}
                    <div className='bg-slate-800 dark:bg-slate-850 text-slate-400 dark:text-slate-300 px-4 py-1.5 text-xs font-mono'>
                        {resolucao.linguagemCodigo || "Código"}
                    </div>
                    {/* Corpo do trecho de código */}
                    <pre className='bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-200 p-4 overflow-x-auto font-mono text-sm leading-relaxed'>
                        <code>
                            {resolucao.trechoCodigo}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );


}

export default ResolucaoCard;