import axios from "axios";

// Cria uma instância do axios com a URL base. 
// Se mudar a porta ou for para produção, muda só aqui (ou no .env)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

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