-- V2__notificacao_dedup_constraint.sql
-- Adiciona constraint única parcial para evitar notificações duplicadas
-- mesmo tipo + mesmo usuário + mesmo dia (baseado em DATE(enviada_em))

CREATE UNIQUE INDEX IF NOT EXISTS uk_notificacao_usuario_tipo_dia
    ON notificacao (usuario_id, tipo, DATE(enviada_em));