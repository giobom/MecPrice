(() => {
    "use strict";

    const MecPrice = window.MecPrice;
    const DOM = MecPrice?.dom;
    const Estoque = MecPrice?.estoque;
    const Orc = MecPrice?.orcamento;
    const PDF = MecPrice?.pdf;
    const Pro = MecPrice?.pro;
    const Validators = MecPrice?.validators;

    function registrarServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js").catch((err) => {
                console.log("Erro ao registrar service worker:", err);
            });
        });
    }

    function setErroPrincipal(msg = "") {
        if (!DOM?.erroPrincipal) return;
        DOM.erroPrincipal.textContent = msg;
    }

    function validarCpfCnpjUI() {
        // ✅ correto: no dom.js é cpfCnpjInput (não cpfCnpj)
        const raw = DOM?.cpfCnpjInput?.value ?? "";

        if (!Validators?.validarCpfCnpj) return true; // não trava se validators não carregou

        const { ok } = Validators.validarCpfCnpj(raw);

        if (!ok) {
            setErroPrincipal("CPF/CNPJ inválido. Confira os números e tente novamente.");
            DOM?.cpfCnpjInput?.focus?.();
            return false;
        }

        setErroPrincipal("");
        return true;
    }

    // Fallback de abas (se tabs.js falhar)
    function setupTabsFallback() {
        const btns = document.querySelectorAll(".tab-btn");
        const panels = document.querySelectorAll(".tab-content");
        if (!btns.length || !panels.length) return;

        function ativar(tabId) {
            panels.forEach((p) => (p.hidden = p.id !== tabId));
            btns.forEach((b) => {
                const on = b.dataset.tab === tabId;
                b.classList.toggle("active", on);
                b.setAttribute("aria-selected", String(on));
            });
        }

        btns.forEach((btn) => {
            btn.setAttribute("role", "tab");
            btn.addEventListener("click", () => {
                const tabId = btn.dataset.tab;
                if (tabId) ativar(tabId);
            });
        });

        ativar(document.querySelector(".tab-btn.active")?.dataset.tab || "tab-orcamento");
    }

    document.addEventListener("DOMContentLoaded", () => {
        // Abas
        if (MecPrice?.tabs?.setupTabs) MecPrice.tabs.setupTabs();
        else setupTabsFallback();

        // Estoque
        Estoque?.carregarEstoque?.();
        Estoque?.renderEstoque?.();
        Estoque?.atualizarSugestoesEstoque?.();

        // Integração: autopreencher preço pelo estoque
        DOM?.nomePecaInput?.addEventListener?.("input", Estoque?.tentarAutoPreencherPreco);
        DOM?.nomePecaInput?.addEventListener?.("change", Estoque?.tentarAutoPreencherPreco);

        // Orçamento: delegations
        Orc?.setupRemoverPecaDelegation?.();
        Orc?.setupRemoverServicoDelegation?.();

        // Render inicial
        Orc?.atualizarTabelaPecas?.();
        Orc?.atualizarTabelaServicos?.();
        Orc?.verificarUltimoOrcamento?.();

        // Botões: peças e serviços
        DOM?.btnAdicionarPeca?.addEventListener?.("click", Orc?.adicionarPeca);
        DOM?.btnAddServico?.addEventListener?.("click", Orc?.adicionarServico);

        // Gerar / salvar / limpar
        DOM?.btnGerar?.addEventListener?.("click", () => {
            if (!validarCpfCnpjUI()) return;
            Orc?.gerarOrcamento?.();
        });

        DOM?.btnSalvar?.addEventListener?.("click", () => {
            if (!validarCpfCnpjUI()) return;
            Orc?.salvarOrcamento?.();
        });

        DOM?.btnLimpar?.addEventListener?.("click", () => {
            setErroPrincipal("");
            Orc?.limparTudo?.();
        });

        DOM?.btnCarregarUltimo?.addEventListener?.("click", Orc?.carregarUltimoOrcamento);

        // PDF
        DOM?.btnPDF?.addEventListener?.("click", PDF?.gerarPDF);

        // Estoque listeners
        DOM?.btnAddItem?.addEventListener?.("click", Estoque?.upsertEstoque);
        DOM?.btnExportEstoque?.addEventListener?.("click", Estoque?.exportarEstoqueJSON);

        DOM?.importEstoque?.addEventListener?.("change", (e) => {
            const file = e.target.files?.[0];
            if (file) Estoque?.importarEstoqueJSON?.(file);
        });

        // Delegation da tabela de estoque
        DOM?.tbodyEstoque?.addEventListener?.("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const idIn = btn.getAttribute("data-in");
            const idOut = btn.getAttribute("data-out");
            const idDel = btn.getAttribute("data-del");

            if (idIn) return Estoque?.ajustarQtdEstoque?.(idIn, +1);
            if (idOut) return Estoque?.ajustarQtdEstoque?.(idOut, -1);
            if (idDel) return Estoque?.removerItemEstoque?.(idDel);
        });

        // PRO modal + PWA
        Pro?.setupProModal?.();
        registrarServiceWorker();
    });
})();
