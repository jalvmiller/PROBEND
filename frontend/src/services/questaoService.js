import api from "./api";

// Todas as chamadas HTTP
// Todas as chamadas HTTP     GET; POST; DELETE
// Todas as chamadas HTTP

export const questaoService = {
  salvar: async (questao) => {
    const response = await api.post("/questoes", questao);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/questoes/${id}`);
    return response.data;
  },

  // Busca condicionada pelo ID, usada pela Dashboard
  busca: async (busca) => {
    // busca fica entre chaves {}, caso contrário 
    // (busca) não é reconhecido como objeto, e 
    // sim como uma String pura

    // Se a variável 'busca' existir, adiciona 
    // ela como parâmetro na requisição. Caso contrário, 
    // envia {} e liste todas as questões
    const response = await api.get("/questoes", {
      params: busca ? { busca } : {}
    });

    return response.data;
  }
};