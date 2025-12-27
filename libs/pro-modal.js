(() => {
    "use strict";

    // evita rodar setup 2x (problema clássico quando app.js duplica/cache)
    if (window.__MECPRICE_PRO_INIT__) return;
    window.__MECPRICE_PRO_INIT__ = true;

    function setupProModal() {
        const modal = document.getElementById("proModal");
        const btnOpen = document.getElementById("btnOpenPro");
        const btnClose = document.getElementById("btnClosePro");
        const msg = document.getElementById("proMsg");

        if (!modal) return;

        function open() {
            modal.hidden = false;
            modal.style.display = "grid";
            if (msg) msg.textContent = "";
        }

        function close() {
            modal.hidden = true;
            modal.style.display = "none";
        }

        // expõe para o onclick do HTML
        window.MecPrice = window.MecPrice || {};
        window.MecPrice.pro = { open, close, setupProModal };

        // garante estado inicial
        if (modal.hidden) modal.style.display = "none";

        // abrir
        btnOpen?.addEventListener("click", open);

        // fechar (direto no botão)
        btnClose?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
        });

        // fechar clicando fora (no fundo escuro)
        modal.addEventListener("click", (e) => {
            if (e.target === modal) close();
            const closeEl = e.target.closest("[data-close-pro]");
            if (closeEl) close();
        });

        // ESC fecha
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !modal.hidden) close();
        });
    }

    // compatível com seu app.js atual
    window.MecPrice = window.MecPrice || {};
    window.MecPrice.pro = window.MecPrice.pro || {};
    window.MecPrice.pro.setupProModal = setupProModal;
})();
