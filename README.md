# 🎓 PROBEND (nome provisório)

**PROBEND** é um sistema (em desenvolvimento) moderno de gerenciamento e preparação de questões de matérias exatas e de algoritmos. Projetado com uma arquitetura desacoplada, o projeto utiliza um Backend robusto em Java com Spring Boot e um Frontend dinâmico e interativo em React com Tailwind.

Este repositório foi estruturado, com a inclusão de: conteinerização com **Docker**, segurança com **JWT (JSON Web Tokens)**, e documentação automatizada de APIs com **Swagger (OpenAPI)**.

---

## 🛠️ Stack
### **Backend**
*   **Java 21** & **Spring Boot**
*   **Spring Security & JWT** (Autenticação e Autorização)
*   **Spring Data JPA & Hibernate** (Persistência de dados)
*   **MySQL 8.0** (Banco de dados relacional oficial)
*   **Springdoc OpenAPI (Swagger)** (Documentação interativa da API)
*   **Maven** (Gerenciador de dependências)

### **Frontend**
*   **React 18** com **Vite** (Build rápido e hot reload)
*   **Axios** (Integração e consumo da API REST)
*   **CSS Customizado / Tailwind** (Interface responsiva, moderna e otimizada)

### **Infraestrutura**
*   **Docker & Docker Compose** (Ambiente padronizado)

---

## 📁 Estrutura de Diretórios

```text
PROBEND/
├── backend/              # Código fonte Java (Spring Boot)
│   ├── src/              # Pacotes e recursos Java
│   ├── Dockerfile        # Dockerfile do backend
│   └── docker-compose.yml# Orquestração do Banco de Dados e App
├── frontend/             # Código fonte JavaScript/React (Vite)
│   ├── src/              # Componentes, Serviços e Hooks React
│   └── package.json      # Dependências frontend
└── README.md             # Instruções gerais do projeto (esta página)
```

---

## 📖 Documentação da API com Swagger

Para facilitar a avaliação e o teste dos endpoints do sistema, a API foi totalmente documentada com **Swagger / OpenAPI 3**.
A configuração foi planejada considerando as seguintes definições do `application.properties`:

*   A porta padrão do servidor é `8080`.
*   O caminho de contexto raiz (context-path) é `/api`.

Portanto, quando a aplicação está em execução (localmente ou via Docker), as URLs de acesso são:

*   🌐 **Interface Gráfica (Swagger UI):** [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)
*   📄 **Especificação OpenAPI (JSON):** [http://localhost:8080/api/v3/api-docs](http://localhost:8080/api/v3/api-docs)

No arquivo de configuração de segurança [SecurityConfig.java](file:///backend/src/main/java/br/com/joaomu/security/SecurityConfig.java), os caminhos do Swagger estão marcados como `.permitAll()`. Isso garante que qualquer um consiga abrir a documentação e ler a estrutura dos endpoints sem precisar de autenticação prévia. Esse acesso está sendo mantido momentaneamente enquanto o projeto está em desenvolvimento.

---

## 🚀 Como Executar o Projeto Rapidamente

A forma mais rápida e recomendada para rodar e testar o projeto completo é utilizando o **Docker**.

### **Pré-requisitos**
*   [Docker](https://www.docker.com/) instalado em sua máquina.

### **Passo 1: Subir o Backend e Banco de Dados**
Navegue até a pasta do backend e execute o docker-compose:
```bash
cd backend
docker compose up --build
```
*Este comando irá baixar a imagem do MySQL, compilar o código Java e subir o servidor do backend na porta `8080` de forma totalmente automatizada.*

### **Passo 2: Iniciar o Frontend (Ainda não "dockerizado")**
Em outro terminal, navegue até a pasta do frontend, instale as dependências e inicie o servidor de desenvolvimento:
```bash
cd frontend
npm install
npm run dev
```
*O frontend estará disponível em [http://localhost:5173](http://localhost:5173).*

---

## 🔒 Testando Rotas Protegidas no Swagger
A API possui rotas públicas e rotas protegidas por autenticação JWT (Bearer Token). Para testar requisições protegidas diretamente pelo Swagger UI:

1.  Acesse o **Swagger UI** em [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html).
2.  Crie um novo usuário no endpoint **`POST /api/auth/register`** ou faça login com **`POST /api/auth/login`**.
    *   Exemplo de JSON de envio:
        ```json
        {
          "username": "recrutador",
          "password": "senha_segura_123",
          "nome": "Recrutador Exemplo"
        }
        ```
3.  Copie o token gerado na propriedade `token` da resposta.
4.  Clique no botão **"Authorize"** no topo da página do Swagger, digite `Bearer ` seguido do token copiado (ex: `Bearer eyJhbGci...`) e clique em Authorize.
5.  Suas requisições nos endpoints protegidos serão enviadas com o cabeçalho de autenticação correto.