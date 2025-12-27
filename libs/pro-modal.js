(() => {
    "use strict";

    const { setPlan } = window.MecPrice.core;

    function setupProModal() {
        const btnOpen = document.getElementById("btnOpenPro");
        const modal = document.getElementById("proModal");
        const msg = document.getElementById("proMsg");

        if (!btnOpen) console.warn("[PRO] Não achei #btnOpenPro");
        if (!modal) console.warn("[PRO] Não achei #proModal");

        if (!modal) return;

        function open() {
            modal.hidden = false;
            if (msg) msg.textContent = "";
        }

        function close() {
            modal.hidden = true;
        }

        // Abrir
        btnOpen?.addEventListener("click", open);

        // ✅ Fechar (funciona por id OU por data-atributo)
        modal.addEventListener("click", (e) => {
            if (e.target === modal) return close(); // clicou no fundo

            const closeBtn = e.target.closest("#btnClosePro, [data-close-pro]");
            if (closeBtn) return close();
        });

        // ESC fecha
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !modal.hidden) close();
        });

        // Placeholder (não atrapalha o fechar)
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
