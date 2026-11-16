# Contribuindo com o Biblioteca Betim API

> Este documento orienta quem quiser contribuir com o projeto. Leia antes de abrir um Pull Request.

## Regras do projeto

- **Branchs**: 
  - `feature/*` — novas funcionalidades
  - `fix/*` — correções de bugs
  - `docs/*` — apenas documentação
  - `main` — versão estável

- **Commits**:
  - Use **Conventional Commits** (ex.: `feat: permite renovação de empréstimo`, `fix: corrige cálculo de fila`, `docs: atualiza README`)
  - Mantenha commits atômicos e bem descritos

- **Revisão**: Pull Requests devem passar por revisão antes de ser mesclados

## Como rodar os testes

```bash
# 1. Subir infraestrutura (Docker obrigatório)
docker compose up -d

# 2. Executar todos os testes
./mvnw test

# 3. Executar teste específico
./mvnw test -Dtest=NomeDaClasseTest
```

### Testes

- **12 testes** no total:
  - 1 teste de contexto (`ApiApplicationTests`)
  - 1 teste de integração com Testcontainers (`ReservarDevolverNotificarIntegrationTest`)
  - 10 testes unitários de serviços (`EmprestimoServiceTest`, `EmprestimoRenovacaoTest`, `FilaReservaTest`, `ReservaServiceTest`)

- O teste de integração **requer Docker** para o container PostgreSQL

## Checklist de Pull Request

- [ ] **Build limpo**: `./mvnw clean compile` ou `./mvnw clean package`
- [ ] **Testes verdes**: `./mvnw test` retorna `BUILD SUCCESS`
- [ ] **Testes cobrem nova funcionalidade** (se aplicável)
- [ ] **Migração Flyway** (se houver nova entidade):
  - [ ] Arquivo `Vx__descricao.sql` criado em `src/main/resources/db/migration/`
  - [ ] Nova migração está disponível para o banco
- [ ] **Documentação atualizada** (README.md, docs/API.md ou docs/ARCHITECTURE.md)
- [ ] **Não há `console.log`** ou prints desnecessários
- [ ] **Nome de arquivo/class** segue convenção do projeto

## Como adicionar uma nova entidade

Siga a ordem abaixo para adicionar uma nova entidade ao projeto:

### 1. Criar a entidade JPA
```java
// src/main/java/br/com/bibliotecabetim/api/model/NovaEntidade.java
@Entity
@Table(name = "nova_entidade")
@Getter @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class NovaEntidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    // campos...
}
```

### 2. Criar a migração Flyway
```sql
-- src/main/resources/db/migration/Vn__nova_entidade.sql
CREATE TABLE nova_entidade (
    id BIGSERIAL PRIMARY KEY,
    -- campos com tipos apropriados
);
```

### 3. Criar o Repository
```java
@Repository
public interface NovaEntidadeRepository extends JpaRepository<NovaEntidade, Long> {
    // queries derivadas ou @Query conforme necessário
}
```

### 4. Criar o Service (regras de negócio)
```java
@Service
@Transactional(readOnly = true)
public class NovaEntidadeService {
    // métodos de negócio
}
```

### 5. Criar o Controller
```java
@RestController
@RequestMapping("/api/novaentidade")
public class NovaEntidadeController {
    // endpoints REST
}
```

### 6. Criar os DTOs
- `NovaEntidadeRequest` (record para input)
- `NovaEntidadeResponse` (record para output)

### 7. Adicionar testes
- `NovaEntidadeServiceTest.java` (unitário)

### 8. Atualizar documentação
- `docs/API.md` — endpoints
- `docs/ARCHITECTURE.md` — se alterar fluxo arquitetural

## Padrões do projeto

- **DTOs como records**: sempre use `record` para request/response
- **IDs como Long**: todas as chaves primárias são `Long`
- **Transações explícitas**: `@Transactional` em methods que modificam dados
- **Response entities**: usa `ResponseEntity` para controle de status HTTP
- **Validação**: Bean Validation (`@NotBlank`, `@Email`, etc.)
- **Async**: notificações via `@Async` (não esperar resultado no sync)

## Variáveis de ambiente importantes

| Variável | Uso |
|----------|-----|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão PostgreSQL |
| `JWT_SECRET` | Assinatura do token JWT |
| `JWT_EXPIRATION_MS` | Tempo de expiração do token |
| `SMTP_HOST`, `SMTP_PORT` | Envio de e-mails |
| `LOAN_DAYS`, `MAX_RENEWALS`, `MAX_LOANS_PER_USER` | Regras de negócio |

## Contato

Para dúvidas sobre o projeto, abra uma *issue* no repositório ou entre em contato com a equipe de extensão.