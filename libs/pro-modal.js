(() => {
    "use strict";

    const { setPlan } = window.MecPrice.core;

    function setupProModal() {
        const btnOpen = document.getElementById("btnOpenPro");
        const modal = document.getElementById("proModal");
        const btnClose = document.getElementById("btnClosePro");
        const msg = document.getElementById("proMsg");

        if (!modal) {
            console.warn("[PRO] proModal não encontrado");
            return;
        }

        function open() {
            modal.hidden = false;
            modal.style.display = "grid";   // ✅ força exibir mesmo com CSS
            if (msg) msg.textContent = "";
            // debug:
            // console.log("[PRO] aberto");
        }

        function close() {
            modal.hidden = true;
            modal.style.display = "none";   // ✅ força esconder mesmo com CSS/cache
            // debug:
            // console.log("[PRO] fechado");
        }

        // Abrir
        btnOpen?.addEventListener("click", open);

        // ✅ Fechar direto no botão (mais confiável)
        btnClose?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
        });

        // ✅ Fechar por delegation (caso o botão mude / clique em filho)
        modal.addEventListener("click", (e) => {
            // clicou no fundo (overlay)
            if (e.target === modal) return close();

            const closeEl = e.target.closest("#btnClosePro, [data-close-pro]");
            if (closeEl) return close();
        });

        // ESC fecha
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !modal.hidden) close();
        });

        // Placeholders
        document.getElementById("btnProLogin")?.addEventListener("click", () => {
            if (msg) msg.textContent = "Login PRO ainda não implementado.";
        });

        document.getElementById("btnProAssinar")?.addEventListener("click", () => {
            if (msg) msg.textContent = "Assinatura PRO ainda não implementada.";
        });

        setPlan("free");

        // ✅ garante estado inicial fechado visualmente
        if (modal.hidden) modal.style.display = "none";
    }

    window.MecPrice.pro = { setupProModal };
})();
