-- Flyway
-- Version: 7
-- Description: Visitor session isolation, adiciona flags de isolamento de conteudo
--              para suporte a multi-tenancy de visitantes no portfolio
-- Author: Joao Muller

-- Flag no CONTEUDO (questao/resolucao) para marcar o que veio do seeder.
-- Visivel para todos os visitantes. Tudo criado depois nasce FALSE.
ALTER TABLE questoes
    ADD COLUMN is_seeder_content BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE resolucoes
    ADD COLUMN is_seeder_content BOOLEAN NOT NULL DEFAULT FALSE;

-- Flag para identificar contas de visitante efemeras + timestamp de criacao.
ALTER TABLE usuarios
    ADD COLUMN is_visitor BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE usuarios
    ADD COLUMN criado_em DATETIME DEFAULT NOW();

-- Marca TODO conteudo ja existente como seeder.
UPDATE questoes   SET is_seeder_content = TRUE;
UPDATE resolucoes SET is_seeder_content = TRUE;
