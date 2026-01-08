(() => {
    "use strict";

    const Core = window.MecPrice?.core;
    const DOM = window.MecPrice?.dom;
    const Storage = window.MecPrice?.storage;

    if (!Core || !DOM || !Storage) {
        console.warn("[estoque.js] Core/DOM/Storage não carregados.");
        return;
    }

    const { toNumber, uid, normalize, formatBRL } = Core;
    const { ESTOQUE_KEY, getJSON, setJSON } = Storage;

    let estoque = [];
    let editId = null; // controla modo edição

    // =========================
    // Persistência
    // =========================
    function carregarEstoque() {
        const data = getJSON(ESTOQUE_KEY, []);
        estoque = Array.isArray(data) ? data : [];
    }

    function salvarEstoque() {
        setJSON(ESTOQUE_KEY, estoque);
    }

    function getEstoque() {
        return estoque;
    }

    // =========================
    // Sugestões / Busca
    // =========================
    function atualizarSugestoesEstoque() {
        if (!DOM.dlSugestoes) return;

        DOM.dlSugestoes.innerHTML = "";
        estoque
            .slice()
            .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
            .forEach((it) => {
                const opt = document.createElement("option");
                opt.value = it.sku ? `${it.nome} (${it.sku})` : it.nome;
                DOM.dlSugestoes.appendChild(opt);
            });
    }

    function acharItemEstoquePorEntrada(texto) {
        const t = normalize(texto);
        if (!t) return null;

        // 1) match exato por SKU
        let it = estoque.find((i) => normalize(i.sku) === t);
        if (it) return it;

        // 2) match exato por nome
        it = estoque.find((i) => normalize(i.nome) === t);
        if (it) return it;

        // 3) match do formato "Nome (SKU)"
        it = estoque.find((i) => normalize(`${i.nome} (${i.sku || ""})`) === t);
        if (it) return it;

        return null;
    }

    function tentarAutoPreencherPreco() {
        if (!DOM.nomePecaInput || !DOM.valorPecaInput) return;

        const it = acharItemEstoquePorEntrada(DOM.nomePecaInput.value);
        if (!it) return;

        if (!DOM.valorPecaInput.value) DOM.valorPecaInput.value = toNumber(it.preco, 0).toFixed(2);
        if (DOM.qtdPecaInput && !DOM.qtdPecaInput.value) DOM.qtdPecaInput.value = "1";
    }

    // =========================
    // Render
    // =========================
    function renderEstoque() {
        if (!DOM.tbodyEstoque) return;

        DOM.tbodyEstoque.innerHTML = "";

        const ordenado = estoque
            .slice()
            .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

        ordenado.forEach((it) => {
            const tr = document.createElement("tr");

            const qtd = toNumber(it.qtd, 0);
            const minimo = toNumber(it.minimo, 0);
            const baixo = qtd <= minimo;

            // ✅ BATE COM O HTML:
            // Nome | SKU | Categoria | Custo | Preço | Qtd | Mín | Ações
            tr.innerHTML = `
        <td>${it.nome || ""}</td>
        <td>${it.sku || ""}</td>
        <td>${it.categoria || ""}</td>
        <td>${formatBRL(it.custo)}</td>
        <td>${formatBRL(it.preco)}</td>
        <td>${qtd}</td>
        <td>${minimo}</td>
        <td>
          <button class="btn secondary" data-edit="${it.id}">Editar</button>
          <button class="btn" data-in="${it.id}">+ Entrada</button>
          <button class="btn" data-out="${it.id}">- Saída</button>
          <button class="btn danger" data-del="${it.id}">Remover</button>
        </td>
      `;

            if (baixo) tr.style.outline = "1px solid rgba(250,204,21,0.5)";
            DOM.tbodyEstoque.appendChild(tr);
        });

        if (DOM.msgEstoque) {
            const qtdBaixa = estoque.filter((i) => toNumber(i.qtd, 0) <= toNumber(i.minimo, 0)).length;
            DOM.msgEstoque.textContent = qtdBaixa ? `⚠️ ${qtdBaixa} item(ns) com estoque baixo.` : "Estoque OK ✅";
        }
    }

    // =========================
    // Ajuste de quantidade (Entrada/Saída)
    // =========================
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

        // se estava editando, limpa
        if (editId === id) cancelarEdicao();
    }

    // =========================
    // Integração com Orçamento
    // =========================
    function baixarEstoque(nomeDigitado, qtdUsada) {
        const it = acharItemEstoquePorEntrada(nomeDigitado);
        if (!it) return null;

        const qtd = toNumber(qtdUsada, 0);
        if (qtd <= 0) return null;

        const disponivel = toNumber(it.qtd, 0);
        if (disponivel < qtd) {
            if (DOM.erroPeca) {
                DOM.erroPeca.textContent = `Estoque insuficiente. Disponível: ${disponivel}`;
            }
            return null;
        }

        it.qtd = Math.max(0, disponivel - qtd);

        salvarEstoque();
        renderEstoque();
        atualizarSugestoesEstoque();

        return it.id; // ✅ sucesso
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

    // =========================
    // Edição / Upsert
    // =========================
    function preencherFormulario(it) {
        if (!it) return;

        if (DOM.estNome) DOM.estNome.value = it.nome || "";
        if (DOM.estSku) DOM.estSku.value = it.sku || "";
        if (DOM.estCat) DOM.estCat.value = it.categoria || "";
        if (DOM.estCusto) DOM.estCusto.value = toNumber(it.custo, 0).toFixed(2);
        if (DOM.estPreco) DOM.estPreco.value = toNumber(it.preco, 0).toFixed(2);
        if (DOM.estQtd) DOM.estQtd.value = String(toNumber(it.qtd, 0));
        if (DOM.estMin) DOM.estMin.value = String(toNumber(it.minimo, 0));

        editId = it.id;

        if (DOM.msgEstoque) DOM.msgEstoque.textContent = "Editando item… clique em Adicionar/Atualizar para salvar.";
    }

    function cancelarEdicao() {
        editId = null;

        if (DOM.estNome) DOM.estNome.value = "";
        if (DOM.estSku) DOM.estSku.value = "";
        if (DOM.estCat) DOM.estCat.value = "";
        if (DOM.estCusto) DOM.estCusto.value = "";
        if (DOM.estPreco) DOM.estPreco.value = "";
        if (DOM.estQtd) DOM.estQtd.value = "";
        if (DOM.estMin) DOM.estMin.value = "";
    }

    function upsertEstoque() {
        if (!DOM.estNome) return;

        const nome = DOM.estNome.value.trim();
        const sku = DOM.estSku ? DOM.estSku.value.trim() : "";

        if (!nome) {
            alert("Informe o nome da peça.");
            return;
        }

        const item = {
            id: editId || uid(),
            nome,
            sku,
            categoria: DOM.estCat ? DOM.estCat.value.trim() : "",
            custo: toNumber(DOM.estCusto ? DOM.estCusto.value : 0, 0),
            preco: toNumber(DOM.estPreco ? DOM.estPreco.value : 0, 0),
            qtd: toNumber(DOM.estQtd ? DOM.estQtd.value : 0, 0),
            minimo: toNumber(DOM.estMin ? DOM.estMin.value : 0, 0),
        };

        // se estiver editando, atualiza por ID
        if (editId) {
            const idx = estoque.findIndex((i) => i.id === editId);
            if (idx >= 0) estoque[idx] = { ...estoque[idx], ...item };
            editId = null;
        } else {
            // senão, tenta mesclar por SKU (se houver) ou por Nome + Categoria
            const idx = estoque.findIndex((i) => {
                if (sku && i.sku) return normalize(i.sku) === normalize(sku);
                return normalize(i.nome) === normalize(nome) && normalize(i.categoria) === normalize(item.categoria);
            });

            if (idx >= 0) {
                item.id = estoque[idx].id; // preserva id existente
                estoque[idx] = { ...estoque[idx], ...item };
            } else {
                estoque.push(item);
            }
        }

        salvarEstoque();
        renderEstoque();
        atualizarSugestoesEstoque();
        cancelarEdicao();

        if (DOM.msgEstoque) DOM.msgEstoque.textContent = "Item salvo ✅";
    }

    // =========================
    // Import/Export
    // =========================
    function exportarEstoqueJSON() {
        const blob = new Blob([JSON.stringify(estoque, null, 2)], { type: "application/json" });
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

    // =========================
    // Delegation: Editar (sem quebrar seu app.js)
    // =========================
    function setupDelegationEditar() {
        if (!DOM.tbodyEstoque) return;

        DOM.tbodyEstoque.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-edit]");
            if (!btn) return;

            const id = btn.getAttribute("data-edit");
            const it = estoque.find((x) => x.id === id);
            if (it) preencherFormulario(it);
        });
    }

    // dispara ao carregar
    document.addEventListener("DOMContentLoaded", () => {
        setupDelegationEditar();
    });

    // Export público
    window.MecPrice.estoque = {
        carregarEstoque,
        salvarEstoque,
        getEstoque,

        renderEstoque,
        atualizarSugestoesEstoque,
        acharItemEstoquePorEntrada,
        tentarAutoPreencherPreco,

        baixarEstoque,
        devolverEstoque,

        upsertEstoque,
        ajustarQtdEstoque,
        removerItemEstoque,

        exportarEstoqueJSON,
        importarEstoqueJSON,
    };
})();
