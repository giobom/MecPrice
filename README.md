# 🛠️ MecPrice – Sistema de Orçamentos Automotivos (PWA)

Orçamentos rápidos, profissionais e organizados para oficinas mecânicas e autoelétricas.

👉 **Demo (GitHub Pages):**  
<https://giobom.github.io/MecPrice/>

---

## 📌 Sobre o projeto

O **MecPrice** é um aplicativo web progressivo (**PWA**) desenvolvido para facilitar a criação de **orçamentos automotivos**, com controle de **peças**, **mão de obra** e **estoque**.

O foco do projeto é simplicidade para o mecânico, organização para a oficina e base sólida para evolução futura (Área PRO).

✅ **Vanilla JavaScript (modular)**  
✅ **PWA instalável (PC, Android e iOS)**  
✅ **Funciona offline**  
✅ **Sem dependências de framework**

---

## ✨ Funcionalidades

### 🔧 Orçamento

- Cadastro de cliente e veículo
  - Nome
  - Telefone
  - CPF/CNPJ (opcional, validado)
  - Placa, modelo, ano e KM
- Descrição do serviço
- Valor de mão de obra
- Gestão de peças
  - Nome, quantidade e valor unitário
  - Remoção individual
- Cálculos automáticos
  - Total de peças
  - Total geral (peças + mão de obra)

---

### 📦 Estoque

- Cadastro de peças
  - Nome, SKU, categoria
  - Custo, preço e quantidade
  - Estoque mínimo
- Ajuste rápido de quantidade (+ / -)
- Integração com orçamento (autopreenchimento)
- Backup e restauração em JSON (Local)

---

### 🧠 Validações

- CPF e CNPJ válidos (quando preenchidos)
- Campos críticos protegidos contra erro
- Feedback visual para o usuário

---

### 📄 PDF

- Geração de orçamento em PDF
- Layout profissional
- Pronto para envio ao cliente

---

### 🔐 Área PRO (em evolução)

- Modal de login
- Estrutura preparada para planos
- Base para histórico, relatórios e nuvem

---

## 📲 PWA

- Instalável como aplicativo
- Funciona offline
- Service Worker configurado
- Ícones 192px e 512px
- Manifest pronto

---

## 🧱 Estrutura do projeto

```txt
MecPrice/
├── index.html
├── style.css
├── app.js                # Boot da aplicação
├── manifest.json
├── service-worker.js
├── icon-192.png
├── icon-512.png
└── libs/
    ├── core.js           # Estado global
    ├── dom.js            # Cache de elementos DOM
    ├── storage.js        # LocalStorage
    ├── tabs.js           # Navegação por abas
    ├── estoque.js        # Controle de estoque
    ├── orcamento.js      # Lógica de orçamento
    ├── pdf.js            # Geração de PDF
    ├── validators.js    # Validação CPF/CNPJ
    └── pro-modal.js      # Área PRO

🚀 Instalação como App
💻 Computador (Chrome / Edge)

Acesse a demo

Clique em Instalar

Confirme

📱 Android

Acesse a demo

Toque em Adicionar à tela inicial

Confirme

🍎 iPhone (Safari)

Acesse a demo

Compartilhar → Adicionar à Tela de Início

🧭 Status do projeto

🟢 MVP funcional
🟡 Evolução contínua
🔵 Base preparada para SaaS (PRO)

👨‍💻 Autor

Giovani Araújo
Mecânico automotivo | Eletricista | Estudante de Engenharia de Software

Projeto criado para unir chão de oficina + tecnologia.
