/* ==============================
   Helpers
============================== */
function formatBRL(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uid() {
  return crypto?.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

function normalize(s) {
  return (s || "").toString().trim().toLowerCase();
}

/* ==============================
   Estado (Orçamento)
============================== */
let pecas = [];

/* ==============================
   Seletores principais (Orçamento)
============================== */
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

/* Botões (Orçamento) */
const btnAdicionarPeca = document.getElementById("btnAdicionarPeca");
const btnGerar = document.getElementById("btnGerar");
const btnSalvar = document.getElementById("btnSalvar");
const btnLimpar = document.getElementById("btnLimpar");
const btnPDF = document.getElementById("btnPDF");

/* Campos de peça (Orçamento) */
const nomePecaInput = document.getElementById("nomePeca");
const qtdPecaInput = document.getElementById("qtdPeca");
const valorPecaInput = document.getElementById("valorPeca");

/* ==============================
   Estoque (localStorage)
============================== */
const ESTOQUE_KEY = "mecprice_estoque";
let estoque = [];

/* Seletores (Estoque) - só se existirem no HTML */
const estNome = document.getElementById("estNome");
const estSku = document.getElementById("estSku");
const estCat = document.getElementById("estCat");
const estCusto = document.getElementById("estCusto");
const estPreco = document.getElementById("estPreco");
const estQtd = document.getElementById("estQtd");
const estMin = document.getElementById("estMin");

const btnAddItem = document.getElementById("btnAddItem");
const btnExportEstoque = document.getElementById("btnExportEstoque");
const importEstoque = document.getElementById("importEstoque");

const tbodyEstoque = document.getElementById("tbodyEstoque");
const msgEstoque = document.getElementById("msgEstoque");

const dlSugestoes = document.getElementById("estoqueSugestoes");

/* ==============================
   Persistência (Orçamento)
============================== */
const ORCAMENTO_KEY = "ultimoOrcamentoOficina";

/* ==============================
   Funções - Estoque
============================== */
function carregarEstoque() {
  try {
    estoque = JSON.parse(localStorage.getItem(ESTOQUE_KEY) || "[]");
    if (!Array.isArray(estoque)) estoque = [];
  } catch {
    estoque = [];
  }
}

function salvarEstoque() {
  localStorage.setItem(ESTOQUE_KEY, JSON.stringify(estoque));
}

function renderEstoque() {
  if (!tbodyEstoque) return;

  tbodyEstoque.innerHTML = "";

  const ordenado = estoque
    .slice()
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  ordenado.forEach((it) => {
    const tr = document.createElement("tr");

    const qtd = toNumber(it.qtd, 0);
    const minimo = toNumber(it.minimo, 0);
    const baixo = qtd <= minimo;

    tr.innerHTML = `
      <td>${it.nome || ""}</td>
      <td>${it.sku || ""}</td>
      <td>${it.categoria || ""}</td>
      <td>${qtd}</td>
      <td>${formatBRL(it.preco)}</td>
      <td>${minimo}</td>
      <td>
        <button class="btn secondary" data-edit="${it.id}">Editar</button>
        <button class="btn" data-in="${it.id}">+ Entrada</button>
        <button class="btn" data-out="${it.id}">- Saída</button>
        <button class="btn danger" data-del="${it.id}">Remover</button>
      </td>
    `;

    if (baixo) tr.style.outline = "1px solid rgba(250,204,21,0.5)";

    tbodyEstoque.appendChild(tr);
  });

  if (msgEstoque) {
    const qtdBaixa = estoque.filter(
      (i) => toNumber(i.qtd, 0) <= toNumber(i.minimo, 0)
    ).length;
    msgEstoque.textContent = qtdBaixa
      ? `⚠️ ${qtdBaixa} item(ns) com estoque baixo.`
      : "Estoque OK ✅";
  }
}

function limparFormEstoque() {
  if (!estNome) return;
  estNome.value = "";
  if (estSku) estSku.value = "";
  if (estCat) estCat.value = "";
  if (estCusto) estCusto.value = "";
  if (estPreco) estPreco.value = "";
  if (estQtd) estQtd.value = "";
  if (estMin) estMin.value = "";
}

function preencherFormularioEstoque(id) {
  const it = estoque.find((x) => x.id === id);
  if (!it || !estNome) return;

  estNome.value = it.nome || "";
  if (estSku) estSku.value = it.sku || "";
  if (estCat) estCat.value = it.categoria || "";
  if (estCusto) estCusto.value = toNumber(it.custo, 0);
  if (estPreco) estPreco.value = toNumber(it.preco, 0);
  if (estQtd) estQtd.value = toNumber(it.qtd, 0);
  if (estMin) estMin.value = toNumber(it.minimo, 0);
}

function upsertEstoque() {
  if (!estNome) return;

  const nome = estNome.value.trim();
  const sku = estSku ? estSku.value.trim() : "";
  if (!nome) {
    alert("Informe o nome da peça.");
    return;
  }

  const item = {
    id: uid(),
    nome,
    sku,
    categoria: estCat ? estCat.value.trim() : "",
    custo: toNumber(estCusto ? estCusto.value : 0, 0),
    preco: toNumber(estPreco ? estPreco.value : 0, 0),
    qtd: toNumber(estQtd ? estQtd.value : 0, 0),
    minimo: toNumber(estMin ? estMin.value : 0, 0),
  };

  // Atualiza se bater SKU (preferência) ou nome+categoria
  const idx = estoque.findIndex((i) => {
    if (sku && i.sku) return normalize(i.sku) === normalize(sku);
    return normalize(i.nome) === normalize(nome) && normalize(i.categoria) === normalize(item.categoria);
  });

  if (idx >= 0) {
    item.id = estoque[idx].id; // mantém id
    estoque[idx] = { ...estoque[idx], ...item };
  } else {
    estoque.push(item);
  }

  salvarEstoque();
  renderEstoque();
  atualizarSugestoesEstoque();
  limparFormEstoque();
}

function ajustarQtdEstoque(id, delta) {
  const it = estoque.find((x) => x.id === id);
  if (!it) return;
  it.qtd = Math.max(0, toNumber(it.qtd, 0) + toNumber(delta, 0));
  salvarEstoque();
  renderEstoque();
  atualizarSugestoesEstoque();
}

function removerItemEstoque(id) {
  estoque = estoque.filter((x) => x.id !== id);
  salvarEstoque();
  renderEstoque();
  atualizarSugestoesEstoque();
}

function exportarEstoqueJSON() {
  const blob = new Blob([JSON.stringify(estoque, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mecprice_estoque.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarEstoqueJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error();

      estoque = data.map((i) => ({
        id: i.id || uid(),
        nome: i.nome || "",
        sku: i.sku || "",
        categoria: i.categoria || "",
        custo: toNumber(i.custo, 0),
        preco: toNumber(i.preco, 0),
        qtd: toNumber(i.qtd, 0),
        minimo: toNumber(i.minimo, 0),
      }));

      salvarEstoque();
      renderEstoque();
      atualizarSugestoesEstoque();
      alert("Estoque importado com sucesso!");
    } catch {
      alert("JSON inválido para estoque.");
    }
  };
  reader.readAsText(file);
}

/* ==============================
   Integração Estoque ⇄ Orçamento
============================== */
function atualizarSugestoesEstoque() {
  if (!dlSugestoes) return;
  dlSugestoes.innerHTML = "";

  estoque
    .slice()
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
    .forEach((it) => {
      const opt = document.createElement("option");
      opt.value = it.sku ? `${it.nome} (${it.sku})` : it.nome;
      dlSugestoes.appendChild(opt);
    });
}

function acharItemEstoquePorEntrada(texto) {
  const t = normalize(texto);
  if (!t) return null;

  // SKU exato
  let it = estoque.find((i) => normalize(i.sku) === t);
  if (it) return it;

  // Nome exato
  it = estoque.find((i) => normalize(i.nome) === t);
  if (it) return it;

  // Nome (SKU)
  it = estoque.find((i) => normalize(`${i.nome} (${i.sku || ""})`) === t);
  if (it) return it;

  return null;
}

function tentarAutoPreencherPreco() {
  if (!nomePecaInput || !valorPecaInput) return;

  const it = acharItemEstoquePorEntrada(nomePecaInput.value);
  if (!it) return;

  // Se o usuário ainda não digitou o valor, sugere o preço do estoque
  if (!valorPecaInput.value) valorPecaInput.value = toNumber(it.preco, 0).toFixed(2);

  // Se qtd vazio, sugere 1
  if (qtdPecaInput && !qtdPecaInput.value) qtdPecaInput.value = 1;
}

function baixarEstoque(nomeDigitado, qtdUsada) {
  const it = acharItemEstoquePorEntrada(nomeDigitado);
  if (!it) return null;

  const qtd = toNumber(qtdUsada, 0);
  if (qtd <= 0) return null;

  if (toNumber(it.qtd, 0) < qtd) {
    erroPeca.textContent = `Estoque insuficiente. Disponível: ${toNumber(it.qtd, 0)}`;
    return null;
  }

  it.qtd = Math.max(0, toNumber(it.qtd, 0) - qtd);
  salvarEstoque();
  renderEstoque();
  atualizarSugestoesEstoque();
  return it.id;
}

function devolverEstoque(estoqueId, qtdDevolvida) {
  if (!estoqueId) return;
  const it = estoque.find((x) => x.id === estoqueId);
  if (!it) return;

  const qtd = toNumber(qtdDevolvida, 0);
  if (qtd <= 0) return;

  it.qtd = toNumber(it.qtd, 0) + qtd;
  salvarEstoque();
  renderEstoque();
  atualizarSugestoesEstoque();
}

/* ==============================
   Funções - Orçamento (Peças)
============================== */
function adicionarPeca() {
  erroPeca.textContent = "";
  mensagemAcao.textContent = "";

  const nome = (nomePecaInput?.value || "").trim();
  const qtd = parseInt(qtdPecaInput?.value || "", 10);
  const valor = parseFloat(valorPecaInput?.value || "");

  if (!nome || Number.isNaN(qtd) || qtd <= 0 || Number.isNaN(valor) || valor < 0) {
    erroPeca.textContent = "Preencha nome, quantidade e valor unitário corretamente.";
    return;
  }

  // Baixa do estoque (se existir no estoque)
  const estoqueId = baixarEstoque(nome, qtd);

  // Se era item de estoque e não baixou (por falta), aborta
  const tentado = acharItemEstoquePorEntrada(nome);
  if (tentado && !estoqueId) return;

  pecas.push({ nome, qtd, valor, estoqueId });

  if (nomePecaInput) nomePecaInput.value = "";
  if (qtdPecaInput) qtdPecaInput.value = "";
  if (valorPecaInput) valorPecaInput.value = "";

  atualizarTabelaPecas();
}

function removerPeca(index) {
  const p = pecas[index];
  if (p?.estoqueId) devolverEstoque(p.estoqueId, p.qtd);

  pecas.splice(index, 1);
  atualizarTabelaPecas();
}

function atualizarTabelaPecas() {
  if (!tabelaPecas || !totalPecasSpan) return;

  tabelaPecas.innerHTML = "";
  let totalPecas = 0;

  pecas.forEach((p, index) => {
    const subtotal = toNumber(p.qtd, 0) * toNumber(p.valor, 0);
    totalPecas += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${p.nome}</td>
      <td>${p.qtd}</td>
      <td>${formatBRL(p.valor)}</td>
      <td>${formatBRL(subtotal)}</td>
      <td>
        <button class="btn danger" style="padding:0.25rem 0.6rem; font-size:0.75rem;" data-rm="${index}">
          Remover
        </button>
      </td>
    `;
    tabelaPecas.appendChild(tr);
  });

  totalPecasSpan.textContent = formatBRL(totalPecas);
}

/* Event delegation para remover (evita onclick inline) */
function setupRemoverPecaDelegation() {
  if (!tabelaPecas) return;
  tabelaPecas.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-rm]");
    if (!btn) return;
    const idx = parseInt(btn.getAttribute("data-rm"), 10);
    if (!Number.isNaN(idx)) removerPeca(idx);
  });
}

/* ==============================
   Orçamento (Gerar/Salvar/Carregar)
============================== */
function validarDadosPrincipais() {
  const cliente = (clienteInput?.value || "").trim();
  const descricao = (descricaoInput?.value || "").trim();
  const mao = toNumber(maoDeObraInput?.value, NaN);

  if (!cliente || !descricao || Number.isNaN(mao) || mao < 0) {
    if (erroPrincipal) {
      erroPrincipal.textContent =
        "Preencha nome do cliente, descrição e valor da mão de obra corretamente.";
    }
    return false;
  }

  if (erroPrincipal) erroPrincipal.textContent = "";
  return true;
}

function calcularTotais() {
  const totalPecas = pecas.reduce(
    (acc, p) => acc + toNumber(p.qtd, 0) * toNumber(p.valor, 0),
    0
  );
  const mao = toNumber(maoDeObraInput?.value, 0);
  return {
    totalPecas,
    maoDeObra: mao,
    totalGeral: totalPecas + mao,
  };
}

function gerarOrcamento() {
  if (mensagemAcao) mensagemAcao.textContent = "";
  if (!validarDadosPrincipais()) return;

  const cliente = (clienteInput?.value || "").trim();
  const descricao = (descricaoInput?.value || "").trim();
  const data = new Date().toLocaleDateString("pt-BR");
  const { totalPecas, maoDeObra, totalGeral } = calcularTotais();

  if (orcCliente) orcCliente.textContent = cliente;
  if (orcDescricao) orcDescricao.textContent = descricao;
  if (orcData) orcData.textContent = data;

  if (orcPecas) {
    orcPecas.innerHTML = "";
    pecas.forEach((p) => {
      const subtotal = toNumber(p.qtd, 0) * toNumber(p.valor, 0);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.qtd}</td>
        <td>${formatBRL(p.valor)}</td>
        <td>${formatBRL(subtotal)}</td>
      `;
      orcPecas.appendChild(tr);
    });
  }

  if (orcTotalPecas) orcTotalPecas.textContent = formatBRL(totalPecas);
  if (orcMaoDeObra) orcMaoDeObra.textContent = formatBRL(maoDeObra);
  if (orcTotalGeral) orcTotalGeral.textContent = formatBRL(totalGeral);

  if (cardOrcamento) cardOrcamento.hidden = false;
  if (mensagemAcao) mensagemAcao.textContent = "Orçamento gerado com sucesso!";
}

function salvarOrcamento() {
  if (!validarDadosPrincipais()) return;

  if (pecas.length === 0) {
    if (erroPeca) erroPeca.textContent = "Adicione pelo menos uma peça antes de salvar.";
    return;
  }

  const cliente = (clienteInput?.value || "").trim();
  const descricao = (descricaoInput?.value || "").trim();
  const { totalPecas, maoDeObra, totalGeral } = calcularTotais();

  const payload = {
    cliente,
    descricao,
    maoDeObra,
    pecas,
    totalPecas,
    totalGeral,
    data: new Date().toISOString(),
  };

  localStorage.setItem(ORCAMENTO_KEY, JSON.stringify(payload));
  if (mensagemAcao) mensagemAcao.textContent = "Orçamento salvo com sucesso (localStorage).";
  if (erroPeca) erroPeca.textContent = "";
}

function limparTudo() {
  if (clienteInput) clienteInput.value = "";
  if (descricaoInput) descricaoInput.value = "";
  if (maoDeObraInput) maoDeObraInput.value = "";

  // Não mexe no estoque aqui
  pecas = [];
  atualizarTabelaPecas();

  if (cardOrcamento) cardOrcamento.hidden = true;
  if (mensagemAcao) mensagemAcao.textContent = "Formulário limpo.";
  if (erroPeca) erroPeca.textContent = "";
  if (erroPrincipal) erroPrincipal.textContent = "";
}

function verificarUltimoOrcamento() {
  const salvo = localStorage.getItem(ORCAMENTO_KEY);
  if (cardUltimoOrcamento) cardUltimoOrcamento.hidden = !salvo;
}

function carregarUltimoOrcamento() {
  const salvo = localStorage.getItem(ORCAMENTO_KEY);
  if (!salvo) return;

  const orc = JSON.parse(salvo);

  if (clienteInput) clienteInput.value = orc.cliente || "";
  if (descricaoInput) descricaoInput.value = orc.descricao || "";
  if (maoDeObraInput) maoDeObraInput.value = toNumber(orc.maoDeObra, 0);

  pecas = Array.isArray(orc.pecas) ? orc.pecas : [];
  atualizarTabelaPecas();

  if (mensagemAcao) mensagemAcao.textContent = "Último orçamento carregado. Você pode editar e gerar novamente.";
  if (cardUltimoOrcamento) cardUltimoOrcamento.hidden = true;
}

/* ==============================
   PDF (jsPDF + AutoTable)
============================== */
function gerarPDFOrcamento() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("Biblioteca de PDF não carregou. Verifique se adicionou jsPDF no index.html.");
    return;
  }

  const cliente = (orcCliente?.textContent || "").trim() || (clienteInput?.value || "").trim();
  const servico = (orcDescricao?.textContent || "").trim() || (descricaoInput?.value || "").trim();
  const data = (orcData?.textContent || "").trim() || new Date().toLocaleDateString("pt-BR");

  const linhas = (pecas || []).map((p) => {
    const qtd = toNumber(p.qtd, 0);
    const unit = toNumber(p.valor, 0);
    const tot = qtd * unit;
    return [p.nome || "", String(qtd), formatBRL(unit), formatBRL(tot)];
  });

  const { totalPecas, maoDeObra, totalGeral } = calcularTotais();

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

  // Tabela
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

  // Totais
  const y = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Total de peças: ${formatBRL(totalPecas)}`, 14, y);
  doc.text(`Mão de obra: ${formatBRL(maoDeObra)}`, 14, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text(`Total geral: ${formatBRL(totalGeral)}`, 14, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("____________________________________", 14, y + 35);
  doc.text("Assinatura / Responsável", 14, y + 40);

  const safeCliente = (cliente || "cliente")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  doc.save(`MecPrice_Orcamento_${safeCliente}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ==============================
   Service Worker (PWA)
============================== */
function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.log("Erro ao registrar service worker:", err);
    });
  });
}

/* ==============================
   Init (apenas 1 DOMContentLoaded)
============================== */
document.addEventListener("DOMContentLoaded", () => {
  // Orçamento - listeners
  btnAdicionarPeca?.addEventListener("click", adicionarPeca);
  btnGerar?.addEventListener("click", gerarOrcamento);
  btnSalvar?.addEventListener("click", salvarOrcamento);
  btnLimpar?.addEventListener("click", limparTudo);
  btnCarregarUltimo?.addEventListener("click", carregarUltimoOrcamento);
  btnPDF?.addEventListener("click", gerarPDFOrcamento);

  setupRemoverPecaDelegation();
  verificarUltimoOrcamento();
  atualizarTabelaPecas();

  // Estoque - carregar e render (se a seção existir)
  carregarEstoque();
  renderEstoque();
  atualizarSugestoesEstoque();

  // Integração: autopreencher preço pelo estoque
  nomePecaInput?.addEventListener("input", tentarAutoPreencherPreco);
  nomePecaInput?.addEventListener("change", tentarAutoPreencherPreco);

  // Estoque - listeners (se existirem)
  btnAddItem?.addEventListener("click", upsertEstoque);
  btnExportEstoque?.addEventListener("click", exportarEstoqueJSON);
  importEstoque?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importarEstoqueJSON(file);
  });

  // Estoque - ações por tabela
  tbodyEstoque?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const idEdit = btn.getAttribute("data-edit");
    const idIn = btn.getAttribute("data-in");
    const idOut = btn.getAttribute("data-out");
    const idDel = btn.getAttribute("data-del");

    if (idEdit) return preencherFormularioEstoque(idEdit);
    if (idIn) return ajustarQtdEstoque(idIn, +1);
    if (idOut) return ajustarQtdEstoque(idOut, -1);
    if (idDel) return removerItemEstoque(idDel);
  });

  registrarServiceWorker();
});


// Clique no botão
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnPDF");
  if (btn) btn.addEventListener("click", gerarPDFOrcamento);
});

// ====== ESTOQUE (localStorage) ======
const ESTOQUE_KEY = "mecprice_estoque";
let estoque = [];

function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

function carregarEstoque() {
  try {
    estoque = JSON.parse(localStorage.getItem(ESTOQUE_KEY) || "[]");
  } catch {
    estoque = [];
  }
}

function salvarEstoque() {
  localStorage.setItem(ESTOQUE_KEY, JSON.stringify(estoque));
}

function renderEstoque() {
  const tbody = document.getElementById("tbodyEstoque");
  if (!tbody) return;

  tbody.innerHTML = "";
  const msg = document.getElementById("msgEstoque");

  estoque
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((it) => {
      const baixo = Number(it.qtd) <= Number(it.minimo || 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${it.nome}</td>
        <td>${it.sku || ""}</td>
        <td>${it.categoria || ""}</td>
        <td>${it.qtd}</td>
        <td>${formatBRL(it.preco)}</td>
        <td>${it.minimo ?? 0}</td>
        <td>
          <button class="btn secondary" data-edit="${it.id}">Editar</button>
          <button class="btn" data-in="${it.id}">+ Entrada</button>
          <button class="btn" data-out="${it.id}">- Saída</button>
          <button class="btn danger" data-del="${it.id}">Remover</button>
        </td>
      `;

      if (baixo) tr.style.opacity = "0.95"; // opcional: destaque via CSS depois
      tbody.appendChild(tr);
    });

  const qtdBaixa = estoque.filter(i => Number(i.qtd) <= Number(i.minimo || 0)).length;
  if (msg) msg.textContent = qtdBaixa ? `⚠️ ${qtdBaixa} item(ns) com estoque baixo.` : "Estoque OK ✅";
}

function upsertItemEstoque(item) {
  // Se já existir por SKU (ou nome+categoria), atualiza
  const idx = estoque.findIndex(i => (item.sku && i.sku === item.sku) || (i.nome === item.nome && i.categoria === item.categoria));
  if (idx >= 0) {
    estoque[idx] = { ...estoque[idx], ...item };
  } else {
    estoque.push({ id: uid(), ...item });
  }
  salvarEstoque();
  renderEstoque();
}

function ajustarQtd(id, delta) {
  const it = estoque.find(i => i.id === id);
  if (!it) return;
  it.qtd = Math.max(0, Number(it.qtd || 0) + Number(delta || 0));
  salvarEstoque();
  renderEstoque();
}

function removerItem(id) {
  estoque = estoque.filter(i => i.id !== id);
  salvarEstoque();
  renderEstoque();
}

function preencherFormulario(id) {
  const it = estoque.find(i => i.id === id);
  if (!it) return;
  document.getElementById("estNome").value = it.nome || "";
  document.getElementById("estSku").value = it.sku || "";
  document.getElementById("estCat").value = it.categoria || "";
  document.getElementById("estCusto").value = it.custo ?? 0;
  document.getElementById("estPreco").value = it.preco ?? 0;
  document.getElementById("estQtd").value = it.qtd ?? 0;
  document.getElementById("estMin").value = it.minimo ?? 0;
}

function limparFormEstoque() {
  ["estNome","estSku","estCat","estCusto","estPreco","estQtd","estMin"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function exportarEstoque() {
  const blob = new Blob([JSON.stringify(estoque, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mecprice_estoque.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarEstoque(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        // mantém ids, mas garante campos
        estoque = data.map(i => ({
          id: i.id || uid(),
          nome: i.nome || "",
          sku: i.sku || "",
          categoria: i.categoria || "",
          custo: Number(i.custo || 0),
          preco: Number(i.preco || 0),
          qtd: Number(i.qtd || 0),
          minimo: Number(i.minimo || 0),
        }));
        salvarEstoque();
        renderEstoque();
      }
    } catch (e) {
      alert("JSON inválido para estoque.");
    }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  carregarEstoque();
  renderEstoque();

  document.getElementById("btnAddItem")?.addEventListener("click", () => {
    const nome = document.getElementById("estNome").value.trim();
    const sku = document.getElementById("estSku").value.trim();
    if (!nome) return alert("Informe o nome da peça.");

    upsertItemEstoque({
      nome,
      sku,
      categoria: document.getElementById("estCat").value.trim(),
      custo: Number(document.getElementById("estCusto").value || 0),
      preco: Number(document.getElementById("estPreco").value || 0),
      qtd: Number(document.getElementById("estQtd").value || 0),
      minimo: Number(document.getElementById("estMin").value || 0),
    });

    limparFormEstoque();
  });

  document.getElementById("btnExportEstoque")?.addEventListener("click", exportarEstoque);

  document.getElementById("importEstoque")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importarEstoque(file);
  });

  document.getElementById("tbodyEstoque")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const idEdit = btn.getAttribute("data-edit");
    const idIn = btn.getAttribute("data-in");
    const idOut = btn.getAttribute("data-out");
    const idDel = btn.getAttribute("data-del");

    if (idEdit) return preencherFormulario(idEdit);
    if (idIn) return ajustarQtd(idIn, +1);
    if (idOut) return ajustarQtd(idOut, -1);
    if (idDel) return removerItem(idDel);
  });
});
