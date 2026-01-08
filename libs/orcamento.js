(() => {
    "use strict";

    const { toNumber, formatBRL } = window.MecPrice.core;
    const DOM = window.MecPrice.dom;
    const { ORCAMENTO_KEY, getJSON, setJSON } = window.MecPrice.storage;

    // Estoque pode existir ou não — não pode quebrar o orçamento
    const Estoque = window.MecPrice.estoque;

    let pecas = [];
    let servicos = [];

    function getPecas() { return pecas; }
    function getServicos() { return servicos; }

    // ========= Helpers
    function totalPecasCalc() {
        return pecas.reduce((acc, p) => acc + toNumber(p.qtd, 0) * toNumber(p.valor, 0), 0);
    }

    function totalServicosCalc() {
        return servicos.reduce((acc, s) => acc + toNumber(s.qtd, 0) * toNumber(s.valor, 0), 0);
    }

    function calcularTotais() {
        const totalPecas = totalPecasCalc();
        const totalServicos = totalServicosCalc();
        return { totalPecas, totalServicos, totalGeral: totalPecas + totalServicos };
    }

    // ========= PEÇAS
    function atualizarTabelaPecas() {
        if (!DOM.tabelaPecas || !DOM.totalPecasSpan) return;

        DOM.tabelaPecas.innerHTML = "";
        let total = 0;

        pecas.forEach((p, index) => {
            const subtotal = toNumber(p.qtd, 0) * toNumber(p.valor, 0);
            total += subtotal;

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

        DOM.totalPecasSpan.textContent = formatBRL(total);
    }

    function removerPeca(index) {
        const p = pecas[index];
        // devolve estoque só se existir módulo e id
        if (p?.estoqueId && Estoque?.devolverEstoque) {
            Estoque.devolverEstoque(p.estoqueId, p.qtd);
        }
        pecas.splice(index, 1);
        renderAll();
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

        // estoque opcional
        let estoqueId = null;
        if (Estoque?.baixarEstoque) {
            estoqueId = Estoque.baixarEstoque(nome, qtd);
            const tentado = Estoque?.acharItemEstoquePorEntrada?.(nome);
            if (tentado && !estoqueId) return; // tentou baixar item existente e não conseguiu
        }

        pecas.push({ nome, qtd, valor, estoqueId });

        if (DOM.nomePecaInput) DOM.nomePecaInput.value = "";
        if (DOM.qtdPecaInput) DOM.qtdPecaInput.value = "";
        if (DOM.valorPecaInput) DOM.valorPecaInput.value = "";

        renderAll();
    }

    // ========= SERVIÇOS
    function atualizarTabelaServicos() {
        if (!DOM.tbodyServicos || !DOM.totalServicos) return;

        DOM.tbodyServicos.innerHTML = "";
        let total = 0;

        servicos.forEach((s, index) => {
            const subtotal = toNumber(s.qtd, 0) * toNumber(s.valor, 0);
            total += subtotal;

            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${s.nome}</td>
        <td>${s.qtd}</td>
        <td>${formatBRL(s.valor)}</td>
        <td>${formatBRL(subtotal)}</td>
        <td>
          <button class="btn danger" style="padding:0.25rem 0.6rem; font-size:0.75rem;" data-rm-serv="${index}">
            Remover
          </button>
        </td>
      `;
            DOM.tbodyServicos.appendChild(tr);
        });

        DOM.totalServicos.textContent = formatBRL(total);
    }

    function removerServico(index) {
        servicos.splice(index, 1);
        renderAll();
    }

    function setupRemoverServicoDelegation() {
        if (!DOM.tbodyServicos) return;
        DOM.tbodyServicos.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-rm-serv]");
            if (!btn) return;
            const idx = parseInt(btn.getAttribute("data-rm-serv"), 10);
            if (!Number.isNaN(idx)) removerServico(idx);
        });
    }

    function adicionarServico() {
        if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "";
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "";

        const nome = (DOM.servNome?.value || "").trim();
        const qtd = parseInt(DOM.servQtd?.value || "1", 10);
        const valor = parseFloat(DOM.servValor?.value || "");

        if (!nome || Number.isNaN(qtd) || qtd <= 0 || Number.isNaN(valor) || valor < 0) {
            if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "Preencha serviço, quantidade e valor corretamente.";
            return;
        }

        servicos.push({ nome, qtd, valor });

        if (DOM.servNome) DOM.servNome.value = "";
        if (DOM.servQtd) DOM.servQtd.value = "1";
        if (DOM.servValor) DOM.servValor.value = "";

        renderAll();
    }

    // ========= Validação
    function validarDadosPrincipais() {
        const cliente = (DOM.clienteInput?.value || "").trim();
        const descricao = (DOM.descricaoInput?.value || "").trim();

        if (!cliente || !descricao) {
            if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "Preencha nome do cliente e observações.";
            return false;
        }

        if (pecas.length === 0 && servicos.length === 0) {
            if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "Adicione pelo menos 1 serviço ou 1 peça.";
            return false;
        }

        if (DOM.erroPrincipal) DOM.erroPrincipal.textContent = "";
        return true;
    }

    // ========= Render “tela principal”
    function renderAll() {
        atualizarTabelaServicos();
        atualizarTabelaPecas();
    }

    // ========= Gerar / Salvar / Carregar
    function gerarOrcamento() {
        if (DOM.mensagemAcao) DOM.mensagemAcao.textContent = "";
        if (!validarDadosPrincipais()) return;

        const cliente = (DOM.clienteInput?.value || "").trim();
        const descricao = (DOM.descricaoInput?.value || "").trim();
        const data = new Date().toLocaleDateString("pt-BR");
        const { totalPecas, totalServicos, totalGeral } = calcularTotais();

        DOM.orcCliente && (DOM.orcCliente.textContent = cliente);
        DOM.orcDescricao && (DOM.orcDescricao.textContent = descricao);
        DOM.orcData && (DOM.orcData.textContent = data);

        // Serviços no resumo
        if (DOM.orcServicos) {
            DOM.orcServicos.innerHTML = "";
            servicos.forEach((s) => {
                const subtotal = toNumber(s.qtd, 0) * toNumber(s.valor, 0);
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${s.nome}</td>
          <td>${s.qtd}</td>
          <td>${formatBRL(s.valor)}</td>
          <td>${formatBRL(subtotal)}</td>
        `;
                DOM.orcServicos.appendChild(tr);
            });
        }

        // Peças no resumo
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

        DOM.orcTotalServicos && (DOM.orcTotalServicos.textContent = formatBRL(totalServicos));
        DOM.orcTotalPecas && (DOM.orcTotalPecas.textContent = formatBRL(totalPecas));
        DOM.orcTotalGeral && (DOM.orcTotalGeral.textContent = formatBRL(totalGeral));

        DOM.cardOrcamento && (DOM.cardOrcamento.hidden = false);
        DOM.mensagemAcao && (DOM.mensagemAcao.textContent = "Orçamento gerado com sucesso!");
    }

    function salvarOrcamento() {
        if (!validarDadosPrincipais()) return;

        const cliente = (DOM.clienteInput?.value || "").trim();
        const descricao = (DOM.descricaoInput?.value || "").trim();
        const { totalPecas, totalServicos, totalGeral } = calcularTotais();

        const payload = {
            cliente,
            telefone: (DOM.telefoneInput?.value || "").trim(),
            cpfCnpj: (DOM.cpfCnpjInput?.value || "").trim(),
            placa: (DOM.placaInput?.value || "").trim(),
            modelo: (DOM.modeloInput?.value || "").trim(),
            ano: toNumber(DOM.anoInput?.value, 0),
            km: toNumber(DOM.kmInput?.value, 0),

            descricao,
            servicos,
            pecas,
            totalServicos,
            totalPecas,
            totalGeral,
            data: new Date().toISOString(),
        };

        setJSON(ORCAMENTO_KEY, payload);
        DOM.mensagemAcao && (DOM.mensagemAcao.textContent = "Orçamento salvo com sucesso (localStorage).");
        DOM.erroPeca && (DOM.erroPeca.textContent = "");
    }

    function verificarUltimoOrcamento() {
        const salvo = getJSON(ORCAMENTO_KEY, null);
        DOM.cardUltimoOrcamento && (DOM.cardUltimoOrcamento.hidden = !salvo);
    }

    function carregarUltimoOrcamento() {
        const orc = getJSON(ORCAMENTO_KEY, null);
        if (!orc) return;

        DOM.clienteInput && (DOM.clienteInput.value = orc.cliente || "");
        DOM.telefoneInput && (DOM.telefoneInput.value = orc.telefone || "");
        DOM.cpfCnpjInput && (DOM.cpfCnpjInput.value = orc.cpfCnpj || "");
        DOM.placaInput && (DOM.placaInput.value = orc.placa || "");
        DOM.modeloInput && (DOM.modeloInput.value = orc.modelo || "");
        DOM.anoInput && (DOM.anoInput.value = toNumber(orc.ano, 0));
        DOM.kmInput && (DOM.kmInput.value = toNumber(orc.km, 0));
        DOM.descricaoInput && (DOM.descricaoInput.value = orc.descricao || "");

        servicos = Array.isArray(orc.servicos) ? orc.servicos : [];
        pecas = Array.isArray(orc.pecas) ? orc.pecas : [];

        renderAll();

        DOM.mensagemAcao && (DOM.mensagemAcao.textContent = "Último orçamento carregado. Você pode editar e gerar novamente.");
        DOM.cardUltimoOrcamento && (DOM.cardUltimoOrcamento.hidden = true);
    }

    function limparTudo() {
        DOM.clienteInput && (DOM.clienteInput.value = "");
        DOM.telefoneInput && (DOM.telefoneInput.value = "");
        DOM.cpfCnpjInput && (DOM.cpfCnpjInput.value = "");
        DOM.placaInput && (DOM.placaInput.value = "");
        DOM.modeloInput && (DOM.modeloInput.value = "");
        DOM.anoInput && (DOM.anoInput.value = "");
        DOM.kmInput && (DOM.kmInput.value = "");
        DOM.descricaoInput && (DOM.descricaoInput.value = "");

        DOM.servNome && (DOM.servNome.value = "");
        DOM.servQtd && (DOM.servQtd.value = "1");
        DOM.servValor && (DOM.servValor.value = "");

        pecas = [];
        servicos = [];
        renderAll();

        DOM.cardOrcamento && (DOM.cardOrcamento.hidden = true);
        DOM.mensagemAcao && (DOM.mensagemAcao.textContent = "Formulário limpo.");
        DOM.erroPeca && (DOM.erroPeca.textContent = "");
        DOM.erroPrincipal && (DOM.erroPrincipal.textContent = "");
    }

    window.MecPrice.orcamento = {
        getPecas,
        getServicos,

        adicionarPeca,
        atualizarTabelaPecas,
        setupRemoverPecaDelegation,

        adicionarServico,
        atualizarTabelaServicos,
        setupRemoverServicoDelegation,

        validarDadosPrincipais,
        calcularTotais,

        gerarOrcamento,
        salvarOrcamento,
        verificarUltimoOrcamento,
        carregarUltimoOrcamento,
        limparTudo,
    };
})();
