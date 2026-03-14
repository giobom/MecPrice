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
    let editId = null;

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
                // Sugestão agora inclui Código ou NCM se existirem
                const infoExtra = it.sku || it.ncm || "";
                opt.value = infoExtra ? `${it.nome} (${infoExtra})` : it.nome;
                DOM.dlSugestoes.appendChild(opt);
            });
    }

    function acharItemEstoquePorEntrada(texto) {
        const t = normalize(texto);
        if (!t) return null;

        // Busca por Código (Antigo SKU), Nome ou NCM
        return estoque.find((i) =>
            normalize(i.sku) === t ||
            normalize(i.nome) === t ||
            normalize(i.ncm) === t ||
            normalize(`${i.nome} (${i.sku || ""})`) === t ||
            normalize(`${i.nome} (${i.ncm || ""})`) === t
        ) || null;
    }

    function tentarAutoPreencherPreco() {
        if (!DOM.nomePecaInput || !DOM.valorPecaInput) return;
        const it = acharItemEstoquePorEntrada(DOM.nomePecaInput.value);
        if (!it) return;

        if (!DOM.valorPecaInput.value) DOM.valorPecaInput.value = toNumber(it.preco, 0).toFixed(2);
        if (DOM.qtdPecaInput && !DOM.qtdPecaInput.value) DOM.qtdPecaInput.value = "1";
    }

    // =========================
    // Render (Atualizado com NCM)
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

            // ✅ Colunas: Nome | Código | NCM | Categoria | Custo | Preço | Qtd | Mín | Ações
            tr.innerHTML = `
                <td>${it.nome || ""}</td>
                <td>${it.sku || ""}</td>
                <td>${it.ncm || ""}</td>
                <td>${it.categoria || ""}</td>
                <td>${formatBRL(it.custo)}</td>
                <td>${formatBRL(it.preco)}</td>
                <td>${qtd}</td>
                <td>${minimo}</td>
                <td>
                  <button class="btn secondary" data-edit="${it.id}">Editar</button>
                  <button class="btn" data-in="${it.id}">+ Ent.</button>
                  <button class="btn" data-out="${it.id}">- Saí.</button>
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
    // Edição / Upsert (Adicionado NCM)
    // =========================
    function preencherFormulario(it) {
        if (!it) return;

        if (DOM.estNome) DOM.estNome.value = it.nome || "";
        if (DOM.estCodigo) DOM.estCodigo.value = it.sku || ""; // Mapeado para Código
        if (DOM.estNcm) DOM.estNcm.value = it.ncm || "";       // Novo campo NCM
        if (DOM.estCat) DOM.estCat.value = it.categoria || "";
        if (DOM.estCusto) DOM.estCusto.value = toNumber(it.custo, 0).toFixed(2);
        if (DOM.estPreco) DOM.estPreco.value = toNumber(it.preco, 0).toFixed(2);
        if (DOM.estQtd) DOM.estQtd.value = String(toNumber(it.qtd, 0));
        if (DOM.estMin) DOM.estMin.value = String(toNumber(it.minimo, 0));

        editId = it.id;
    }

    function cancelarEdicao() {
        editId = null;
        const campos = [DOM.estNome, DOM.estCodigo, DOM.estNcm, DOM.estCat, DOM.estCusto, DOM.estPreco, DOM.estQtd, DOM.estMin];
        campos.forEach(c => { if (c) c.value = ""; });
    }

    function upsertEstoque() {
        if (!DOM.estNome) return;

        const nome = DOM.estNome.value.trim();
        if (!nome) { alert("Informe o nome da peça."); return; }

        const item = {
            id: editId || uid(),
            nome,
            sku: DOM.estCodigo ? DOM.estCodigo.value.trim() : "", // Código
            ncm: DOM.estNcm ? DOM.estNcm.value.trim() : "",       // NCM
            categoria: DOM.estCat ? DOM.estCat.value.trim() : "",
            custo: toNumber(DOM.estCusto?.value, 0),
            preco: toNumber(DOM.estPreco?.value, 0),
            qtd: toNumber(DOM.estQtd?.value, 0),
            minimo: toNumber(DOM.estMin?.value, 0),
        };

        if (editId) {
            const idx = estoque.findIndex((i) => i.id === editId);
            if (idx >= 0) estoque[idx] = { ...estoque[idx], ...item };
            editId = null;
        } else {
            // Mescla por Código ou Nome
            const idx = estoque.findIndex((i) => {
                if (item.sku && i.sku) return normalize(i.sku) === normalize(item.sku);
                return normalize(i.nome) === normalize(nome);
            });

            if (idx >= 0) {
                item.id = estoque[idx].id;
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
    // Outros métodos mantidos
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
        if (!confirm("Remover este item permanentemente?")) return;
        estoque = estoque.filter((x) => x.id !== id);
        salvarEstoque();
        renderEstoque();
        atualizarSugestoesEstoque();
        if (editId === id) cancelarEdicao();
    }

    function baixarEstoque(nomeDigitado, qtdUsada) {
        const it = acharItemEstoquePorEntrada(nomeDigitado);
        if (!it) return null;
        const qtd = toNumber(qtdUsada, 0);
        if (qtd <= 0) return null;
        const disponivel = toNumber(it.qtd, 0);
        if (disponivel < qtd) {
            if (DOM.erroPeca) DOM.erroPeca.textContent = `Estoque insuficiente. Disp: ${disponivel}`;
            return null;
        }
        it.qtd = Math.max(0, disponivel - qtd);
        salvarEstoque();
        renderEstoque();
        atualizarSugestoesEstoque();
        return it.id;
    }

    function devolverEstoque(estoqueId, qtdDevolvida) {
        if (!estoqueId) return;
        const it = estoque.find((x) => x.id === estoqueId);
        if (!it) return;
        it.qtd = toNumber(it.qtd, 0) + toNumber(qtdDevolvida, 0);
        salvarEstoque();
        renderEstoque();
        atualizarSugestoesEstoque();
    }

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
                    sku: i.sku || i.codigo || "", // Suporta importar de formatos antigos
                    ncm: i.ncm || "",
                    categoria: i.categoria || "",
                    custo: toNumber(i.custo, 0),
                    preco: toNumber(i.preco, 0),
                    qtd: toNumber(i.qtd, 0),
                    minimo: toNumber(i.minimo, 0),
                }));
                salvarEstoque();
                renderEstoque();
                atualizarSugestoesEstoque();
                alert("Estoque importado!");
            } catch { alert("Erro ao importar JSON."); }
        };
        reader.readAsText(file);
    }

    function setupDelegationEditar() {
        if (!DOM.tbodyEstoque) return;
        DOM.tbodyEstoque.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-edit]");
            if (btn) {
                const it = estoque.find((x) => x.id === btn.getAttribute("data-edit"));
                if (it) preencherFormulario(it);
            }
            // Suporte para remover via delegação
            const btnDel = e.target.closest("button[data-del]");
            if (btnDel) removerItemEstoque(btnDel.getAttribute("data-del"));

            // Entrada/Saída rápida
            const btnIn = e.target.closest("button[data-in]");
            if (btnIn) ajustarQtdEstoque(btnIn.getAttribute("data-in"), 1);
            const btnOut = e.target.closest("button[data-out]");
            if (btnOut) ajustarQtdEstoque(btnOut.getAttribute("data-out"), -1);
        });
    }

    document.addEventListener("DOMContentLoaded", setupDelegationEditar);

    window.MecPrice.estoque = {
        carregarEstoque, salvarEstoque, getEstoque,
        renderEstoque, atualizarSugestoesEstoque,
        acharItemEstoquePorEntrada, tentarAutoPreencherPreco,
        baixarEstoque, devolverEstoque,
        upsertEstoque, ajustarQtdEstoque, removerItemEstoque,
        exportarEstoqueJSON, importarEstoqueJSON,
    };
})();