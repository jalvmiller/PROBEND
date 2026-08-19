-- Flyway
-- Version: 6.0
-- Description: Criação da tabela de comentários em resoluções
-- Author: João Müller

CREATE TABLE comentarios (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    conteudo   TEXT        NOT NULL,
    resolucao_id BIGINT   NOT NULL,
    usuario_id BIGINT      NOT NULL,
    data_criacao DATETIME,
    CONSTRAINT fk_comentarios_resolucao FOREIGN KEY (resolucao_id) REFERENCES resolucoes (id) ON DELETE CASCADE,
    CONSTRAINT fk_comentarios_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios (id)   ON DELETE CASCADE
);
