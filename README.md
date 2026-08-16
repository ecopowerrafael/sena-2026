# CRM Imobiliário SENA 2026 (Projeto Standalone Isolado)

Sistema de Gestão Imobiliária Completo: Vendas, Locações, Loteamentos, Comissões e Corretores.

---

## 🚀 Como Executar Localmente

### 1. Requisitos

- **Node.js**: Versão 18 ou superior instalado ([nodejs.org](https://nodejs.org))
- **NPM** ou **Yarn** ou **PNPM**

### 2. Instalar Dependências

Abra o terminal dentro da pasta descompactada e execute:

```bash
npm install
```

### 3. Rodar em Modo de Desenvolvimento

```bash
npm run dev
```

O sistema estará rodando em: `http://localhost:3000`

---

## 🌐 Como Publicar em Qualquer Domínio / Hospedagem

### Opção 1: Vercel (Recomendado - Grátis e Fácil)

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Suba essa pasta no seu GitHub ou importe diretamente na Vercel.
3. O comando de build automático é `npm run build` e a pasta de saída é `dist`.
4. Conecte o seu domínio personalizado (ex: `crm.seudominio.com.br`) nas configurações de domínio da Vercel.

### Opção 2: Netlify

1. Acesse [netlify.com](https://netlify.com).
2. Arraste a pasta gerada após rodar `npm run build` (pasta `dist`) ou conecte ao repositório Git.
3. Aponte seu domínio.

### Opção 3: Servidor Próprio / VPS / Apache / Nginx / Hostinger / cPanel

1. Execute no terminal do seu computador:

```bash
npm run build
```

2. Será gerada a pasta `dist` com todos os arquivos estáticos compilados (HTML, CSS, JS otimizados).
3. Envie o conteúdo de dentro da pasta `dist` para a raiz do seu servidor web (ex: `public_html` ou `/var/www/html`).
4. Se usar Nginx ou Apache com roteamento SPA, configure fallback para `index.html`.

---

## 📦 Estrutura de Arquivos

- `src/types/senaCrm.ts`: Tipagens TypeScript completas de Leads, Imóveis, Lotes, Comissões, etc.
- `src/data/senaCrmData.ts`: Base inicial de dados e cadastros.
- `src/components/senaCrm/`: Todos os 15 módulos do CRM Imobiliário SENA.
