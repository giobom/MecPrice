// Array para armazenar peças em memória
let pecas = [];

// Seletores principais
const clienteInput = document.getElementById("cliente");
const descricaoInput = document.getElementById("descricao");
const maoDeObraInput = document.getElementById("maoDeObra");

const erroPrincipal = document.getElementById("erroPrincipal");
const erroPeca = document.getElementById("erroPeca");
const mensagemAcao = document.getElementById("mensagemAcao");

const tabelaPecas = document.getElementById("tabelaPecas");
const totalPecasSpan = document.getElementById("totalPecas");

const cardOrcamento = document.getElementById("cardOrcamento");
const orcCliente = document.getElementById("orcCliente");
const orcDescricao = document.getElementById("orcDescricao");
const orcData = document.getElementById("orcData");
const orcPecas = document.getElementById("orcPecas");
const orcTotalPecas = document.getElementById("orcTotalPecas");
const orcMaoDeObra = document.getElementById("orcMaoDeObra");
const orcTotalGeral = document.getElementById("orcTotalGeral");

const cardUltimoOrcamento = document.getElementById("cardUltimoOrcamento");
const btnCarregarUltimo = document.getElementById("btnCarregarUltimo");

// Botões
document.getElementById("btnAdicionarPeca").addEventListener("click", adicionarPeca);
document.getElementById("btnGerar").addEventListener("click", gerarOrcamento);
document.getElementById("btnSalvar").addEventListener("click", salvarOrcamento);
document.getElementById("btnLimpar").addEventListener("click", limparTudo);
btnCarregarUltimo.addEventListener("click", carregarUltimoOrcamento);

// ---- Funções de Peças ---- //
function adicionarPeca() {
  erroPeca.textContent = "";
  mensagemAcao.textContent = "";

  const nome = document.getElementById("nomePeca").value.trim();
  const qtd = parseInt(document.getElementById("qtdPeca").value, 10);
  const valor = parseFloat(document.getElementById("valorPeca").value);

  if (!nome || isNaN(qtd) || qtd <= 0 || isNaN(valor) || valor < 0) {
    erroPeca.textContent = "Preencha nome, quantidade e valor unitário corretamente.";
    return;
  }

  pecas.push({ nome, qtd, valor });

  document.getElementById("nomePeca").value = "";
  document.getElementById("qtdPeca").value = "";
  document.getElementById("valorPeca").value = "";

  atualizarTabelaPecas();
}

function removerPeca(index) {
  pecas.splice(index, 1);
  atualizarTabelaPecas();
}

function atualizarTabelaPecas() {
  tabelaPecas.innerHTML = "";

  let totalPecas = 0;

  pecas.forEach((p, index) => {
    const subtotal = p.qtd * p.valor;
    totalPecas += subtotal;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${p.nome}</td>
      <td>${p.qtd}</td>
      <td>R$ ${p.valor.toFixed(2).replace(".", ",")}</td>
      <td>R$ ${subtotal.toFixed(2).replace(".", ",")}</td>
      <td>
        <button class="btn danger" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="removerPeca(${index})">
          Remover
        </button>
      </td>
    `;

    tabelaPecas.appendChild(tr);
  });

  totalPecasSpan.textContent = "R$ " + totalPecas.toFixed(2).replace(".", ",");
}

// ---- Funções de Orçamento ---- //

function validarDadosPrincipais() {
  const cliente = clienteInput.value.trim();
  const descricao = descricaoInput.value.trim();
  const mao = parseFloat(maoDeObraInput.value);

  if (!cliente || !descricao || isNaN(mao) || mao < 0) {
    erroPrincipal.textContent = "Preencha nome do cliente, descrição e valor da mão de obra corretamente.";
    return false;
  }

  erroPrincipal.textContent = "";
  return true;
}

function gerarOrcamento() {
  mensagemAcao.textContent = "";
  if (!validarDadosPrincipais()) return;

  const cliente = clienteInput.value.trim();
  const descricao = descricaoInput.value.trim();
  const mao = parseFloat(maoDeObraInput.value) || 0;

  let totalPecasValor = 0;
  pecas.forEach((p) => {
    totalPecasValor += p.qtd * p.valor;
  });

  const totalGeral = totalPecasValor + mao;

  orcCliente.textContent = cliente;
  orcDescricao.textContent = descricao;
  orcData.textContent = new Date().toLocaleDateString("pt-BR");

  orcPecas.innerHTML = "";
  pecas.forEach((p) => {
    const subtotal = p.qtd * p.valor;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.qtd}</td>
      <td>R$ ${p.valor.toFixed(2).replace(".", ",")}</td>
      <td>R$ ${subtotal.toFixed(2).replace(".", ",")}</td>
    `;
    orcPecas.appendChild(tr);
  });

  orcTotalPecas.textContent = "R$ " + totalPecasValor.toFixed(2).replace(".", ",");
  orcMaoDeObra.textContent = "R$ " + mao.toFixed(2).replace(".", ",");
  orcTotalGeral.textContent = "R$ " + totalGeral.toFixed(2).replace(".", ",");

  cardOrcamento.hidden = false;
  mensagemAcao.textContent = "Orçamento gerado com sucesso!";
}

function salvarOrcamento() {
  if (!validarDadosPrincipais()) return;

  if (pecas.length === 0) {
    erroPeca.textContent = "Adicione pelo menos uma peça antes de salvar o orçamento.";
    return;
  }

  const mao = parseFloat(maoDeObraInput.value) || 0;
  let totalPecasValor = 0;
  pecas.forEach((p) => {
    totalPecasValor += p.qtd * p.valor;
  });

  const totalGeral = totalPecasValor + mao;

  const orcamento = {
    cliente: clienteInput.value.trim(),
    descricao: descricaoInput.value.trim(),
    maoDeObra: mao,
    pecas: pecas,
    totalPecas: totalPecasValor,
    totalGeral: totalGeral,
    data: new Date().toISOString(),
  };

  localStorage.setItem("ultimoOrcamentoOficina", JSON.stringify(orcamento));
  mensagemAcao.textContent = "Orçamento salvo com sucesso no navegador (localStorage).";
  erroPeca.textContent = "";
}

function limparTudo() {
  clienteInput.value = "";
  descricaoInput.value = "";
  maoDeObraInput.value = "";
  pecas = [];
  atualizarTabelaPecas();
  cardOrcamento.hidden = true;
  mensagemAcao.textContent = "Formulário limpo.";
  erroPeca.textContent = "";
  erroPrincipal.textContent = "";
}

// ---- Carregar último orçamento salvo ---- //
function verificarUltimoOrcamento() {
  const salvo = localStorage.getItem("ultimoOrcamentoOficina");
  if (salvo) {
    cardUltimoOrcamento.hidden = false;
  }
}

function carregarUltimoOrcamento() {
  const salvo = localStorage.getItem("ultimoOrcamentoOficina");
  if (!salvo) return;

  const orcamento = JSON.parse(salvo);

  clienteInput.value = orcamento.cliente || "";
  descricaoInput.value = orcamento.descricao || "";
  maoDeObraInput.value = orcamento.maoDeObra || 0;

  pecas = orcamento.pecas || [];
  atualizarTabelaPecas();

  mensagemAcao.textContent = "Último orçamento carregado. Você pode editar e gerar novamente.";
  cardUltimoOrcamento.hidden = true;
}

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  verificarUltimoOrcamento();
});

// Registro do Service Worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((err) => {
        console.log("Erro ao registrar service worker:", err);
      });
  });
}
function formatBRL(valor) {
  const n = Number(valor || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function gerarPDFOrcamento() {
  // Garante que jsPDF carregou
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("Biblioteca de PDF não carregou. Verifique sua internet ou o cache do PWA.");
    return;
  }

  // Pega dados já exibidos no card do orçamento
  const cliente = document.getElementById("orcCliente")?.textContent?.trim() || "";
  const servico = document.getElementById("orcDescricao")?.textContent?.trim() || "";
  const data = document.getElementById("orcData")?.textContent?.trim() || new Date().toLocaleDateString("pt-BR");

  // Linhas da tabela
  const linhas = [];
  (pecas || []).forEach((p) => {
    const nome = (p.nome || "").toString();
    const qtd = Number(p.qtd || 0);
    const unit = Number(p.valor || 0);
    const total = qtd * unit;
    linhas.push([nome, String(qtd), formatBRL(unit), formatBRL(total)]);
  });

  const totalPecas = (pecas || []).reduce((acc, p) => acc + (Number(p.qtd || 0) * Number(p.valor || 0)), 0);
  const mao = Number(maoDeObraInput?.value || 0);
  const totalGeral = totalPecas + mao;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MecPrice", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Orçamento automotivo", 14, 25);

  // Dados principais
  doc.setFontSize(12);
  doc.text(`Cliente: ${cliente}`, 14, 35);
  doc.text(`Serviço: ${servico}`, 14, 42);
  doc.text(`Data: ${data}`, 14, 49);

  // Tabela de peças
  doc.setFont("helvetica", "bold");
  doc.text("Peças", 14, 60);

  doc.autoTable({
    startY: 64,
    head: [["Peça", "Qtd", "Unitário", "Total"]],
    body: linhas.length ? linhas : [["(nenhuma peça adicionada)", "-", "-", "-"]],
    styles: { font: "helvetica", fontSize: 10 },
    headStyles: { fillColor: [25, 35, 60] },
    margin: { left: 14, right: 14 },
  });

  // Totais (abaixo da tabela)
  const y = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Total de peças: ${formatBRL(totalPecas)}`, 14, y);
  doc.text(`Mão de obra: ${formatBRL(mao)}`, 14, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text(`Total geral: ${formatBRL(totalGeral)}`, 14, y + 16);

  // Assinaturas
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("____________________________________", 14, y + 35);
  doc.text("Assinatura / Responsável", 14, y + 40);

  // Nome do arquivo
  const safeCliente = (cliente || "cliente").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  const fileName = `MecPrice_Orcamento_${safeCliente}_${new Date().toISOString().slice(0,10)}.pdf`;

  doc.save(fileName);
}

// Clique no botão
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnPDF");
  if (btn) btn.addEventListener("click", gerarPDFOrcamento);
});
