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

        // importante: o arquivo PRECISA existir no mesmo nível do index.html
        // (ex: /MecPrice/service-worker.js no GitHub Pages)
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("service-worker.js")
                .catch((err) => console.log("Erro ao registrar service worker:", err));
        });
    }

    function setErroPrincipal(msg = "") {
        if (!DOM?.erroPrincipal) return;
        DOM.erroPrincipal.textContent = msg;
    }

    function validarCpfCnpjUI() {
        const raw = DOM?.cpfCnpj?.value ?? "";

        // Se validators não carregou, não trava o app
        if (!Validators?.validarCpfCnpj) {
            console.warn("[MecPrice] validators.js não carregado (MecPrice.validators ausente).");
            return true;
        }

        const { ok } = Validators.validarCpfCnpj(raw);

        if (!ok) {
            setErroPrincipal("CPF/CNPJ inválido. Confira os números e tente novamente.");
            DOM?.cpfCnpj?.focus?.();
            return false;
        }

        setErroPrincipal("");
        return true;
    }

    // ✅ Fallback: abas funcionam mesmo se libs/tabs.js falhar
    function setupTabsFallback() {
        const btns = document.querySelectorAll(".tab-btn");
        const panels = document.querySelectorAll(".tab-content");
        if (!btns.length || !panels.length) return;

        function ativar(tabId) {
            panels.forEach((p) => {
                p.hidden = p.id !== tabId;
            });

            btns.forEach((b) => {
                const isActive = b.dataset.tab === tabId;
                b.classList.toggle("active", isActive);
                b.setAttribute("aria-selected", String(isActive));
            });
        }

        btns.forEach((btn) => {
            btn.setAttribute("role", "tab");
            btn.addEventListener("click", () => {
                const tabId = btn.dataset.tab;
                if (tabId) ativar(tabId);
            });
        });

        // inicial
        const initial = document.querySelector(".tab-btn.active")?.dataset.tab || "tab-orcamento";
        ativar(initial);
    }

    document.addEventListener("DOMContentLoaded", () => {
        // Abas: tenta o módulo, se não existir usa fallback
        if (MecPrice?.tabs?.setupTabs) MecPrice.tabs.setupTabs();
        else setupTabsFallback();

        // Estoque
        Estoque?.carregarEstoque?.();
        Estoque?.renderEstoque?.();
        Estoque?.atualizarSugestoesEstoque?.();

        // Integração: autopreencher preço pelo estoque
        DOM?.nomePecaInput?.addEventListener?.("input", Estoque?.tentarAutoPreencherPreco);
        DOM?.nomePecaInput?.addEventListener?.("change", Estoque?.tentarAutoPreencherPreco);

        // Orçamento
        Orc?.setupRemoverPecaDelegation?.();
        Orc?.verificarUltimoOrcamento?.();
        Orc?.atualizarTabelaPecas?.();

        // Botões orçamento (com validação CPF/CNPJ)
        DOM?.btnAdicionarPeca?.addEventListener?.("click", Orc?.adicionarPeca);

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

        // Estoque - delegation (ações da tabela)
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

        // PRO modal
        Pro?.setupProModal?.();

        // PWA
        registrarServiceWorker();
    });
})();
