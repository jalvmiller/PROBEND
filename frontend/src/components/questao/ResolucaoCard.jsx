import { renderizarTextoMath } from '../../utils/mathRenderer';

function ResolucaoCard({ resolucao }) {
    return (

        // Janela do Card de Resolução
        <div className='bg-white rounded-2xl shadow-mg border border-slate-100 p-6 space-y-4 transition hover:shadow-lg'>
            <div className='flex justify-between items-center border-b border-slate-50 pb-2'>
                {/* Informações sobre quem postou a resolução */}
                <span className='text-sm font-semibold text-slate-600'>
                    Respondido por: <span className='text-slate-800'>{resolucao.autor?.nome || resolucao.autor?.username}</span>
                </span>
            </div>

            {/* Renderização do conteúdo da resolução
            * leading-relaxed aumenta o espaçamento entre linhas para melhor leitura
            * o leading-relaxed seta a altura da linha com 1.625 ou 162.5% do tamanho da fonte
            * desse modo o texto fica menos "apertado"
            * o whitespace-pre-wrap mantém a formatação do texto (incluindo quebras de linha)
            * sendo que o conteúdo vem do banco de dados com quebras de linha \n         
            */}
            <div className='text-slate-800 leading-relaxed whitespace-pre-wrap'>
                {renderizarTextoMath(resolucao.conteudo)}
            </div>

            {/* Renderização do trecho de código (se houver) */}
            {resolucao.trechoCodigo && (
                // Janela do trecho de código
                <div className='rounded-xl overflow-hidden border border-slate-800 shadow-md'>
                    {/* Cabeçalho do trecho de código */}
                    <div className='bg-slate-800 text-slate-400 px-4 py-1.5 text-xs font-mono'>
                        {resolucao.linguagemCodigo || "Código"}
                    </div>
                    {/* Corpo do trecho de código */}
                    <pre className='bg-slate-900 text-slate-100 p-4 overflow-x-auto font-mono text-sm leading-relaxed'>
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