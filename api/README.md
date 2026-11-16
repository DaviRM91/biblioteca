# Biblioteca Betim API

API complementar ao sistema da Biblioteca Pública Municipal Leonor de Aguiar Batista (Betim, MG), voltada ao morador. Projeto de extensão universitária (UNINTER, ODS 4 e 11).

## Tecnologias

- Java 21, Spring Boot 4.1.2
- Spring Web MVC, Spring Data JPA, PostgreSQL
- Flyway (migrations), Spring Security (JWT stateless), Bean Validation
- Springdoc OpenAPI (Swagger UI em `/swagger-ui`)
- JavaMailSender (@Async), @Scheduled (jobs)
- Lombok, DevTools, Actuator
- Testcontainers + JUnit 5 (testes de integração)

## Estrutura de pacotes

`br.com.bibliotecabetim.api`

- `model` — entidades JPA e enums
- `dto` — records de request/response (nunca expõe entidades nos controllers)
- `repository` — repositórios JPA
- `service` — regras de negócio
- `controller` — controllers REST sob prefixo `/api`
- `security` — JWT, filtro, `SecurityConfig`
- `config` — CORS, OpenAPI, `AppProperties`, scheduling
- `exception` — `@RestControllerAdvice` (ProblemDetail RFC 7807)
- `job` — tarefas agendadas
- `seed` — `DevDataLoader` (perfil `dev`)

## Como rodar

### 1. Iniciar infraestrutura (PostgreSQL + MailHog)

```bash
docker compose up -d
```

Isso sobe o PostgreSQL na porta `5432` e o MailHog nas portas `1025` (SMTP) e `8025` (interface web).

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` ou exporte as variáveis antes de rodar:

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `bibliotecabetim` | Nome do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `postgres` | Senha do banco |
| `JWT_SECRET` | `change-me-in-production-min-32-chars` | Segredo para assinar JWT (base64) |
| `JWT_EXPIRATION_MS` | `86400000` | Expiração do token (ms) |
| `SMTP_HOST` | `localhost` | Host SMTP |
| `SMTP_PORT` | `1025` | Porta SMTP (MailHog em dev) |
| `SMTP_USER` | `` | Usuário SMTP |
| `SMTP_PASSWORD` | `` | Senha SMTP |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origens do front (CORS) |
| `SERVER_PORT` | `8080` | Porta da API |
| `LOAN_DAYS` | `14` | Prazo padrão de empréstimo (dias) |
| `MAX_RENEWALS` | `2` | Máximo de renovações |
| `MAX_LOANS_PER_USER` | `3` | Máximo de empréstimos simultâneos |
| `RESERVATION_HOLD_HOURS` | `48` | Tempo de reserva (horas) |

Exemplo com `export`:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=bibliotecabetim
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=seu-segredo-base64-de-no-minimo-32-caracteres
export SPRING_PROFILES_ACTIVE=dev
```

### 3. Rodar a aplicação

```bash
./mvnw spring-boot:run
```

Ou gerar o jar:

```bash
./mvnw clean package -DskipTests
java -jar target/api-0.0.1-SNAPSHOT.jar
```

### 4. Executar testes

```bash
./mvnw test
```

Testes de integração usam Testcontainers (PostgreSQL). Certifique-se de ter Docker rodando.

## Swagger / OpenAPI

Após iniciar a aplicação, acesse:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Endpoints (prefixo `/api`)

### Autenticação (público)
- `POST /auth/registro` — cadastro de morador
- `POST /auth/login` — login (retorna JWT Bearer)

### Catálogo (público)
- `GET /livros?busca=&categoria=&page=&size=` — listagem paginada com busca por título/autor/ISBN e filtro por categoria; indica disponibilidade
- `GET /livros/{id}` — detalhe do livro (inclui `resumo`, texto puro sem HTML)

### Exemplares (BIBLIOTECARIO)
- `POST /livros/{livroId}/exemplares`
- `PUT /livros/{livroId}/exemplares/{id}`
- `DELETE /livros/{livroId}/exemplares/{id}`

### Empréstimos (BIBLIOTECARIO)
- `POST /emprestimos` — registrar empréstimo
- `POST /emprestimos/{id}/devolucao` — registrar devolução
- `POST /emprestimos/{id}/renovacao` — renovar empréstimo

### Meu perfil (MORADOR / BIBLIOTECARIO)
- `GET /me/emprestimos` — meus empréstimos
- `GET /me/reservas` — minhas reservas
- `GET /me/notificacoes` — minhas notificações
- `PATCH /me/notificacoes/{id}/lida` — marcar notificação como lida

### Reservas e fila
- `POST /livros/{livroId}/reservas` — reservar livro (só quando não há exemplar disponível)
- `DELETE /reservas/{id}` — cancelar reserva própria
- `GET /livros/{livroId}/fila` — posição do usuário logado e total da fila (sem expor outros usuários)

### Regras de negócio resumidas

- Prazo padrão de empréstimo: 14 dias (configurável via `LOAN_DAYS`)
- Máximo de 2 renovações, somente se não houver reserva ATIVA para o livro
- Limite de 3 empréstimos simultâneos por usuário
- Bloquear novo empréstimo se houver atraso
- Reserva só quando não há exemplar `DISPONIVEL`; uma reserva ATIVA por usuário por livro
- Ao devolver com fila: primeiro da fila recebe notificação `RESERVA_DISPONIVEL` e exemplar fica `RESERVADO` por 48h
- Jobs: 08:00 (lembrete/atraso) e a cada hora (expirar reservas e avançar fila)

## Perfis

- `dev`: seed de dados de exemplo (livros, exemplares, bibliotecário e morador), logging detalhado, MailHog
- `prod`: logging enxuto, segredos obrigatórios via variáveis de ambiente

Seed do perfil `dev`:
- Bibliotecário: `biblio@bibliotecabetim.br` / `biblio123`
- Morador: `maria@email.com.br` / `morador123`

## Documentação adicional

- [API.md](docs/API.md) — Documentação completa dos endpoints com exemplos de request/response
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Arquitetura, modelo de dados, fluxos e decisões técnicas
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) — Guia de contribuição, como adicionar entidades, checklist de PR

## Variáveis de ambiente

Veja [.env.example](.env.example) para a lista completa de variáveis suportadas.
