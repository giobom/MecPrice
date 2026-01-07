(() => {
    "use strict";

    const MecPrice = window.MecPrice;
    const DOM = MecPrice.dom;
    const Estoque = MecPrice.estoque;
    const Orc = MecPrice.orcamento;
    const PDF = MecPrice.pdf;
    const Pro = MecPrice.pro;
    const Validators = MecPrice.validators;

    function registrarServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js").catch((err) => {
                console.log("Erro ao registrar service worker:", err);
            });
        });
    }

    function setErroPrincipal(msg = "") {
        if (!DOM.erroPrincipal) return;
        DOM.erroPrincipal.textContent = msg;
    }

    function validarCpfCnpjUI() {
        // Se o DOM não tiver cpfCnpj, não trava o app
        const raw = DOM.cpfCnpj?.value ?? "";

        // Se não tiver validators carregado, não trava (mas avisa no console)
        if (!Validators?.validarCpfCnpj) {
            console.warn("[MecPrice] validators.js não carregado (MecPrice.validators ausente).");
            return true;
        }

        const { ok } = Validators.validarCpfCnpj(raw);

        if (!ok) {
            setErroPrincipal("CPF/CNPJ inválido. Confira os números e tente novamente.");
            DOM.cpfCnpj?.focus?.();
            return false;
        }

        // limpa erro se estiver ok
        setErroPrincipal("");
        return true;
    }

    document.addEventListener("DOMContentLoaded", () => {
        // Abas
        MecPrice.tabs?.setupTabs?.();

        // Estoque
        Estoque.carregarEstoque();
        Estoque.renderEstoque();
        Estoque.atualizarSugestoesEstoque();

        // Integração: autopreencher preço pelo estoque
        DOM.nomePecaInput?.addEventListener("input", Estoque.tentarAutoPreencherPreco);
        DOM.nomePecaInput?.addEventListener("change", Estoque.tentarAutoPreencherPreco);

        // Orçamento
        Orc.setupRemoverPecaDelegation();
        Orc.verificarUltimoOrcamento();
        Orc.atualizarTabelaPecas();

        // Botões orçamento (com validação CPF/CNPJ)
        DOM.btnAdicionarPeca?.addEventListener("click", Orc.adicionarPeca);

        DOM.btnGerar?.addEventListener("click", () => {
            if (!validarCpfCnpjUI()) return;
            Orc.gerarOrcamento();
        });

        DOM.btnSalvar?.addEventListener("click", () => {
            if (!validarCpfCnpjUI()) return;
            Orc.salvarOrcamento();
        });

        DOM.btnLimpar?.addEventListener("click", () => {
            setErroPrincipal("");
            Orc.limparTudo();
        });

        DOM.btnCarregarUltimo?.addEventListener("click", Orc.carregarUltimoOrcamento);

        // PDF (roteador free/pro)
        DOM.btnPDF?.addEventListener("click", PDF.gerarPDF);

        // Estoque listeners
        DOM.btnAddItem?.addEventListener("click", Estoque.upsertEstoque);
        DOM.btnExportEstoque?.addEventListener("click", Estoque.exportarEstoqueJSON);

        DOM.importEstoque?.addEventListener("change", (e) => {
            const file = e.target.files?.[0];
            if (file) Estoque.importarEstoqueJSON(file);
        });

        // Estoque - delegation (limpo, sem código morto)
        DOM.tbodyEstoque?.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const idEdit = btn.getAttribute("data-edit");
            const idIn = btn.getAttribute("data-in");
            const idOut = btn.getAttribute("data-out");
            const idDel = btn.getAttribute("data-del");

            // EDIÇÃO: se você ainda não implementou "preencher formulário",
            // aqui é o lugar certo. Por enquanto, não faz nada.
            if (idEdit) {
                // TODO: Estoque.preencherFormularioEstoque(idEdit)
                return;
            }

            if (idIn) return Estoque.ajustarQtdEstoque(idIn, +1);
            if (idOut) return Estoque.ajustarQtdEstoque(idOut, -1);
            if (idDel) return Estoque.removerItemEstoque(idDel);
        });

        // Validação ao sair do campo (melhor UX)
        DOM.cpfCnpj?.addEventListener("blur", validarCpfCnpjUI);

        // PRO modal
        Pro.setupProModal();

        // PWA
        registrarServiceWorker();
    });
})();
