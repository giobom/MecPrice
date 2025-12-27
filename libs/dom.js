(() => {
    "use strict";

    const DOM = window.MecPrice?.dom;
    const Tabs = window.MecPrice?.tabs;
    const Estoque = window.MecPrice?.estoque;
    const Orc = window.MecPrice?.orcamento;
    const PDF = window.MecPrice?.pdf;
    const Pro = window.MecPrice?.pro;

    function registrarServiceWorker() {
        if (!("serviceWorker" in navigator)) return;

        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("./service-worker.js")
                .catch((err) => console.log("Erro ao registrar service worker:", err));
        });
    }

    async function inicializarAuth() {
        try {
            // initAuth (se existir) ajusta FREE/PRO ao carregar a página
            await window.MecPrice?.auth?.initAuth?.();

            // Se tiver Supabase, escuta mudança de login/logout
            const supabase = window.MecPrice?.supabase;
            if (supabase?.auth?.onAuthStateChange) {
                supabase.auth.onAuthStateChange((_event, session) => {
                    const plan = session?.user ? "pro" : "free";
                    window.MecPrice?.core?.setPlan?.(plan);
                });
            }
        } catch (e) {
            console.log("Auth init erro:", e);
        }
    }

    document.addEventListener("DOMContentLoaded", async () => {
        // Tabs
        Tabs?.setupTabs?.();

        // Estoque
        Estoque?.carregarEstoque?.();
        Estoque?.renderEstoque?.();
        Estoque?.atualizarSugestoesEstoque?.();

        // Integração: autopreencher preço pelo estoque
        DOM?.nomePecaInput?.addEventListener("input", Estoque?.tentarAutoPreencherPreco);
        DOM?.nomePecaInput?.addEventListener("change", Estoque?.tentarAutoPreencherPreco);

        // Orçamento
        Orc?.setupRemoverPecaDelegation?.();
        Orc?.verificarUltimoOrcamento?.();
        Orc?.atualizarTabelaPecas?.();

        // Botões orçamento
        DOM?.btnAdicionarPeca?.addEventListener("click", Orc?.adicionarPeca);
        DOM?.btnGerar?.addEventListener("click", Orc?.gerarOrcamento);
        DOM?.btnSalvar?.addEventListener("click", Orc?.salvarOrcamento);
        DOM?.btnLimpar?.addEventListener("click", Orc?.limparTudo);
        DOM?.btnCarregarUltimo?.addEventListener("click", Orc?.carregarUltimoOrcamento);

        // PDF
        DOM?.btnPDF?.addEventListener("click", PDF?.gerarPDF);

        // Estoque listeners
        DOM?.btnAddItem?.addEventListener("click", Estoque?.upsertEstoque);
        DOM?.btnExportEstoque?.addEventListener("click", Estoque?.exportarEstoqueJSON);
        DOM?.importEstoque?.addEventListener("change", (e) => {
            const file = e.target.files?.[0];
            if (file) Estoque?.importarEstoqueJSON?.(file);
        });

        // Estoque - delegation
        DOM?.tbodyEstoque?.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const idEdit = btn.getAttribute("data-edit");
            const idIn = btn.getAttribute("data-in");
            const idOut = btn.getAttribute("data-out");
            const idDel = btn.getAttribute("data-del");

            if (idEdit) return Estoque?.preencherFormularioEstoque?.(idEdit);
            if (idIn) return Estoque?.ajustarQtdEstoque?.(idIn, +1);
            if (idOut) return Estoque?.ajustarQtdEstoque?.(idOut, -1);
            if (idDel) return Estoque?.removerItemEstoque?.(idDel);
        });

        // PRO modal
        Pro?.setupProModal?.();

        // ✅ Auth (FREE/PRO)
        await inicializarAuth();

        // PWA
        registrarServiceWorker();
    });
})();
