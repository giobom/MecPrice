(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    window.MecPrice.dom = {
        // ===== ORÇAMENTO (inputs principais)
        clienteInput: $("cliente"),
        telefoneInput: $("telefone"),
        cpfCnpjInput: $("cpfCnpj"),
        placaInput: $("placa"),
        modeloInput: $("modelo"),
        anoInput: $("ano"),
        kmInput: $("km"),
        descricaoInput: $("descricao"),

        erroPrincipal: $("erroPrincipal"),
        erroPeca: $("erroPeca"),
        mensagemAcao: $("mensagemAcao"),

        // ===== PEÇAS (entrada + tabela)
        nomePecaInput: $("nomePeca"),
        qtdPecaInput: $("qtdPeca"),
        valorPecaInput: $("valorPeca"),
        btnAdicionarPeca: $("btnAdicionarPeca"),

        tabelaPecas: $("tabelaPecas"),
        totalPecasSpan: $("totalPecas"),

        // ===== SERVIÇOS (entrada + tabela)
        servNome: $("servNome"),
        servQtd: $("servQtd"),
        servValor: $("servValor"),
        btnAddServico: $("btnAddServico"),

        tbodyServicos: $("tbodyServicos"),
        totalServicos: $("totalServicos"),

        // ===== AÇÕES
        btnGerar: $("btnGerar"),
        btnSalvar: $("btnSalvar"),
        btnLimpar: $("btnLimpar"),
        btnPDF: $("btnPDF"),

        // ===== ORÇAMENTO GERADO (resumo)
        cardOrcamento: $("cardOrcamento"),
        orcCliente: $("orcCliente"),
        orcDescricao: $("orcDescricao"),
        orcData: $("orcData"),

        // Tabelas do resumo
        orcServicos: $("orcServicos"),
        orcPecas: $("orcPecas"),

        // Totais do resumo
        orcTotalServicos: $("orcTotalServicos"),
        orcTotalPecas: $("orcTotalPecas"),
        orcTotalGeral: $("orcTotalGeral"),

        // ===== ÚLTIMO ORÇAMENTO
        cardUltimoOrcamento: $("cardUltimoOrcamento"),
        btnCarregarUltimo: $("btnCarregarUltimo"),

        // ===== ESTOQUE
        estNome: $("estNome"),
        estSku: $("estSku"),
        estCat: $("estCat"),
        estCusto: $("estCusto"),
        estPreco: $("estPreco"),
        estQtd: $("estQtd"),
        estMin: $("estMin"),

        btnAddItem: $("btnAddItem"),
        btnExportEstoque: $("btnExportEstoque"),
        importEstoque: $("importEstoque"),

        tbodyEstoque: $("tbodyEstoque"),
        msgEstoque: $("msgEstoque"),

        dlSugestoes: $("estoqueSugestoes"),
    };
})();
