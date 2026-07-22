# 🎓 PROBEND (nome provisório)

**PROBEND** é um sistema de gerenciamento e preparação de questões de matérias exatas e de algoritmos.

Este repositório foi estruturado com conteinerização (**Docker**), migrações de banco de dados versionadas (**Flyway**), armazenamento de objetos em nuvem/local (**MinIO/S3**), mensageria assíncrona (**RabbitMQ**), servidor mock de e-mails (**Mailpit**), segurança stateless com **JWT**, e documentação interativa de APIs com **Swagger (OpenAPI)**.

## 🛠️ Stack
### **Backend (Tecnologias Estruturais)**
*   **Java 21** & **Spring Boot 3**
*   **Spring Security & JWT** (Autenticação Stateless e Autorização)
*   **Spring Data JPA & Hibernate** (ORM e persistência de dados)
*   **MySQL 8.0** (Banco de dados relacional oficial)

### **Backend (Ferramentas)**
*   **Flyway Migration** (Gerenciamento e versionamento automatizado do banco de dados)
*   **MinIO / AWS S3 SDK** (Armazenamento de arquivos e anexos compatível com S3)
*   **RabbitMQ & Spring AMQP** (Mensageria e processamento assíncrono)
*   **Spring Mail & Mailpit** (Envio e testes de e-mail em ambiente local)
*   **Springdoc OpenAPI (Swagger)** (Documentação interativa da API)
*   **Maven** (Gerenciador de dependências e build)

### **Frontend**
*   **React 18** com **Vite** (Build rápido, HMR e ecossistema moderno)
*   **Axios** (Cliente HTTP para integração com a API REST)
*   **React Router** (Navegação client-side)
*   **KaTeX / MathJax** (Renderização de expressões matemáticas em LaTeX)
*   **CSS Customizado** (Interface responsiva e otimizada)

### **Infraestrutura**
*   **Docker & Docker Compose** (Ambiente padronizado)

---

## 🌐 Painéis e Serviços Locais

Quando os containers estiverem rodando via Docker Compose, os serviços estarão acessíveis nas seguintes portas locais:

| Serviço | Descrição | URL Local | Credenciais Padrão |
| :--- | :--- | :--- | :--- |
| **Backend API / Swagger UI** | Documentação Interativa da API | [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html) | *Acesso livre* |
| **MinIO Console** | Painel do Object Storage S3 | [http://localhost:9001](http://localhost:9001) | `minioadmin` / `minioadminpassword` |
| **MinIO API (S3 Endpoint)** | Endpoint S3 para upload/download | `http://localhost:9000` | N/A |
| **RabbitMQ Management** | Painel de Gestão de Mensageria e Filas | [http://localhost:15672](http://localhost:15672) | `guest` / `guest` |
| **Mailpit Web UI** | Visualizador de E-mails de Teste | [http://localhost:8025](http://localhost:8025) | N/A |
| **Frontend App** | Aplicação React (Servidor Dev) | [http://localhost:5173](http://localhost:5173) | N/A |

---

## 📁 Estrutura de Diretórios
```text
PROBEND/
├── backend/                  # Código fonte Java (Spring Boot)
│   ├── src/
│   │   └── main/
│   │       ├── java/br/com/joaomu/
│   │       │   ├── config/       # Configurações de serviços (MinIO, RabbitMQ, Mail, Security, OpenAPI)
│   │       │   ├── controller/   # Endpoints REST (Auth, Usuários, Questões, etc.)
│   │       │   ├── dto/          # Data Transfer Objects
│   │       │   ├── listener/     # Listeners de mensageria (RabbitMQ)
│   │       │   ├── model/        # Entidades JPA
│   │       │   ├── repo/         # Repositórios JPA
│   │       │   ├── security/     # Filtros e configurações de segurança JWT
│   │       │   └── service/      # Regras de negócio e integração
│   │       └── resources/
│   │           ├── db/migration/ # Migrações SQL do Flyway (V1__, V2__, etc.)
│   │           └── application.properties # Propriedades da aplicação
│   ├── Dockerfile            # Dockerfile do backend Spring Boot
│   ├── docker-compose.yml    # Orquestração (MySQL, MinIO, RabbitMQ, Mailpit, Backend)
│   └── pom.xml               # Arquivo de dependências Maven
│
├── frontend/                 # Código fonte React (Vite)
│   ├── src/
│   │   ├── assets/           # Arquivos estáticos (imagens, ícones, etc.)
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Contextos globais (ex: AuthContext)
│   │   ├── hooks/            # Hooks customizados (ex: useUser)
│   │   ├── pages/            # Telas da aplicação (Login, Perfil, Configurações)
│   │   ├── services/         # Serviços de integração com a API REST (api.js)
│   │   └── utils/            # Utilitários (ex: renderizadores LaTeX)
│   ├── package.json          # Dependências frontend
│   └── vite.config.js        # Configuração do Vite
│
└── README.md                 # Instruções e documentação geral do projeto
```