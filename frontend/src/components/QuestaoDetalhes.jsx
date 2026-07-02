import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, Clock, Trash2, Edit3, Plus, LogOut } from 'lucide-react';
// import

function QuestaoDetalhes() {

    const { id } = useParams();             // recebe o id da url
    const navigate = useNavigate();         // para navegação
    const { logout } = useAuth();           // deslogar

    const [questao, setQuestao] = useState(null); // estado para armazenar a questão
    const [loading, setLoading] = useState(true); // estado para armazenar o loading
    const [error, setError] = useState('');       // estado para armazenar o error

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

    const renderizarTextoMath = (texto) => {
        if (!texto) return "";

        // Regex, para encontrar padrões de Math inline (\$) ou em bloco (\$\$). 
        // O 'g' é para global, pega todos.
        // A estrutura fica: 
        // (padrão1|padrão2), onde \$ significa o caractere literal $. 
        // [\s\S]*? significa qualquer caractere (incluindo quebras de linha)
        // Ou seja, ele procura por texto contidos dentro de um par de '$' ou '$$',
        // e captura tudo dentro desse par.
        const partes = texto.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
        return partes.map((parte, index) => {
            // Math Block
            // Se a parte começar e terminar com '$$', é um Math Block
            // A estrutura fica:
            // $$ formula $$ 
            // displayMode: true, define que é um Math Block
            // throwOnError: false, define que não vai dar erro se a fórmula estiver errada
            // key={index}, para garantir que cada div tenha uma chave única
            // dangerouslySetInnerHTML, para renderizar o HTML gerado pelo KaTeX
            if (parte.startsWith('$$') && parte.endsWith('$$')) {
                const formula = parte.slice(2, -2);
                const html = katex.renderToString(formula, {
                    displayMode: true,
                    throwOnError: false
                });

                return <div
                    key={index} dangerouslySetInnerHTML={{
                        __html: html
                    }}
                    className="my-4 overflow-x-auto" />;
            }

            // Math Inline
            // O 'inline-block' garante que a fórmula não quebre linha e mantenha
            // o espaçamento correto em relação ao texto
            // displayMode: false, define que é uma fórmula inline
            // throwOnError: false, define que não vai dar erro se a fórmula estiver errada
            // key={index}, para garantir que cada span tenha uma chave única
            // dangerouslySetInnerHTML, para renderizar o HTML gerado pelo KaTeX
            if (parte.startsWith('$') && parte.endsWith('$')) {
                const formula = parte.slice(1, -1);
                const html = katex.renderToString(formula, {
                    displayMode: false,
                    throwOnError: false
                });

                return <span
                    key={index} dangerouslySetInnerHTML={{
                        __html: html
                    }}
                    className="inline-block" />;
            }

            // Texto comum sem Math, só coloca dentro de uma tag span
            return <span key={index}>{parte}</span>;
        })
    }

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
}

export default QuestaoDetalhes;