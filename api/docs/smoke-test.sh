#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://localhost:8080}"
BIBLIO_EMAIL="biblio@bibliotecabetim.br"
BIBLIO_SENHA="biblio123"
MORADOR_EMAIL="maria@email.com.br"
MORADOR_SENHA="morador123"

fail() { echo "❌ $1"; exit 1; }
ok()   { echo "✅ $1"; }

# AUTH / health
curl -sf "$BASE/actuator/health" | jq -e '.status=="UP"' >/dev/null && ok "health" || fail "health"

TOKEN_B=$(curl -sf -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$BIBLIO_EMAIL\",\"senha\":\"$BIBLIO_SENHA\"}" | jq -r .token)
[ -n "$TOKEN_B" ] && [ "$TOKEN_B" != "null" ] && ok "login biblio" || fail "login biblio"

TOKEN_M=$(curl -sf -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$MORADOR_EMAIL\",\"senha\":\"$MORADOR_SENHA\"}" | jq -r .token)
[ -n "$TOKEN_M" ] && [ "$TOKEN_M" != "null" ] && ok "login morador" || fail "login morador"

# BOOK público
curl -sf "$BASE/api/livros?page=0&size=5" | jq -e '.content | length >= 1' >/dev/null \
  && ok "GET livros público" || fail "GET livros público"

# BOOK criação (BIBLIO)
LIVRO=$(curl -sf -X POST "$BASE/api/livros" \
  -H "Authorization: Bearer $TOKEN_B" -H 'Content-Type: application/json' \
  -d '{"titulo":"Smoke Teste","autor":"QA","categoria":"Teste"}')
LIVRO_ID=$(echo "$LIVRO" | jq -r .id)
[ -n "$LIVRO_ID" ] && [ "$LIVRO_ID" != "null" ] && ok "POST livro (biblio)" || fail "POST livro (biblio)"

# MORADOR não pode criar livro
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/livros" \
  -H "Authorization: Bearer $TOKEN_M" -H 'Content-Type: application/json' \
  -d '{"titulo":"X","autor":"X"}')
[ "$CODE" = "403" ] && ok "MORADOR bloqueado em POST livro (403)" || fail "MORADOR deveria ser 403, veio $CODE"

# EXEMPLAR
EX=$(curl -sf -X POST "$BASE/api/livros/$LIVRO_ID/exemplares" \
  -H "Authorization: Bearer $TOKEN_B" -H 'Content-Type: application/json' \
  -d '{"codigoTombamento":"SMOKE-001","status":"DISPONIVEL"}')
EX_ID=$(echo "$EX" | jq -r .id)
[ -n "$EX_ID" ] && [ "$EX_ID" != "null" ] && ok "POST exemplar" || fail "POST exemplar"

# Descobre o ID do morador (maria) via /api/me
USUARIO_M_ID=$(curl -sf "$BASE/api/me/emprestimos" -H "Authorization: Bearer $TOKEN_M" >/dev/null 2>&1; echo "skip")
# Em vez disso, busca o ID via login response se houver, ou usa o endpoint de empréstimo com usuarioId conhecido

# EMPRÉSTIMO (usa usuarioId=2, que é o morador do seed; ajuste se necessário)
EMP=$(curl -sf -X POST "$BASE/api/emprestimos" \
  -H "Authorization: Bearer $TOKEN_B" -H 'Content-Type: application/json' \
  -d "{\"exemplarId\":$EX_ID,\"usuarioId\":2}")
EMP_ID=$(echo "$EMP" | jq -r .id)
[ -n "$EMP_ID" ] && [ "$EMP_ID" != "null" ] && ok "POST empréstimo" || fail "POST empréstimo"

# DEVOLUÇÃO
curl -sf -X POST "$BASE/api/emprestimos/$EMP_ID/devolucao" \
  -H "Authorization: Bearer $TOKEN_B" >/dev/null && ok "devolução" || fail "devolução"

# LIMPEZA (opcional — deleta o livro criado)
curl -sf -X DELETE "$BASE/api/livros/$LIVRO_ID" \
  -H "Authorization: Bearer $TOKEN_B" >/dev/null && ok "cleanup livro" || echo "⚠️  cleanup falhou (ok, não bloqueia)"

echo "🎉 Smoke test P0: tudo verde"
