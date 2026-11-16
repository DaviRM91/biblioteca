-- V1__schema.sql
-- Schema inicial da API da Biblioteca Betim

CREATE TABLE usuario (
    id             BIGSERIAL PRIMARY KEY,
    nome           VARCHAR(200) NOT NULL,
    email          VARCHAR(200) NOT NULL UNIQUE,
    cpf            VARCHAR(14) UNIQUE,
    telefone       VARCHAR(20),
    senha_hash     VARCHAR(255) NOT NULL,
    papel          VARCHAR(20) NOT NULL,
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE livro (
    id              BIGSERIAL PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    autor           VARCHAR(200) NOT NULL,
    isbn            VARCHAR(20) UNIQUE,
    categoria       VARCHAR(100),
    ano_publicacao  INTEGER,
    resumo          TEXT,
    capa_url        VARCHAR(500)
);

CREATE TABLE exemplar (
    id                 BIGSERIAL PRIMARY KEY,
    livro_id           BIGINT NOT NULL REFERENCES livro(id),
    codigo_tombamento  VARCHAR(50) NOT NULL UNIQUE,
    status             VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL'
);

CREATE TABLE emprestimo (
    id                     BIGSERIAL PRIMARY KEY,
    exemplar_id            BIGINT NOT NULL REFERENCES exemplar(id),
    usuario_id             BIGINT NOT NULL REFERENCES usuario(id),
    data_emprestimo        DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao         DATE,
    renovacoes             INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE reserva (
    id          BIGSERIAL PRIMARY KEY,
    livro_id    BIGINT NOT NULL REFERENCES livro(id),
    usuario_id  BIGINT NOT NULL REFERENCES usuario(id),
    data_reserva TIMESTAMP NOT NULL DEFAULT NOW(),
    status      VARCHAR(20) NOT NULL DEFAULT 'ATIVA'
);

CREATE TABLE notificacao (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES usuario(id),
    tipo        VARCHAR(30) NOT NULL,
    mensagem    TEXT NOT NULL,
    enviada_em  TIMESTAMP NOT NULL DEFAULT NOW(),
    lida        BOOLEAN NOT NULL DEFAULT FALSE,
    canal       VARCHAR(20) NOT NULL DEFAULT 'EMAIL'
);

CREATE INDEX idx_emprestimo_usuario_ativo ON emprestimo(usuario_id) WHERE data_devolucao IS NULL;
CREATE INDEX idx_emprestimo_prevista ON emprestimo(data_prevista_devolucao);
CREATE INDEX idx_reserva_livro_status ON reserva(livro_id, status);
CREATE INDEX idx_reserva_data_status ON reserva(data_reserva, status);
CREATE INDEX idx_notificacao_usuario ON notificacao(usuario_id);
