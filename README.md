## TechMarket API — Projeto Interdisciplinar

Este repositório contém uma API simples para um cenário de exercício aplicado à TechMarket — uma loja de e-commerce — com foco em transações financeiras, responsividade do front-end, validações e propostas de escalonamento.

O objetivo deste README é explicar a proposta do trabalho interdisciplinar, como usar o projeto localmente e descrever as soluções técnicas propostas para os cinco desafios solicitados.

---

## Sumário

- Visão geral do problema
- Como rodar o projeto localmente
- Endpoints disponíveis (API de transferências)
- Passos do desafio e soluções propostas
  - Passo 1: Computação em Nuvem (Escalonamento)
  - Passo 2: Frameworks e endpoint de transferências
  - Passo 3: Programação Web (extrato responsivo)
  - Passo 4: Banco de dados (procedure para saldo e extrato)
  - Passo 5: JavaScript (validações de formulário)
- Próximos passos e melhorias

---

## Visão geral do problema

A TechMarket enfrenta falhas e lentidão em períodos de pico (ex.: Black Friday). Problemas detectados incluem:

- Falhas recorrentes em horários de pico
- Latência elevada em transações (>5s)
- Arquitetura monolítica e escalonamento vertical apenas
- Banco de dados sobrecarregado por consultas não otimizadas
- Frontend não responsivo (40% do tráfego em mobile)
- Falta de resiliência regional
- Não conformidade com requisitos de disponibilidade regulatória
- Sessões não persistentes
- Ausência de monitoramento em tempo real
- Custos altos com infraestrutura ineficiente

Impacto estimado: perda de R$ 2,1 milhões por hora durante indisponibilidades.

O trabalho exige propor soluções técnicas para os cinco principais desafios e implementar parte delas no código fornecido.

---

## Como rodar o projeto

Requisitos:

- Java 11+ (ou versão compatível com o projeto Maven)
- Maven

Comandos básicos (PowerShell/Windows):

```powershell
mvn clean package
mvn spring-boot:run
```

Ou execute o JAR após empacotar:

```powershell
java -jar target\techmarket-api-0.0.1-SNAPSHOT.jar
```

Executar testes:

```powershell
mvn test
```

Arquivos importantes no projeto:

- `src/main/java/br/com/techmarket/techmarket_api/TransacaoController.java` — controlador REST para transações
- `src/main/java/br/com/techmarket/techmarket_api/TransferenciaRequest.java` — DTO de requisição de transferência
- `src/main/java/br/com/techmarket/techmarket_api/Transacao.java` — modelo de transação
- `src/main/resources/static/` — front-end estático (extrato, scripts)

---

## Endpoints (exemplo)

Este projeto contém um endpoint para realizar transferências financeiras. Exemplo:

- POST /transferencia — realiza uma transferência financeira

Exemplo de payload (JSON):

```json
{
  "contaOrigem": "123456",
  "contaDestino": "654321",
  "valor": 1500.00
}
```

Resposta esperada:

- 200 OK + corpo com confirmação e código único da operação;
- 400 Bad Request em caso de validação (saldo insuficiente, dados inválidos).

Observação: consulte `TransacaoController` e `TransferenciaRequest` para detalhes da implementação.

---

## Soluções propostas por desafio

### Passo 1 — Computação em Nuvem (Escalonamento)

Diferença entre escalonamento vertical e horizontal:

- Escalonamento vertical: aumentar recursos (CPU, RAM, IOPS) de uma única máquina/instância. Fácil, mas limitado pelo máximo da máquina; downtime possível para upgrades e custo marginalmente alto.
- Escalonamento horizontal: adicionar mais instâncias menores e distribuir a carga entre elas (load balancer). Escalável, tolerante a falhas e permite auto-scaling.

Proposta para configurar a aplicação horizontalmente:

1. Containerizar a aplicação com Docker e empacotar como imagem.
2. Implementar um Load Balancer (ELB/ALB na AWS, ou Ingress no Kubernetes) na frente de múltiplas réplicas da aplicação.
3. Tornar a aplicação stateless: mover sessões e caches para serviços externos (Redis/Memcached). Evitar sticky sessions quando possível; se necessário, usar sticky sessions com cuidado.
4. Usar auto-scaling com métricas de CPU, latência de requisições e taxa de erro para aumentar/diminuir réplicas automaticamente.
5. Banco de dados: usar réplicas de leitura e um master para escrita (ou soluções cloud gerenciadas). Para cargas muito altas, considerar sharding horizontal ou bancos especializados para eventos.
6. Introduzir filas (RabbitMQ, Kafka, SQS) para desacoplar processamento não-critico ou operações demoradas (ex.: notificações, cálculos assíncronos).
7. Monitoramento e observabilidade: Prometheus + Grafana, logs centralizados (ELK/EFK) e tracing (Jaeger/OpenTelemetry).
8. Teste de carga (k6, Gatling) e chaos engineering controlado para validar escalabilidade e resiliência.

Arquitetura sugerida em alto nível:

- Users -> CDN -> Load Balancer -> N réplicas da API (containers) -> DB master + read-replicas
- Redis para sessão/cache; Kafka/RabbitMQ para filas; Prometheus/Grafana para métricas

Benefícios: melhora disponibilidade, reduz latência, possibilita escalonamento elástico e menor custo por operação.

### Passo 2 — Frameworks para desenvolvimento de software (Endpoint seguro e validado)

Requisitos funcionais implementados na API:

- Validação de saldo antes de efetuar a transferência
- Registro da transação
- Geração de um código único para a operação (UUID ou identificador sequencial seguro)

Boas práticas aplicadas / recomendadas:

- Uso de DTOs para entradas (ex.: `TransferenciaRequest`) e validações com anotações (Bean Validation / javax.validation)
- Transação atômica no banco (commit/rollback) para evitar duplicidade
- Idempotência: aceitar um header ou token de idempotência para evitar duplicatas em retries
- Logging estruturado e auditoria de transações
- Testes unitários e de integração cobrindo saldo insuficiente, sucesso e duplicidade

Exemplo de fluxo da API:

1. Cliente envia POST /transferencia com dados.
2. API valida formato e saldo disponível (consulta balance/locked funds).
3. Se ok, marca/reserva saldo, cria registro de transação com status PENDENTE, gera código único (UUID).
4. Efetua a operação de débito/crédito em transação de banco. Em caso de erro, rollback e log de falha.
5. Retorna 200 com código da operação e detalhes.

Observação: ver `TransacaoController.java` para a implementação atual.

### Passo 3 — Programação Web (Extrato responsivo)

Requisitos de implementação:

- Extrato responsivo para smartphones
- Destaque para transações acima de R$ 5.000
- Boa performance de carregamento

Onde está o front-end no projeto:

- `src/main/resources/static/extrato.html`
- `src/main/resources/static/extrato.js`

Melhorias aplicadas / recomendações:

- Layout responsivo com CSS flexbox/grid e media queries para dispositivos móveis.
- Usar classes CSS para destacar transações com valor > 5000 (ex.: background ou borda chamativa).
- Minimizar payload: paginação no endpoint de extrato, carregar inicialmente somente itens visíveis e buscar mais sob demanda (lazy load / infinite scroll).
- Otimizar assets: minificar JS/CSS, configurar cache HTTP e usar CDN para assets estáticos.

Exemplo (conceitual) de destaque no CSS:

```css
.transacao--alto-valor { border-left: 4px solid #e74c3c; background: #fff7f7; }
```

### Passo 4 — Banco de Dados (procedure para saldo e extrato)

Objetivo: criar uma procedure que calcule o saldo de uma conta, liste as 10 últimas transações e permita filtro por período.

Exemplo de procedure (MySQL / MariaDB) — adaptar conforme o SGDB em uso:

```sql
DELIMITER $$
CREATE PROCEDURE calcular_saldo_e_extrato(
  IN p_conta_id VARCHAR(50),
  IN p_data_inicio DATE,
  IN p_data_fim DATE
)
BEGIN
  -- Calcular saldo: soma de créditos menos débitos até a data fim
  SELECT
    (SELECT COALESCE(SUM(CASE WHEN tipo = 'C' THEN valor ELSE -valor END),0)
     FROM transacoes
     WHERE conta = p_conta_id
       AND data_operacao <= p_data_fim) AS saldo_atual;

  -- Listar últimas 10 transações no período (data_inicio..data_fim)
  SELECT id, conta, tipo, valor, data_operacao, descricao
  FROM transacoes
  WHERE conta = p_conta_id
    AND data_operacao BETWEEN p_data_inicio AND p_data_fim
  ORDER BY data_operacao DESC
  LIMIT 10;
END$$
DELIMITER ;
```

Índices recomendados:

- `CREATE INDEX idx_transacoes_conta_data ON transacoes(conta, data_operacao);`
- Índice em colunas frequentemente filtradas/ordenadas para otimizar consultas.

Observação: para saldos com altíssimo volume, considerar modelagem de event sourcing ou manter um snapshot/denormalized balance para leituras rápidas e atualizações incrementais.

### Passo 5 — Desenvolvimento em JavaScript (validações de formulário)

Requisitos:

- Verificar CPF com 11 dígitos
- Validar data de nascimento
- Validar número de telefone

Exemplo de validações em JavaScript (cliente):

```javascript
// validações básicas
function somenteDigitos(s) { return s.replace(/\D/g,''); }

function validarCPF(cpf) {
  const d = somenteDigitos(cpf);
  return d.length === 11; // validação simples de tamanho (pode estender com algoritmo)
}

function validarDataNascimento(dataStr) {
  const d = new Date(dataStr);
  if (isNaN(d)) return false;
  const hoje = new Date();
  return d < hoje; // opcional: checar idade minima
}

function validarTelefone(tel) {
  const d = somenteDigitos(tel);
  return d.length >= 10 && d.length <= 11; // formato nacional básico
}

// Exemplo de uso na submissão do formulário
document.getElementById('formCadastro').addEventListener('submit', function(e){
  const cpf = document.getElementById('cpf').value;
  const nasc = document.getElementById('nascimento').value;
  const tel = document.getElementById('telefone').value;
  const erros = [];
  if (!validarCPF(cpf)) erros.push('CPF deve ter 11 dígitos.');
  if (!validarDataNascimento(nasc)) erros.push('Data de nascimento inválida.');
  if (!validarTelefone(tel)) erros.push('Telefone inválido.');
  if (erros.length) { e.preventDefault(); alert(erros.join('\n')); }
});
```

Observações: as validações no front-end melhoram a experiência do usuário, mas validações idênticas devem existir no back-end para segurança e integridade dos dados.

---

## Boas práticas de entrega e observabilidade

- Implementar idempotência em endpoints críticos com headers/tokens.
- Usar HTTPS, autenticação forte e controle de acesso para operações financeiras.
- Monitorar latência, taxa de erros e throughput; criar alarmes para picos e quedas.
- Manter testes automatizados (unitários e integração) cobrindo cenários críticos.

---

## Próximos passos recomendados

1. Containerizar a aplicação e criar arquivo `Dockerfile`.
2. Criar manifests para Kubernetes (Deployment, Service, HPA, Ingress).
3. Implementar cache com Redis e usar read-replicas no banco.
4. Acrescentar idempotência e tokens anti-replay na API de transferências.
5. Melhorar validação de CPF com algoritmo (digitos verificadores) e testes.

---

## Arquivos criados/editados

- `README.md` — (este arquivo) documentação do projeto e propostas técnicas.

---

Se quiser, eu posso:

- Gerar um `Dockerfile` e um `docker-compose.yml` de exemplo;
- Implementar validação de CPF completa (algoritmo dos dígitos verificadores) no front-end e back-end;
- Criar a procedure SQL adaptada para PostgreSQL;
- Adicionar testes automatizados para o endpoint de transferência.

Diga qual das ações acima prefere que eu implemente primeiro.
