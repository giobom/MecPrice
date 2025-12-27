(() => {
    "use strict";

    const { setPlan } = window.MecPrice.core;

    function setupProModal() {
        const btnOpen = document.getElementById("btnOpenPro");
        const modal = document.getElementById("proModal");
        const btnClose = document.getElementById("btnClosePro");

        const btnLogin = document.getElementById("btnProLogin");
        const btnAssinar = document.getElementById("btnProAssinar");
        const msg = document.getElementById("proMsg");

        function open() {
            if (!modal) return;
            modal.hidden = false;
            if (msg) msg.textContent = "";
        }

        function close() {
            if (!modal) return;
            modal.hidden = true;
        }

        btnOpen?.addEventListener("click", open);
        btnClose?.addEventListener("click", close);

        modal?.addEventListener("click", (e) => {
            if (e.target === modal) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal && !modal.hidden) close();
        });

        btnLogin?.addEventListener("click", () => {
            if (msg) msg.textContent = "Login PRO ainda não implementado.";
            // Exemplo futuro: setPlan("pro");
        });

        btnAssinar?.addEventListener("click", () => {
            if (msg) msg.textContent = "Assinatura PRO ainda não implementada.";
        });

        // plano inicial
        setPlan("free");
    }

    window.MecPrice.pro = { setupProModal };
})();
