# Biblioteca Betim - Sistema de Acesso e Devolução

![Status](https://img.shields.io/badge/status-concluído-brightgreen)
![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-lightblue)
![License](https://img.shields.io/badge/license-MIT-green)

## 1. Sobre o Projeto

Este software foi desenvolvido como parte das Atividades Extensionistas do curso de CST em Análise e Desenvolvimento de Sistemas da UNINTER. O projeto tem como objetivo principal propor uma solução tecnológica para facilitar o acesso, a reserva e a devolução de livros na Biblioteca Pública Municipal Leonor de Aguiar Batista, localizada em Betim (MG).

O foco central do desenvolvimento foi a **Inclusão Digital**. Por isso, a plataforma foi projetada para ser acessível, priorizando a usabilidade para idosos e pessoas com baixa visão, que representam uma parcela significativa dos usuários da biblioteca.

### 1.1 Alinhamento com os ODS
O projeto contribui diretamente para dois Objetivos de Desenvolvimento Sustentável da ONU:
* **ODS 04 (Educação de Qualidade):** Ao facilitar o acesso à leitura, à cultura e ao conhecimento.
* **ODS 11 (Cidades e Comunidades Sustentáveis):** Ao modernizar e otimizar o uso dos recursos de um equipamento público cultural.

---

## 2. Arquitetura e Estrutura do Repositório

O projeto utiliza a arquitetura **Cliente-Servidor (Monorepo)**, dividindo-se em duas aplicações independentes que se comunicam via API RESTful.

* `/api`: Backend da aplicação, responsável pelas regras de negócio, segurança e persistência de dados.
* `/projeto-web`: Frontend da aplicação, uma SPA (Single Page Application) responsiva focada na experiência do usuário final.

### 2.1 Funcionalidades Principais

**Para o Morador (Usuário Final):**
* **Catálogo Público:** Consulta de livros com filtros por título, autor ou categoria.
* **Reserva e Fila de Espera:** Possibilidade de reservar livros que estão emprestados, entrando em uma fila FIFO (First-In, First-Out) e acompanhando a posição em tempo real.
* **Acessibilidade Avançada:** 
  * Leitura em voz alta (TTS - Text-to-Speech) dos resumos dos livros, utilizando a Web Speech API nativa do navegador.
  * Alternância de temas (Claro, Escuro e Alto Contraste).
  * Redimensionamento da escala de fontes.
* **Notificações:** Recebimento automático de e-mails com lembretes de prazos de devolução e avisos de atraso.

**Para o Bibliotecário (Administração via API/Swagger):**
* Gestão do acervo (Cadastro, edição e exclusão de livros e exemplares).
* Controle de empréstimos e devoluções.
* Gestão de renovações (com limite configurável e bloqueio caso haja reserva ativa na fila).

---

## 3. Tecnologias Utilizadas

**Backend:**
* Java 21
* Spring Boot 4.1.2 (Spring Web, Spring Data JPA, Spring Security)
* PostgreSQL 16 (Banco de dados relacional)
* Flyway (Versionamento e migração do banco de dados)
* Autenticação Stateless com JWT (JSON Web Tokens)
* SpringDoc OpenAPI / Swagger (Documentação da API)
* Testcontainers (Testes de integração com banco real)
* JUnit 5 e Mockito (Testes unitários)

**Frontend:**
* React 18
* TypeScript
* Vite (Build tool)
* Tailwind CSS (Estilização Mobile-first)
* React Router DOM (Navegação SPA)
* Axios (Cliente HTTP)

**Infraestrutura de Desenvolvimento:**
* Docker e Docker Compose (PostgreSQL e MailHog)

---

## 4. Estrutura de Pastas

```text
/
├── api/                  # Código-fonte do Backend (Spring Boot)
│   ├── src/main/java/    # Controllers, Services, Repositories, Entities
│   ├── src/main/resources/db/migration/ # Scripts Flyway
│   └── src/test/java/    # Testes unitários e de integração
│
├── projeto-web/          # Código-fonte do Frontend (React)
│   ├── src/api/          # Configuração do Axios e chamadas à API
│   ├── src/components/   # Componentes reutilizáveis de UI
│   ├── src/contexts/     # Contextos de Autenticação e Acessibilidade
│   └── src/pages/        # Telas da aplicação (Catálogo, Login, etc.)
│
├── docker-compose.yml    # Orquestração dos containers (Postgres, MailHog)
└── README.md             # Documentação principal
5. Como Executar o Projeto
Pré-requisitos
Certifique-se de ter instalado em sua máquina:

Java 21 (JDK) e variável JAVA_HOME configurada.

Node.js (versão 20 ou superior).

Docker e Docker Compose.

5.1 Subindo a Infraestrutura (Docker)
Na raiz do projeto, execute o comando para subir o PostgreSQL e o MailHog (servidor de e-mail fake para capturar as notificações em ambiente de desenvolvimento):

bash
docker compose up -d
5.2 Rodando o Backend (API)
Abra um terminal, navegue até a pasta da API e inicie a aplicação:

bash
cd api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
A API estará disponível em: http://localhost:8080

A documentação interativa (Swagger) estará em: http://localhost:8080/swagger-ui.html

O banco de dados será criado e populado automaticamente pelo Flyway e pelo DevDataLoader.

5.3 Rodando o Frontend (Web)
Abra um segundo terminal, navegue até a pasta do frontend, instale as dependências e inicie o servidor Vite:

bash
cd projeto-web
npm install
npm run dev
A interface estará disponível em: http://localhost:5173

6. Credenciais de Teste (Ambiente de Desenvolvimento)
O banco de dados é populado automaticamente com os seguintes usuários para facilitar os testes:

Perfil	E-mail	Senha	Permissões
Bibliotecário	biblio@bibliotecabetim.br	biblio123	Acesso total à gestão do acervo e empréstimos.
Morador	maria@email.com.br	morador123	Acesso ao catálogo, reservas e próprios empréstimos.
Dica: Para testar o fluxo completo de reserva, faça login como Bibliotecário (via Swagger) e registre um empréstimo. Em seguida, faça login como Morador no site e tente reservar o mesmo livro.

7. Testes e Qualidade de Software
O backend do projeto conta com uma suíte de testes automatizados para garantir a integridade das regras de negócio e a estabilidade da aplicação.

Testes Unitários: Utilização de JUnit 5 e Mockito para validar serviços (como as regras de renovação e fila de reservas) isoladamente.

Testes de Integração: Utilização de Testcontainers para subir um banco PostgreSQL efêmero em Docker e testar o fluxo completo (reserva, devolução e disparo de notificação).

Para executar toda a suíte de testes (o Docker deve estar em execução):

bash
cd api
./mvnw test
8. Autor
Davi Rodrigues de Morais
