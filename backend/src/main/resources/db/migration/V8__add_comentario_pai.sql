-- Flyway
-- Version: 8
-- Description: Adiciona coluna pai_id e chave estrangeira na tabela comentarios para suporte a arvore de respostas
-- Author: Joao Muller

ALTER TABLE comentarios
    ADD COLUMN pai_id BIGINT NULL,
    ADD CONSTRAINT fk_comentarios_pai FOREIGN KEY (pai_id) REFERENCES comentarios (id) ON DELETE CASCADE;

CREATE INDEX idx_comentarios_resolucao_pai ON comentarios (resolucao_id, pai_id);
