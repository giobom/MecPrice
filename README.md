# 🛠️ MecPrice – Sistema de Orçamentos Automotivos (PWA)

Orçamentos rápidos, precisos e profissionais para oficinas mecânicas e autoelétricas.

👉 **Demo (GitHub Pages):** <https://giobom.github.io/MecPrice/>

---

## 📌 Descrição

O **MecPrice** é um aplicativo web (**PWA**) criado para facilitar e profissionalizar a elaboração de orçamentos automotivos.  
Com uma interface simples, responsiva e intuitiva, permite registrar **peças**, **mão de obra** e gerar **totais automaticamente**.

✅ Desenvolvido com **HTML + CSS + JavaScript (Vanilla)**  
✅ Roda em qualquer navegador moderno  
✅ Pode ser instalado como app no **Windows, Android e iOS**

---

## ✅ Funcionalidades

### Orçamento

- Cadastro de cliente e serviço
  - Nome do cliente
  - Descrição do serviço
  - Valor da mão de obra
- Gestão de peças do orçamento
  - Adicionar peças (nome, quantidade, valor unitário)
  - Remover peças individualmente
- Cálculos automáticos
  - Total de peças
  - Total geral (peças + mão de obra)
  - Valores em moeda (R$)

### Armazenamento

- Salva o último orçamento com **LocalStorage**
- Recupera automaticamente ao reabrir

### PWA

- Instalável (PC / Android / iPhone)
- Funciona offline (Service Worker)
- Ícones 192px e 512px
- Manifest configurado

---

## 🚀 Instalação (como app)

### ✔️ No computador (Chrome/Edge)

1. Acesse a demo
2. Clique no ícone de **instalar** na barra de endereço
3. Confirme em **Instalar**

### ✔️ No iPhone (Safari)

1. Acesse a demo no Safari
2. Toque em **Compartilhar**
3. Toque em **Adicionar à Tela de Início**

### ✔️ No Android (Chrome)

1. Acesse a demo
2. Toque em **Adicionar à tela inicial**
3. Confirme

---

## 🧩 Estrutura do projeto

```txt
MecPrice/
 ├── index.html
 ├── style.css
 ├── script.js
 ├── manifest.json
 ├── service-worker.js
 ├── icon-192.png
 └── icon-512.png
