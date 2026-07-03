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
    const { logout } = useAuth();           // deslogar

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

    // == Renderização do componente de detalhes da questão ==
    // == Renderização do componente de detalhes da questão ==
    // == Renderização do componente de detalhes da questão ==
    // == Renderização do componente de detalhes da questão ==
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Botão de Voltar*/}
            <button
                onClick={() => navigate(`/`)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-semibold"
            >
                <ArrowLeft size={20} />
                Voltar
            </button>

            {/* Janela */}
            {/* Janela */}
            {/* Janela */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className='p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    {/* Matéria da Questão - obrigatório*/}
                    {/* Matéria da Questão - obrigatório*/}
                    {/* Matéria da Questão - obrigatório*/}
                    <div>
                        <span className='text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-4 py-1 rounded-full'>
                            {questao.materia}
                        </span>

                        {/* Assunto da Questão - condicionada ao assunto existir*/}
                        {/* Assunto da Questão - condicionada ao assunto existir*/}
                        {/* Assunto da questão - condicionada ao assunto existir*/}
                        {questao.assunto && (
                            <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {questao.assunto}
                            </span>
                        )}

                        {/* Autor da Questão - obrigatório*/}
                        {/* Autor da Questão - obrigatório*/}
                        {/* Autor da Questão - obrigatório*/}
                        <h2 className="text-sm tex-slate-400 mt-2">
                            Criado por <span className='font-semibold text-slate-700'>
                                {questao.autor?.nome || questao.autor?.username}
                            </span>
                        </h2>
                    </div>


                    {/* STATUS DE SOLUÇÃO - obrigatório*/}
                    {/* STATUS DE SOLUÇÃO - obrigatório*/}
                    {/* STATUS DE SOLUÇÃO - obrigatório*/}
                    <div>
                        {questao.solucionada ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                                <CheckCircle size={14} />
                                Solucionada
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                                <Clock size={14} />
                                Pendente
                            </span>
                        )}
                    </div>
                </div>


                <div className='p-6 md:p-8 space-y-6'>
                    <div className='text-slate-800 leading-relaxed text-lg whitespace-pre-wrap'>
                        {renderizarTextoMath(questao.enunciado)}
                    </div>
                    {/* Bloco de Código - condicionada ao trechoCodigo existir*/}
                    {/* Bloco de Código - condicionada ao trechoCodigo existir*/}
                    {/* Bloco de Código - condicionada ao trechoCodigo existir*/}
                    {questao.trechoCodigo && (
                        <div className='rounded-xl overflow-hidden border border-slate-800 shadow-md'>
                            <div className='bg-slate-800 text-slate-400 px-4 py-2 text-xs font-mono flex justify-between items-center'>
                                <span>Código {(questao.linguagemCodigo || 'Texto')}</span>
                            </div>

                            {/* ====== Trecho de Código ====== */}
                            <pre className='bg-slate-900 text-slate-100 p-4 text-sm overflow-x-auto'>
                                <code>{questao.trechoCodigo}</code>
                            </pre>
                            {/* ====== Trecho de Código ======*/}
                        </div>
                    )}

                    {questao.fonte && (
                        <p className='text-xs text-slate-400 italic'>Fonte: {questao.fonte}</p>
                    )}

                    {/* Botão de alternar solução condicionada ao autor */}
                    {user && questao.autor && questao.autor.username === user.username && (
                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={handleAlternarSolucionada}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${questao.solucionada
                                    ? 'bg-amber-100 text-amber-800 hover:background-amber-200'
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
            {/* Seção de Resoluções */}
            {/* Seção de Resoluções */}
            <div className="space-y-6 pt-4">
                <h3 className="text-slate-800 text-xl font-bold">Resoluções</h3>

                {/* Formulário de Resolução via Prop */}
                <ResolucaoForm aoSubmeter={handleSubmeterResolucao} enviando={enviando} />

                <div className='space-y-4'>
                    {resolucoes.length === 0 ? (
                        <div className='bg-slate-50 text-slate-400 text-center py-10 rounded-2xl border border-dashed border-slate-200'>
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