# Documentação da API - Biblioteca Betim

> **Aviso**: Esta documentação foi gerada a partir do código-fonte. Se houver divergência, **o código é a fonte de verdade**.

---

## Autenticação

A API usa **JWT (JSON Web Token)** stateless. O fluxo:

1. **Registro**: `POST /api/auth/registro` → retorna token
2. **Login**: `POST /api/auth/login` → retorna token
3. **Uso**: Adicione header `Authorization: Bearer <token>` nas requisições protegidas

### Formato do Token
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "role": "MORADOR"
}
```

### Expiração
- Padrão: 24 horas (`86400000` ms, configurável via `JWT_EXPIRATION_MS`)
- Assinatura: HS256 com segredo configurável (`JWT_SECRET`)

---

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 204 | No Content - Sucesso sem corpo de resposta |
| 400 | Bad Request - Dados inválidos / violação de regra de negócio |
| 401 | Unauthorized - Token ausente, inválido ou expirado |
| 403 | Forbidden - Token válido, mas papel insuficiente |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Violação de constraint única (ex.: email/ISBN/código tombamento duplicado) |
| 500 | Internal Server Error - Erro interno (não esperado) |

---

## Formato de Erro

O projeto usa `ProblemDetail` (RFC 7807) via `@RestControllerAdvice` (`GlobalExceptionHandler`):

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Mensagem descritiva do erro",
  "instance": "/api/endpoint"
}
```

---

## Endpoints

### 1. Autenticação (`/api/auth`)

| Método | Path | Autorização | Descrição |
|--------|------|-------------|-----------|
| POST | `/registro` | Pública | Cadastro de morador |
| POST | `/login` | Pública | Login (retorna JWT) |

#### `POST /api/auth/registro`

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com.br",
  "cpf": "111.222.333-44",
  "telefone": "(31) 99999-9999",
  "senha": "minhasenha123"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "role": "MORADOR"
}
```

**Erros:**
- 400: Email já cadastrado
- 400: CPF já cadastrado
- 400: Dados inválidos

---

#### `POST /api/auth/login`

**Request:**
```json
{
  "email": "joao@email.com.br",
  "senha": "minhasenha123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "role": "MORADOR"
}
```

**Erros:**
- 401: Credenciais inválidas

---

### 2. Catálogo de Livros (`/api/livros`)

| Método | Path | Autorização | Descrição |
|--------|------|-------------|-----------|
| GET | `/livros` | Pública | Listagem paginada com busca |
| GET | `/livros/{id}` | Pública | Detalhe do livro |
| POST | `/livros` | BIBLIOTECARIO | Criar livro |
| PUT | `/livros/{id}` | BIBLIOTECARIO | Atualizar livro |
| DELETE | `/livros/{id}` | BIBLIOTECARIO | Excluir livro |

#### `GET /api/livros`

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `busca` | String | Não | Busca por título, autor ou ISBN (ILIKE) |
| `categoria` | String | Não | Filtro por categoria (exato) |
| `page` | Integer | Não | Página (padrão 0) |
| `size` | Integer | Não | Tamanho da página (padrão 10, máx 50) |

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "titulo": "Dom Casmurro",
      "autor": "Machado de Assis",
      "isbn": "978-85-0000000-1",
      "categoria": "Romance",
      "anoPublicacao": 1899,
      "resumo": "Dom Casmurro é um dos mais famosos romances...",
      "capaUrl": "https://capa.exemplo/dom-casmurro.jpg",
      "disponivel": true
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

---

#### `GET /api/livros/{id}`

**Response 200:**
```json
{
  "id": 1,
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-85-0000000-1",
  "categoria": "Romance",
  "anoPublicacao": 1899,
  "resumo": "Dom Casmurro é um dos mais famosos romances de Machado de Assis...",
  "capaUrl": "https://capa.exemplo/dom-casmurro.jpg",
  "disponivel": true
}
```

**Erros:**
- 404: Livro não encontrado

---

#### `POST /api/livros` (BIBLIOTECARIO)

**Request:**
```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-85-0000000-1",
  "categoria": "Romance",
  "anoPublicacao": 1899,
  "resumo": "Resumo do livro...",
  "capaUrl": "https://exemplo.com/capa.jpg"
}
```

**Response 201:**
```json
{
  "id": 1,
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-85-0000000-1",
  "categoria": "Romance",
  "anoPublicacao": 1899,
  "resumo": "Resumo do livro...",
  "capaUrl": "https://exemplo.com/capa.jpg",
  "disponivel": false
}
```

**Erros:**
- 400: ISBN já existe
- 403: Acesso negado (não é BIBLIOTECARIO)
- 401: Não autenticado

---

#### `PUT /api/livros/{id}` (BIBLIOTECARIO)

**Request:** (mesmo formato do POST)

**Response 200:** (mesmo formato do GET)

**Erros:**
- 400: ISBN já existe (em outro livro)
- 403: Acesso negado
- 404: Livro não encontrado

---

#### `DELETE /api/livros/{id}` (BIBLIOTECARIO)

**Response 204:** Sem corpo

**Erros:**
- 403: Acesso negado
- 404: Livro não encontrado

---

### 3. Exemplares (`/api/livros/{livroId}/exemplares`)

| Método | Path | Autorização | Descrição |
|--------|------|-------------|-----------|
| POST | `/livros/{livroId}/exemplares` | BIBLIOTECARIO | Criar exemplar |
| PUT | `/livros/{livroId}/exemplares/{id}` | BIBLIOTECARIO | Atualizar exemplar |
| DELETE | `/livros/{livroId}/exemplares/{id}` | BIBLIOTECARIO | Excluir exemplar |

#### `POST /api/livros/{livroId}/exemplares` (BIBLIOTECARIO)

**Request:**
```json
{
  "codigoTombamento": "TOM-001",
  "status": "DISPONIVEL"
}
```

**Response 201:**
```json
{
  "id": 1,
  "livroId": 1,
  "codigoTombamento": "TOM-001",
  "status": "DISPONIVEL"
}
```

**Erros:**
- 400: Código de tombamento duplicado
- 404: Livro não encontrado

---

#### `PUT /api/livros/{livroId}/exemplares/{id}` (BIBLIOTECARIO)

**Request:**
```json
{
  "codigoTombamento": "TOM-002",
  "status": "INDISPONIVEL"
}
```

**Response 200:** (mesmo formato do GET)

**Erros:**
- 400: Código de tombamento duplicado
- 404: Exemplar não encontrado ou não pertence ao livro

---

#### `DELETE /api/livros/{livroId}/exemplares/{id}` (BIBLIOTECARIO)

**Response 204:** Sem corpo

---

### 4. Empréstimos (`/api/emprestimos`)

| Método | Path | Autorização | Descrição |
|--------|------|-------------|-----------|
| POST | `/emprestimos` | BIBLIOTECARIO | Registrar empréstimo |
| POST | `/emprestimos/{id}/devolucao` | BIBLIOTECARIO | Registrar devolução |
| POST | `/emprestimos/{id}/renovacao` | BIBLIOTECARIO | Renovar empréstimo |
| GET | `/emprestimos/me` | MORADOR/BIBLIOTECARIO | Meus empréstimos |

#### `POST /api/emprestimos` (BIBLIOTECARIO)

**Request:**
```json
{
  "exemplarId": 10,
  "usuarioId": 1
}
```

**Response 201:**
```json
{
  "id": 1000,
  "exemplarId": 10,
  "livroId": 1,
  "codigoTombamento": "TOM-001",
  "usuarioId": 1,
  "usuarioNome": "Maria Moradora",
  "dataEmprestimo": "2024-01-15",
  "dataPrevistaDevolucao": "2024-01-29",
  "dataDevolucao": null,
  "renovacoes": 0
}
```

**Erros:**
- 400: Usuário inativo
- 400: Exemplar não disponível
- 400: Usuário tem empréstimo em atraso
- 400: Usuário atingiu limite de 3 empréstimos simultâneos
- 404: Usuário/Exemplar não encontrado

---

#### `POST /api/emprestimos/{id}/devolucao` (BIBLIOTECARIO)

**Response 200:** (mesmo formato, com `dataDevolucao` preenchida)

**Erros:**
- 400: Empréstimo já devolvido
- 404: Empréstimo não encontrado

> **Nota**: Se houver fila de reserva, o exemplar fica `RESERVADO` para o primeiro da fila e a notificação `RESERVA_DISPONIVEL` é enviada.

---

#### `POST /api/emprestimos/{id}/renovacao` (BIBLIOTECARIO)

**Response 200:** (com `dataPrevistaDevolucao` estendida, `renovacoes` incrementado)

**Erros:**
- 400: Empréstimo já devolvido
- 400: Limite de 2 renovações atingido
- 400: Há reserva ativa para este livro
- 404: Empréstimo não encontrado

---

#### `GET /api/emprestimos/me` (MORADOR/BIBLIOTECARIO)

**Response 200:**
```json
[
  {
    "id": 1000,
    "exemplarId": 10,
    "livroId": 1,
    "codigoTombamento": "TOM-001",
    "usuarioId": 1,
    "usuarioNome": "Maria Moradora",
    "dataEmprestimo": "2024-01-15",
    "dataPrevistaDevolucao": "2024-01-29",
    "dataDevolucao": null,
    "renovacoes": 0
  }
]
```

---

### 5. Reservas (`/api/livros/{livroId}/reservas`)

| Método | Path | Autorização | Descrição |
|--------|------|-------------|-----------|
| POST | `/livros/{livroId}/reservas` | MORADOR/BIBLIOTECARIO | Reservar livro |
| DELETE | `/livros/{livroId}/reservas/{id}` | MORADOR/BIBLIOTECARIO | Cancelar reserva própria |
| GET | `/livros/{livroId}/reservas/fila` | MORADOR/BIBLIOTECARIO | Posição na fila |

#### `POST /api/livros/{livroId}/reservas` (MORADOR/BIBLIOTECARIO)

**Response 200:**
```json
{
  "id": 100,
  "livroId": 1,
  "livroTitulo": "Dom Casmurro",
  "usuarioId": 1,
  "dataReserva": "2024-01-15T10:30:00",
  "status": "ATIVA",
  "posicao": 1
}
```

**Erros:**
- 400: Há exemplar disponível para empréstimo
- 400: Usuário já tem reserva ativa para este livro
- 404: Livro não encontrado

---

#### `DELETE /api/livros/{livroId}/reservas/{id}` (MORADOR/BIBLIOTECARIO)

**Response 204:** Sem corpo

**Erros:**
- 403: Reserva não pertence ao usuário
- 404: Reserva não encontrada

---

#### `GET /api/livros/{livroId}/reservas/fila` (MORADOR/BIBLIOTECARIO)

**Response 200:**
```json
{
  "livroId": 1,
  "livroTitulo": "Dom Casmurro",
  "posicaoUsuario": 1,
  "totalFila": 3
}
```

---

### 6. Meu Perfil (`/api/me`)

| Método | Path | Autorização | Descrição |
|--------|------|-------------|-----------|
| GET | `/me/emprestimos` | MORADOR/BIBLIOTECARIO | Meus empréstimos |
| GET | `/me/reservas` | MORADOR/BIBLIOTECARIO | Minhas reservas |
| GET | `/me/notificacoes` | MORADOR/BIBLIOTECARIO | Minhas notificações |
| PATCH | `/me/notificacoes/{id}/lida` | MORADOR/BIBLIOTECARIO | Marcar como lida |

#### `GET /api/me/emprestimos`

Igual a `GET /api/emprestimos/me` mas sem exigir papel BIBLIOTECARIO.

---

#### `GET /api/me/reservas`

**Response 200:**
```json
[
  {
    "id": 100,
    "livroId": 1,
    "livroTitulo": "Dom Casmurro",
    "usuarioId": 1,
    "dataReserva": "2024-01-15T10:30:00",
    "status": "ATIVA",
    "posicao": 1
  }
]
```

---

#### `GET /api/me/notificacoes`

**Response 200:**
```json
[
  {
    "id": 1,
    "tipo": "RESERVA_DISPONIVEL",
    "mensagem": "O livro \"Dom Casmurro\" está disponível para retirada. Você tem 48 horas...",
    "enviadaEm": "2024-01-15T10:30:00",
    "lida": false,
    "canal": "EMAIL"
  }
]
```

---

#### `PATCH /api/me/notificacoes/{id}/lida`

**Response 204:** Sem corpo

**Erros:**
- 403: Notificação não pertence ao usuário
- 404: Notificação não encontrada

---

## Usuários Seed (perfil `dev`)

Ao rodar com `SPRING_PROFILES_ACTIVE=dev`, a classe `DevDataLoader` popula:

| Email | Papel | Senha |
|-------|-------|-------|
| `biblio@bibliotecabetim.br` | BIBLIOTECARIO | `biblio123` |
| `maria@email.com.br` | MORADOR | `morador123` |

> As senhas são hasheadas com BCrypt no seed.

---

## Links

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health Check: `GET /actuator/health`