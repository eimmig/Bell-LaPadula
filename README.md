# Sistema de Controle de Spoilers com Hono (Bell-LaPadula)

API simples em `Hono + TypeScript` com tema de plataforma de streaming:

- Autenticacao por usuario/senha e token JWT
- Politicas de acesso Bell-LaPadula aplicadas a vazamentos de spoilers
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

- `Eduardo1 / Eduardo1` (`ULTIMATE_FINALE`, categorias: `SPACE_OPERA`, `MYSTERY_TOWN`, `COOKING_ARENA`)
- `Eduardo2 / Eduardo2` (`SPOILER`, categoria: `SPACE_OPERA`)
- `Eduardo3 / Eduardo3` (`BACKSTAGE`, categoria: `COOKING_ARENA`)

## Regras Bell-LaPadula aplicadas

- Leitura: `no read up`
- Escrita: `no write down`
- Categorias por compartimentos (lattice):
  - Leitura exige que categorias do usuario cubram as do documento
  - Escrita exige que categorias do documento cubram as do usuario

## Endpoints

- `POST /auth/login`
- `GET /leaks`
- `GET /leaks/:id`
- `POST /leaks`
- `GET /audit/logs` (somente `ULTIMATE_FINALE`)

## Exemplos de uso

### 1) Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Eduardo2","password":"Eduardo2"}'
```

### 2) Listar documentos permitidos

```bash
curl http://localhost:3000/leaks \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3) Ler um documento

```bash
curl http://localhost:3000/leaks/l2 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 4) Criar vazamento (sujeito a Bell-LaPadula)

```bash
curl -X POST http://localhost:3000/leaks \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"l9",
    "title":"Spoiler episodio final",
    "content":"revelacao do ultimo episodio",
    "spoilerLevel":"SPOILER",
    "categories":["SPACE_OPERA"]
  }'
```

## Auditoria

Cada tentativa de autenticacao e acesso gera um evento JSON em `logs/audit.log`.

Formato base:

```json
{
  "timestamp": "2026-03-18T20:10:00.000Z",
  "actor": "Eduardo2",
  "action": "READ_LEAK",
  "target": "l2",
  "outcome": "ALLOW",
  "reason": "..."
}
```
