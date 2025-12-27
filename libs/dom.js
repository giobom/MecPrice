(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    window.MecPrice.dom = {
        // Orçamento
        clienteInput: $("cliente"),
        telefoneInput: $("telefone"),
        cpfCnpjInput: $("cpfCnpj"),
        placaInput: $("placa"),
        modeloInput: $("modelo"),
        anoInput: $("ano"),
        kmInput: $("km"),
        descricaoInput: $("descricao"),
        maoDeObraInput: $("maoDeObra"),

        erroPrincipal: $("erroPrincipal"),
        erroPeca: $("erroPeca"),
        mensagemAcao: $("mensagemAcao"),

        tabelaPecas: $("tabelaPecas"),
        totalPecasSpan: $("totalPecas"),

        cardOrcamento: $("cardOrcamento"),
        orcCliente: $("orcCliente"),
        orcDescricao: $("orcDescricao"),
        orcData: $("orcData"),
        orcPecas: $("orcPecas"),
        orcTotalPecas: $("orcTotalPecas"),
        orcMaoDeObra: $("orcMaoDeObra"),
        orcTotalGeral: $("orcTotalGeral"),

        cardUltimoOrcamento: $("cardUltimoOrcamento"),
        btnCarregarUltimo: $("btnCarregarUltimo"),

        btnAdicionarPeca: $("btnAdicionarPeca"),
        btnGerar: $("btnGerar"),
        btnSalvar: $("btnSalvar"),
        btnLimpar: $("btnLimpar"),
        btnPDF: $("btnPDF"),

        nomePecaInput: $("nomePeca"),
        qtdPecaInput: $("qtdPeca"),
        valorPecaInput: $("valorPeca"),

        // Estoque
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
