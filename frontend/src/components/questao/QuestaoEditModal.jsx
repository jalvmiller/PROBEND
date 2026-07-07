import { useState } from "react";
import { X } from "lucide-react";
import { questaoService } from "../../services/questaoService";

function QuestaoEditModal({ questao, isOpen, onClose, onSalvarSucesso }) {
    const [dados, setDados] = useState({
        enunciado: questao.enunciado || "",
        materia: questao.materia || "",
        assunto: questao.assunto || "",
        dificuldade: questao.dificuldade !== undefined ? String(questao.dificuldade) : "0",
        fonte: questao.fonte || "",
        trechoCodigo: questao.trechoCodigo || "",
        linguagemCodigo: questao.linguagemCodigo || ""
        // Os atributos que não aparecem aqui já estão no banco de dados
        // A dificuldade é salva como String, mas no banco de dados é Integer
        // !== undefined significa diferente de undefined (null) 
        // ? String(...) garante que a dificuldade seja sempre salva como String
    });
    const [salvando, setSalvando] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        try {
            const questaoAtualizada = await questaoService.atualizar(questao.id, {
                ...dados,
                dificuldade: parseInt(dados.dificuldade, 10)
            });
            onSalvarSucesso(questaoAtualizada);
            onClose();
        } catch (err) {
            console.error("Erro ao atualizar questão:", err);
            alert("Erro ao atualizar questão. Verifique se você é o autor ou se a conexão está ativa.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                    type="button"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-6">Editar Questão</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Enunciado
                        </label>
                        <textarea
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Digite o enunciado"
                            value={dados.enunciado}
                            onChange={(e) => setDados({ ...dados, enunciado: e.target.value })}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Matéria
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Ex: Java, Cálculo"
                                value={dados.materia}
                                onChange={(e) => setDados({ ...dados, materia: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Assunto
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Ex: OOP, Limites"
                                value={dados.assunto}
                                onChange={(e) => setDados({ ...dados, assunto: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Dificuldade
                            </label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                value={dados.dificuldade}
                                onChange={(e) => setDados({ ...dados, dificuldade: e.target.value })}
                            >
                                <option value="0">Fácil</option>
                                <option value="1">Médio</option>
                                <option value="2">Difícil</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Fonte
                        </label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Ex: Livro X, Aula Y"
                            value={dados.fonte}
                            onChange={(e) => setDados({ ...dados, fonte: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Trecho de código (opcional)
                        </label>
                        <textarea
                            className="w-full p-2 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Insira o código aqui"
                            value={dados.trechoCodigo}
                            onChange={(e) => setDados({ ...dados, trechoCodigo: e.target.value })}
                            rows="4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Linguagem do código
                        </label>
                        <select
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={dados.linguagemCodigo}
                            onChange={(e) => setDados({ ...dados, linguagemCodigo: e.target.value })}
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

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 font-semibold transition"
                            disabled={salvando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition flex items-center justify-center min-w-[80px]"
                            disabled={salvando}
                        >
                            {salvando ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default QuestaoEditModal;
