import { useState } from "react";
import { questaoService } from "../services/questaoService";
import { useToastContext } from "../contexts/ToastContext";
import { getMediaUrl } from "../utils/urlUtils";

function QuestaoForm({ SalvarSucesso }) {

    const { showToast } = useToastContext();
    const [novaQuestao, setNovaQuestao] = useState({
        enunciado: "",
        imagemUrl: "",
        materia: "",
        assunto: "",
        dificuldade: "0",
        fonte: "",
        trechoCodigo: "",
        linguagemCodigo: ""
    });

    const [enviandoImagem, setEnviandoImagem] = useState(false);
    const [promptIA, setPromptIA] = useState("");
    const [gerandoIA, setGerandoIA] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setEnviandoImagem(true);
        try {
            const data = await questaoService.uploadImagem(file);
            setNovaQuestao(prev => ({ ...prev, imagemUrl: data.imageUrl }));
            showToast('Imagem enviada com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao enviar imagem:", err);
            showToast('Erro ao enviar imagem.', 'error');
        } finally {
            setEnviandoImagem(false);
        }
    };

    const handleGerarEsbocoIA = async () => {
        if (!promptIA.trim()) {
            showToast('Digite uma ideia para a IA no campo do Copiloto.', 'error');
            return;
        }
        setGerandoIA(true);
        try {
            const dadosSugeridos = await questaoService.iaSugerir(promptIA, novaQuestao.enunciado);
            setNovaQuestao({
                enunciado: dadosSugeridos.enunciado || "",
                materia: dadosSugeridos.materia || "",
                assunto: dadosSugeridos.assunto || "",
                dificuldade: String(dadosSugeridos.dificuldade ?? "0"),
                fonte: dadosSugeridos.fonte || "Gerado por Gemini",
                trechoCodigo: dadosSugeridos.trechoCodigo || "",
                linguagemCodigo: dadosSugeridos.linguagemCodigo || ""
            });
            showToast('Esboço gerado com sucesso! Revise os campos abaixo.', 'success');
        } catch (err) {
            console.error("Erro ao gerar esboço com IA:", err);
            showToast('Erro ao obter sugestão da IA. Verifique a API Key do Gemini.', 'error');
        } finally {
            setGerandoIA(false);
        }
    };

    const handleCriarTotalIA = async () => {
        if (!promptIA.trim()) {
            showToast('Digite uma ideia para a IA no campo do Copiloto.', 'error');
            return;
        }
        setGerandoIA(true);
        try {
            const questaoSalva = await questaoService.iaCriarTotal(promptIA);
            SalvarSucesso(questaoSalva);
            setPromptIA("");
            showToast('Questão gerada e publicada com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao publicar com IA:", err);
            showToast('Erro ao publicar com IA. Verifique a API Key do Gemini.', 'error');
        } finally {
            setGerandoIA(false);
        }
    };

    const handleSalvar = async (e) => {
        e.preventDefault();

        try {
            const dadosSalvos = await questaoService.salvar(novaQuestao);
            // Avisar o componente pai (App.js) que a questão foi salvo, enviar o novo objeto
            SalvarSucesso(dadosSalvos);
            // Limpar formulário para o próximo POST
            setNovaQuestao({
                enunciado: "",
                imagemUrl: "",
                materia: "",
                assunto: "",
                dificuldade: "0",
                fonte: "",
                trechoCodigo: "",
                linguagemCodigo: ""
            });
            showToast('Questão salva com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao salvar:", err);
            showToast('Erro ao conectar com o servidor. Verifique o console.', 'error');
        }
    };

    return (
        <form onSubmit={handleSalvar} className="w-full space-y-4">

            {/* Bloco Auxiliar de IA */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3 transition-colors">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors">
                    🪄 Copiloto de Criação IA (Gemini)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                    Digite sua ideia (ex: "Crie uma questão de Cálculo 1 sobre limites fundamentais") e deixe a IA preencher o formulário para você.
                </p>
                <textarea
                    className="w-full p-3 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all duration-200"
                    placeholder="Descreva a questão que deseja criar..."
                    value={promptIA}
                    onChange={(e) => setPromptIA(e.target.value)}
                    rows="2"
                    disabled={gerandoIA}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        type="button"
                        onClick={handleGerarEsbocoIA}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        disabled={gerandoIA}
                    >
                        {gerandoIA ? "Gerando..." : "💡 Preencher Esboço"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCriarTotalIA}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        disabled={gerandoIA}
                    >
                        {gerandoIA ? "Publicando..." : "✨ Publicar Direto"}
                    </button>
                </div>
            </div>

            {/* Enunciado */}
            <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Enunciado da Questão
                </label>
                <textarea
                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all duration-200 min-h-[100px]"
                    placeholder="Digite o enunciado da questão (suporta fórmulas LaTeX com $...$)..."
                    value={novaQuestao.enunciado}
                    onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })}
                    required
                />
            </div>

            {/* Matéria, Assunto e Dificuldade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Matéria
                    </label>
                    <input
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-sm transition-all duration-200"
                        placeholder="Ex: Java, Cálculo"
                        value={novaQuestao.materia}
                        onChange={(e) => setNovaQuestao({ ...novaQuestao, materia: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Assunto
                    </label>
                    <input
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-sm transition-all duration-200"
                        placeholder="Ex: POO, Limites"
                        value={novaQuestao.assunto}
                        onChange={(e) => setNovaQuestao({ ...novaQuestao, assunto: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Dificuldade
                    </label>
                    <select
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-sm transition-all duration-200 cursor-pointer"
                        value={novaQuestao.dificuldade}
                        onChange={(e) => setNovaQuestao({ ...novaQuestao, dificuldade: e.target.value })}
                    >
                        <option value="0">Fácil</option>
                        <option value="1">Médio</option>
                        <option value="2">Difícil</option>
                    </select>
                </div>
            </div>

            {/* Fonte */}
            <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Fonte / Origem (Opcional)
                </label>
                <input
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-sm transition-all duration-200"
                    placeholder="Ex: ENEM 2023, Livro Stewart, Concurso BB"
                    value={novaQuestao.fonte}
                    onChange={(e) => setNovaQuestao({ ...novaQuestao, fonte: e.target.value })}
                />
            </div>

            {/* Trecho de Código */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Trecho de Código (Opcional)
                    </label>
                    <select
                        className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700/60 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                        value={novaQuestao.linguagemCodigo}
                        onChange={(e) => setNovaQuestao({ ...novaQuestao, linguagemCodigo: e.target.value })}
                    >
                        <option value="">Sem linguagem</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                        <option value="sql">SQL</option>
                    </select>
                </div>
                <textarea
                    className="w-full p-3 font-mono text-sm border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all duration-200"
                    placeholder="// Cole seu código aqui se a questão envolver programação..."
                    value={novaQuestao.trechoCodigo}
                    onChange={(e) => setNovaQuestao({ ...novaQuestao, trechoCodigo: e.target.value })}
                    rows="4"
                />
            </div>

            {/* Campo de Upload de Imagem */}
            <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Imagem da Questão (Opcional)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={enviandoImagem}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                />
                {enviandoImagem && <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">Enviando imagem...</p>}

                {novaQuestao.imagemUrl && (
                    <div className="mt-2 relative inline-block">
                        <img
                            src={getMediaUrl(novaQuestao.imagemUrl)}
                            alt="Preview da imagem"
                            className="max-h-40 rounded-xl border border-slate-200 dark:border-slate-700/60 object-contain shadow-xs"
                        />
                        <button
                            type="button"
                            onClick={() => setNovaQuestao(prev => ({ ...prev, imagemUrl: "" }))}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs w-6 h-6 flex items-center justify-center cursor-pointer font-bold shadow-sm"
                            title="Remover imagem"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer"
            >
                Adicionar Questão
            </button>
        </form>
    );
};

export default QuestaoForm;