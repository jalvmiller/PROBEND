-- Flyway
-- Version: 9
-- Description: Criação das tabelas para o sistema de trilhas e progresso individual
-- Author: Joao Muller

CREATE TABLE trilhas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    usuario_id BIGINT NOT NULL,
    is_publica BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL,
    CONSTRAINT fk_trilhas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE itens_trilha (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trilha_id BIGINT NOT NULL,
    questao_id BIGINT NOT NULL,
    ordem INT NOT NULL,
    CONSTRAINT fk_itens_trilha_trilha FOREIGN KEY (trilha_id) REFERENCES trilhas (id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_trilha_questao FOREIGN KEY (questao_id) REFERENCES questoes (id) ON DELETE CASCADE,
    CONSTRAINT uq_trilha_questao UNIQUE (trilha_id, questao_id)
);

CREATE TABLE inscricoes_trilha (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    trilha_id BIGINT NOT NULL,
    is_ativa BOOLEAN NOT NULL DEFAULT FALSE,
    inscrito_em DATETIME NOT NULL,
    CONSTRAINT fk_inscricoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_inscricoes_trilha FOREIGN KEY (trilha_id) REFERENCES trilhas (id) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_trilha UNIQUE (usuario_id, trilha_id)
);

CREATE TABLE progresso_itens_trilha (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    item_trilha_id BIGINT NOT NULL,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    concluido_em DATETIME,
    CONSTRAINT fk_progresso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_progresso_item FOREIGN KEY (item_trilha_id) REFERENCES itens_trilha (id) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_item_trilha UNIQUE (usuario_id, item_trilha_id)
);

CREATE INDEX idx_itens_trilha_ordem ON itens_trilha (trilha_id, ordem);
CREATE INDEX idx_inscricoes_ativa ON inscricoes_trilha (usuario_id, is_ativa);
