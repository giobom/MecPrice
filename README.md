# 🛠️ MecPrice – Sistema de Orçamentos Automotivos (PWA)

Orçamentos rápidos, profissionais e organizados para oficinas mecânicas e autoelétricas.

👉 **Demo oficial:** https://mecprice.com  
👉 **Repositório:** https://github.com/giobom/MecPrice

---

## 📌 Visão Geral

O **MecPrice** é um aplicativo web **PWA (Progressive Web App)** desenvolvido para facilitar a criação de orçamentos automotivos, com controle de peças, mão de obra e geração de PDF.

O sistema foi pensado para:
- Oficinas mecânicas
- Autoelétricas
- Profissionais autônomos
- Pequenas empresas que precisam de agilidade e organização

✅ Interface simples e responsiva  
✅ Funciona offline  
✅ Instalável como aplicativo  
✅ Código limpo e modular (JavaScript Vanilla)

---

## 🚀 Funcionalidades

### 🔧 Orçamento
- Cadastro de dados do cliente e serviço
- Inclusão de peças
  - Nome
  - Quantidade
  - Valor unitário
- Cálculo automático:
  - Total de peças
  - Mão de obra
  - Total geral
- Remoção de peças individualmente
- Geração de orçamento em tela

### 📦 Estoque
- Cadastro de peças
- Controle de quantidade
- Estoque mínimo (alerta visual)
- Integração com orçamento
  - Baixa automática ao adicionar peça
  - Devolução ao remover peça
- Backup e restauração em JSON

### 📄 PDF
- Geração de orçamento em PDF
- Layout profissional
- Nome do cliente no arquivo
- Preparado para versão **PRO** (logo, dados da oficina)

### 🔐 Área PRO (em desenvolvimento)
- Modal de login
- Estrutura pronta para:
  - Autenticação
  - Backup em nuvem
  - Histórico de orçamentos
  - Relatórios
- Separação clara entre plano **FREE** e **PRO**

### 📲 PWA
- Instalável no:
  - Windows
  - Android
  - iOS
- Funciona offline
- Service Worker configurado
- Ícones 192px e 512px
- Manifest configurado

---

## 🧩 Arquitetura do Projeto

O projeto utiliza **JavaScript modular**, sem frameworks, ideal para GitHub Pages.

```txt
MecPrice/
 ├── index.html
 ├── style.css
 ├── app.js                # Boot da aplicação
 ├── manifest.json
 ├── service-worker.js
 ├── icon-192.png
 ├── icon-512.png
 ├── libs/
 │   ├── core.js            # Contexto global, helpers
 │   ├── dom.js             # Seletores de DOM
 │   ├── storage.js         # LocalStorage
 │   ├── tabs.js            # Navegação por abas
 │   ├── estoque.js         # Controle de estoque
 │   ├── orcamento.js       # Lógica de orçamento
 │   ├── pdf.js             # Geração de PDF
 │   ├── pro-modal.js       # Área PRO
 │   ├── jspdf.umd.min.js
 │   └── jspdf.plugin.autotable.min.js
 └── README.md
