(() => {
    "use strict";

    const { toNumber, uid, normalize, formatBRL } = window.MecPrice.core;
    const DOM = window.MecPrice.dom;
    const { ESTOQUE_KEY, getJSON, setJSON } = window.MecPrice.storage;

    let estoque = [];

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

    function renderEstoque() {
        if (!DOM.tbodyEstoque) return;
        DOM.tbodyEstoque.innerHTML = "";

        const ordenado = estoque.slice().sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
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
            DOM.tbodyEstoque.appendChild(tr);
        });

        if (DOM.msgEstoque) {
            const qtdBaixa = estoque.filter((i) => toNumber(i.qtd, 0) <= toNumber(i.minimo, 0)).length;
            DOM.msgEstoque.textContent = qtdBaixa ? `⚠️ ${qtdBaixa} item(ns) com estoque baixo.` : "Estoque OK ✅";
        }
    }

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

        let it = estoque.find((i) => normalize(i.sku) === t);
        if (it) return it;

        it = estoque.find((i) => normalize(i.nome) === t);
        if (it) return it;

        it = estoque.find((i) => normalize(`${i.nome} (${i.sku || ""})`) === t);
        if (it) return it;

        return null;
    }

    function tentarAutoPreencherPreco() {
        if (!DOM.nomePecaInput || !DOM.valorPecaInput) return;
        const it = acharItemEstoquePorEntrada(DOM.nomePecaInput.value);
        if (!it) return;

        if (!DOM.valorPecaInput.value) DOM.valorPecaInput.value = toNumber(it.preco, 0).toFixed(2);
        if (DOM.qtdPecaInput && !DOM.qtdPecaInput.value) DOM.qtdPecaInput.value = 1;
    }

    function baixarEstoque(nomeDigitado, qtdUsada) {
        const it = acharItemEstoquePorEntrada(nomeDigitado);
        if (!it) return null;

        const qtd = toNumber(qtdUsada, 0);
        if (qtd <= 0) return null;

        if (toNumber(it.qtd, 0) < qtd) {
            if (DOM.erroPeca) DOM.erroPeca.textContent = `Estoque insuficiente. Disponível: ${toNumber(it.qtd, 0)}`;
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

    function upsertEstoque() {
        if (!DOM.estNome) return;

        const nome = DOM.estNome.value.trim();
        const sku = DOM.estSku ? DOM.estSku.value.trim() : "";
        if (!nome) {
            alert("Informe o nome da peça.");
            return;
        }

        const item = {
            id: uid(),
            nome,
            sku,
            categoria: DOM.estCat ? DOM.estCat.value.trim() : "",
            custo: toNumber(DOM.estCusto ? DOM.estCusto.value : 0, 0),
            preco: toNumber(DOM.estPreco ? DOM.estPreco.value : 0, 0),
            qtd: toNumber(DOM.estQtd ? DOM.estQtd.value : 0, 0),
            minimo: toNumber(DOM.estMin ? DOM.estMin.value : 0, 0),
        };

        const idx = estoque.findIndex((i) => {
            if (sku && i.sku) return normalize(i.sku) === normalize(sku);
            return normalize(i.nome) === normalize(nome) && normalize(i.categoria) === normalize(item.categoria);
        });

        if (idx >= 0) {
            item.id = estoque[idx].id;
            estoque[idx] = { ...estoque[idx], ...item };
        } else {
            estoque.push(item);
        }

        salvarEstoque();
        renderEstoque();
        atualizarSugestoesEstoque();

        // limpar form
        DOM.estNome.value = "";
        if (DOM.estSku) DOM.estSku.value = "";
        if (DOM.estCat) DOM.estCat.value = "";
        if (DOM.estCusto) DOM.estCusto.value = "";
        if (DOM.estPreco) DOM.estPreco.value = "";
        if (DOM.estQtd) DOM.estQtd.value = "";
        if (DOM.estMin) DOM.estMin.value = "";
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
