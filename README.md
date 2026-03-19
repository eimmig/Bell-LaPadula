# Sistema de Controle de Acesso com Hono (Bell-LaPadula)

API simples em `Hono + TypeScript` com:

- Autenticacao por usuario/senha e token JWT
- Politicas de acesso Bell-LaPadula
- Logs de auditoria em arquivo (`logs/audit.log`)

## Requisitos

- Node.js 20+

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Defina variaveis de ambiente (opcional em dev):

```bash
copy .env.example .env
```

3. Rode em modo desenvolvimento:

```bash
npm run dev
```

Servidor padrao: `http://localhost:3000`

## Usuarios de exemplo

- `alice / alice123` (`TOP_SECRET`, categorias: `NUCLEAR`, `NATO`, `FINANCE`)
- `bob / bob123` (`SECRET`, categoria: `NATO`)
- `carol / carol123` (`CONFIDENTIAL`, categoria: `FINANCE`)

## Regras Bell-LaPadula aplicadas

- Leitura: `no read up`
- Escrita: `no write down`
- Categorias por compartimentos (lattice):
  - Leitura exige que categorias do usuario cubram as do documento
  - Escrita exige que categorias do documento cubram as do usuario

## Endpoints

- `POST /auth/login`
- `GET /documents`
- `GET /documents/:id`
- `POST /documents`
- `GET /audit/logs` (somente `TOP_SECRET`)

## Exemplos de uso

### 1) Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","password":"bob123"}'
```

### 2) Listar documentos permitidos

```bash
curl http://localhost:3000/documents \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3) Ler um documento

```bash
curl http://localhost:3000/documents/d2 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 4) Criar documento (sujeito a Bell-LaPadula)

```bash
curl -X POST http://localhost:3000/documents \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"d9",
    "title":"Novo documento",
    "content":"conteudo",
    "classification":"SECRET",
    "categories":["NATO"]
  }'
```

## Auditoria

Cada tentativa de autenticacao e acesso gera um evento JSON em `logs/audit.log`.

Formato base:

```json
{
  "timestamp": "2026-03-18T20:10:00.000Z",
  "actor": "bob",
  "action": "READ_DOCUMENT",
  "target": "d2",
  "outcome": "ALLOW",
  "reason": "..."
}
```
