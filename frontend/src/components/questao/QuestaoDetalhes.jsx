import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { renderizarTextoMath } from '../../utils/mathRenderer';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import ResolucaoCard from './ResolucaoCard';
import ResolucaoForm from './ResolucaoForm';

function QuestaoDetalhes() {

    const { id } = useParams();             // recebe o id da url
    const navigate = useNavigate();         // para navegação
    const { user } = useAuth();

    const [questao, setQuestao] = useState(null); // estado para armazenar a questão
    const [loading, setLoading] = useState(true); // estado para armazenar o loading
    const [error, setError] = useState('');       // estado para armazenar o error
    const [enviando, setEnviando] = useState(false);

    const [resolucoes, setResolucoes] = useState([]); // estado para armazenar as resoluções

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoading(true);
                setError('');

                // Busca a questão pelo ID da questão
                const responseQuestao = await api.get(`/questoes/${id}`);
                setQuestao(responseQuestao.data);

                // Busca as resoluções pelo ID da questão
                const responseResolucoes = await api.get(`/questoes/${id}/resolucoes`);
                setResolucoes(responseResolucoes.data);
            } catch (err) {
                console.error("Erro ao carregar detalhes", err);
                setError("Não foi possível carregar os detalhes");
            } finally {
                setLoading(false);
            }
        }

        // carregarDados executa toda vez que o id mudar
        // [id] determina o ciclo de vida do useEffect
        // [] determina que o useEffect só executa uma vez (na montagem)
        // se não tiver nada, executa na montagem e na atualização
        carregarDados();
    }, [id]);

    const handleAlternarSolucionada = async () => {
        try {
            const novoStatus = !questao.solucionada;

            const response = await api.put(`/questoes/${id}/solucionada?status=${novoStatus}`);
            setQuestao(response.data);
        } catch (err) {
            console.error("Erro ao alternar status:", err);
            alert("Erro alterar ao alterar o status. Só o autor pode fazer isso");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]" >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        )
    };

    const handleSubmeterResolucao = async (dadosResolucao) => {
        try {
            setEnviando(true);
            //faz o post da resolução
            const response = await api.post(`/questoes/${id}/resolucoes`, dadosResolucao);
            //adiciona a nova resolução ao array de resoluções
            // spread com [response.data, ... resolucoes] precisa de colchetes
            // já que o react considera que [a, ...b] cria um novo array
            setResolucoes([response.data, ...resolucoes]);
        } catch (err) {
            console.error("Erro ao submeter resolução", err);
            alert("Erro ao submeter resolução. Tente novamente");
        } finally {
            setEnviando(false);
        }
    };

    const textoDificuldade =
        questao?.dificuldade === 2 ? 'Difícil' :
            questao?.dificuldade === 1 ? 'Médio' : 'Fácil';

    const badgesDificuldade =
        questao?.dificuldade === 2 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40' :
            questao?.dificuldade === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-amber-400 dark:border-amber-900/40' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/40';

    // == Renderização do componente de detalhes da questão ==
    // == Renderização do componente de detalhes da questão ==
    // == Renderização do componente de detalhes da questão ==
    // == Renderização do componente de detalhes da questão ==
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Botão de Voltar*/}
            <button
                onClick={() => navigate(`/`)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition font-semibold"
            >
                <ArrowLeft size={20} />
                Voltar
            </button>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-center font-semibold">
                    {error}
                </div>
            )}

            {/* Janela */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                <div className='p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300'>
                    {/* Informações da Questão (Matéria, Assunto, Dificuldade e Autor) */}
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                {questao.materia}
                            </span>
                            {questao.assunto && (
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                                    {questao.assunto}
                                </span>
                            )}
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${badgesDificuldade}`}>
                                {textoDificuldade}
                            </span>
                        </div>

                        {/* Autor da Questão - obrigatório*/}
                        <h2 className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Criado por <span className='font-semibold text-slate-700 dark:text-slate-300'>
                                {questao.autor?.nome || questao.autor?.username}
                            </span>
                        </h2>
                    </div>


                    {/* STATUS DE SOLUÇÃO - obrigatório*/}
                    <div>
                        {questao.solucionada ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 px-3 py-1.5 rounded-full">
                                <CheckCircle size={14} />
                                Solucionada
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-3 py-1.5 rounded-full">
                                <Clock size={14} />
                                Pendente
                            </span>
                        )}
                    </div>
                </div>


                <div className='p-6 md:p-8 space-y-6'>
                    <div className='text-slate-800 dark:text-slate-100 leading-relaxed text-lg whitespace-pre-wrap transition-colors duration-300'>
                        {renderizarTextoMath(questao.enunciado)}
                    </div>

                    {/* Imagem da Questão */}
                    {questao.imagemUrl && (
                        <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950/20 p-2">
                            <img
                                src={questao.imagemUrl.startsWith("http") ? questao.imagemUrl : `http://localhost:8080${questao.imagemUrl}`}
                                alt="Imagem da questão"
                                className="max-h-80 mx-auto object-contain rounded"
                            />
                        </div>
                    )}

                    {/* Bloco de Código - condicionada ao trechoCodigo existir*/}
                    {questao.trechoCodigo && (
                        <div className='rounded-xl overflow-hidden border border-slate-800 dark:border-slate-700 shadow-md'>
                            <div className='bg-slate-800 dark:bg-slate-800 text-slate-400 dark:text-slate-300 px-4 py-2 text-xs font-mono flex justify-between items-center'>
                                <span>Código {(questao.linguagemCodigo || 'Texto')}</span>
                            </div>

                            {/* ====== Trecho de Código ====== */}
                            <pre className='bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-200 p-4 text-sm overflow-x-auto'>
                                <code>{questao.trechoCodigo}</code>
                            </pre>
                            {/* ====== Trecho de Código ======*/}
                        </div>
                    )}

                    {questao.fonte && (
                        <p className='text-xs text-slate-400 dark:text-slate-500 italic'>Fonte: {questao.fonte}</p>
                    )}

                    {/* Botão de alternar solução condicionada ao autor */}
                    {user && questao.autor && questao.autor.username === user.username && (
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                            <button
                                onClick={handleAlternarSolucionada}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${questao.solucionada
                                    ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <CheckCircle size={16} />
                                {questao.solucionada ? 'Desmarcar como solucionada' : 'Marcar como solucionada'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Seção de Resoluções */}
            <div className="space-y-6 pt-4">
                <h3 className="text-slate-800 dark:text-slate-100 text-xl font-bold transition-colors">Resoluções</h3>

                {/* Formulário de Resolução via Prop */}
                <ResolucaoForm aoSubmeter={handleSubmeterResolucao} enviando={enviando} />

                <div className='space-y-4'>
                    {resolucoes.length === 0 ? (
                        <div className='bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800'>
                            Nenhuma resolução enviada ainda.
                        </div>
                    ) : (
                        resolucoes.map(resolucao => (
                            <ResolucaoCard
                                key={resolucao.id}
                                resolucao={resolucao} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuestaoDetalhes;