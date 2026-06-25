import api from "./api";

// Todas as chamadas HTTP
// Todas as chamadas HTTP     GET; POST; DELETE
// Todas as chamadas HTTP

export const questaoService = {
  listarTodas: async () => {
    const response = await api.get("/questoes");
    return response.data;
  },
  
  salvar: async (questao) => {
    const response = await api.post("/questoes", questao);
    return response.data;
  },
  
  excluir: async (id) => {
    const response = await api.delete(`/questoes/${id}`);
    return response.data;
  }
};