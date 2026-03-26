(() => {
    "use strict";

    const { toNumber, formatBRL } = window.MecPrice.core;
    const DOM = window.MecPrice.dom;
    const { ORCAMENTO_KEY, getJSON, setJSON } = window.MecPrice.storage;
    const Estoque = window.MecPrice.estoque;

    let pecas = [];

    function getPecas() {
        return pecas;
    }

    function atualizarTabelaPecas() {
        if (!DOM.tabelaPecas || !DOM.totalPecasSpan) return;

        DOM.tabelaPecas.innerHTML = "";
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
            DOM.tabelaPecas.appendChild(tr);
        });

        DOM.totalPecasSpan.textContent = formatBRL(totalPecas);
    }

    function removerPeca(index) {
        const p = pecas[index];
        if (p?.estoqueId) Estoque.devolverEstoque(p.estoqueId, p.qtd);
        pecas.splice(index, 1);
        atualizarTabelaPecas();
    }

    function setupRemoverPecaDelegation() {
        if (!DOM.tabelaPecas) return;
        DOM.tabelaPecas.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-rm]");
            if (!btn) return;
            const idx = parseInt(btn.getAttribute("data-rm"), 10);
            if (!Number.isNaN(idx)) removerPeca(idx);
        });
    }

    function adicionarPeca() {
        if (DOM.erroPeca) DOM.erroPeca.textContent = "";
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "";

        const nome = (DOM.nomePecaInput?.value || "").trim();
        const qtd = parseInt(DOM.qtdPecaInput?.value || "", 10);
        const valor = parseFloat(DOM.valorPecaInput?.value || "");

        if (!nome || Number.isNaN(qtd) || qtd <= 0 || Number.isNaN(valor) || valor < 0) {
            if (DOM.erroPeca) DOM.erroPeca.textContent = "Preencha nome, quantidade e valor unitário corretamente.";
            return;
        }

        const estoqueId = Estoque.baixarEstoque(nome, qtd);

        const tentado = Estoque.acharItemEstoquePorEntrada(nome);
        if (tentado && !estoqueId) return;

        pecas.push({ nome, qtd, valor, estoqueId });

        if (DOM.nomePecaInput) DOM.nomePecaInput.value = "";
        if (DOM.qtdPecaInput) DOM.qtdPecaInput.value = "";
        if (DOM.valorPecaInput) DOM.valorPecaInput.value = "";

        atualizarTabelaPecas();
    }

    function validarDadosPrincipais() {
        const cliente = (DOM.clienteInput?.value || "").trim();
        const descricao = (DOM.descricaoInput?.value || "").trim();
        const mao = toNumber(DOM.maoDeObraInput?.value, NaN);

        if (!cliente || !descricao || Number.isNaN(mao) || mao < 0) {
            if (DOM.erroPrincipal) {
                DOM.erroPrincipal.textContent =
                    "Preencha nome do cliente, descrição e valor da mão de obra corretamente.";
            }
            return false;
        }
        if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "";
        return true;
    }

    function calcularTotais() {
        const totalPecas = pecas.reduce((acc, p) => acc + toNumber(p.qtd, 0) * toNumber(p.valor, 0), 0);
        const mao = toNumber(DOM.maoDeObraInput?.value, 0);
        return { totalPecas, maoDeObra: mao, totalGeral: totalPecas + mao };
    }

    function gerarOrcamento() {
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "";
        if (!validarDadosPrincipais()) return;

        const cliente = (DOM.clienteInput?.value || "").trim();
        const descricao = (DOM.descricaoInput?.value || "").trim();
        const data = new Date().toLocaleDateString("pt-BR");
        const { totalPecas, maoDeObra, totalGeral } = calcularTotais();

        if (DOM.orcCliente) DOM.orcCliente.textContent = cliente;
        if (DOM.orcDescricao) DOM.orcDescricao.textContent = descricao;
        if (DOM.orcData) DOM.orcData.textContent = data;

        if (DOM.orcPecas) {
            DOM.orcPecas.innerHTML = "";
            pecas.forEach((p) => {
                const subtotal = toNumber(p.qtd, 0) * toNumber(p.valor, 0);
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${p.nome}</td>
          <td>${p.qtd}</td>
          <td>${formatBRL(p.valor)}</td>
          <td>${formatBRL(subtotal)}</td>
        `;
                DOM.orcPecas.appendChild(tr);
            });
        }

        if (DOM.orcTotalPecas) DOM.orcTotalPecas.textContent = formatBRL(totalPecas);
        if (DOM.orcMaoDeObra) DOM.orcMaoDeObra.textContent = formatBRL(maoDeObra);
        if (DOM.orcTotalGeral) DOM.orcTotalGeral.textContent = formatBRL(totalGeral);

        if (DOM.cardOrcamento) DOM.cardOrcamento.hidden = false;
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "Orçamento gerado com sucesso!";
    }

    function salvarOrcamento() {
        if (!validarDadosPrincipais()) return;

        if (pecas.length === 0) {
            if (DOM.erroPeca) DOM.erroPeca.textContent = "Adicione pelo menos uma peça antes de salvar.";
            return;
        }

        const cliente = (DOM.clienteInput?.value || "").trim();
        const descricao = (DOM.descricaoInput?.value || "").trim();
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

        setJSON(ORCAMENTO_KEY, payload);
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "Orçamento salvo com sucesso (localStorage).";
        if (DOM.erroPeca) DOM.erroPeca.textContent = "";
    }

    function verificarUltimoOrcamento() {
        const salvo = getJSON(ORCAMENTO_KEY, null);
        if (DOM.cardUltimoOrcamento) DOM.cardUltimoOrcamento.hidden = !salvo;
    }

    function carregarUltimoOrcamento() {
        const orc = getJSON(ORCAMENTO_KEY, null);
        if (!orc) return;

        if (DOM.clienteInput) DOM.clienteInput.value = orc.cliente || "";
        if (DOM.descricaoInput) DOM.descricaoInput.value = orc.descricao || "";
        if (DOM.maoDeObraInput) DOM.maoDeObraInput.value = toNumber(orc.maoDeObra, 0);

        pecas = Array.isArray(orc.pecas) ? orc.pecas : [];
        atualizarTabelaPecas();

        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "Último orçamento carregado. Você pode editar e gerar novamente.";
        if (DOM.cardUltimoOrcamento) DOM.cardUltimoOrcamento.hidden = true;
    }

    function limparTudo() {
        if (DOM.clienteInput) DOM.clienteInput.value = "";
        if (DOM.telefoneInput) DOM.telefoneInput.value = "";
        if (DOM.cpfCnpjInput) DOM.cpfCnpjInput.value = "";
        if (DOM.placaInput) DOM.placaInput.value = "";
        if (DOM.modeloInput) DOM.modeloInput.value = "";
        if (DOM.anoInput) DOM.anoInput.value = "";
        if (DOM.kmInput) DOM.kmInput.value = "";
        if (DOM.descricaoInput) DOM.descricaoInput.value = "";
        if (DOM.maoDeObraInput) DOM.maoDeObraInput.value = "";

        pecas = [];
        atualizarTabelaPecas();

        if (DOM.cardOrcamento) DOM.cardOrcamento.hidden = true;
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "Formulário limpo.";
        if (DOM.erroPeca) DOM.erroPeca.textContent = "";
        if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "";
    }

    window.MecPrice.orcamento = {
        getPecas,
        adicionarPeca,
        atualizarTabelaPecas,
        setupRemoverPecaDelegation,
        validarDadosPrincipais,
        calcularTotais,
        gerarOrcamento,
        salvarOrcamento,
        verificarUltimoOrcamento,
        carregarUltimoOrcamento,
        limparTudo,
    };
})();
