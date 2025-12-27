(() => {
    "use strict";

    const { setPlan } = window.MecPrice.core;

    function setupProModal() {
        const btnOpen = document.getElementById("btnOpenPro");
        const modal = document.getElementById("proModal");
        const msg = document.getElementById("proMsg");

        if (!modal) return;

        function open() {
            modal.hidden = false;
            if (msg) msg.textContent = "";
        }

        function close() {
            modal.hidden = true;
        }

        // abrir
        btnOpen?.addEventListener("click", open);

        // ✅ fechar por delegation (id OU data-close-pro) e fechar clicando fora
        modal.addEventListener("click", (e) => {
            if (e.target === modal) return close(); // clicou no fundo

            const closeBtn = e.target.closest("#btnClosePro, [data-close-pro]");
            if (closeBtn) return close();
        });

        // ESC fecha
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !modal.hidden) close();
        });

        // placeholders
        document.getElementById("btnProLogin")?.addEventListener("click", () => {
            if (msg) msg.textContent = "Login PRO ainda não implementado.";
        });
        document.getElementById("btnProAssinar")?.addEventListener("click", () => {
            if (msg) msg.textContent = "Assinatura PRO ainda não implementada.";
        });

        setPlan("free");
    }

    window.MecPrice.pro = { setupProModal };
})();
