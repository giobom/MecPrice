(() => {
    "use strict";

    function setupProModal() {
        const btnOpen = document.getElementById("btnOpenPro");
        const modal = document.getElementById("proModal");
        const btnClose = document.getElementById("btnClosePro");
        const msg = document.getElementById("proMsg");

        if (!modal) {
            console.warn("[PRO] proModal não encontrado");
            return;
        }

        const Auth = () => window.MecPrice?.auth;
        const Core = () => window.MecPrice?.core;

        function open() {
            modal.hidden = false;
            modal.style.display = "grid";
            if (msg) msg.textContent = "";
        }

        function close() {
            modal.hidden = true;
            modal.style.display = "none";
        }

        // Abrir
        btnOpen?.addEventListener("click", open);

        // Fechar botão
        btnClose?.addEventListener("click", (e) => {
            e.preventDefault();
            close();
        });

        // Fechar clicando fora
        modal.addEventListener("click", (e) => {
            if (e.target === modal) close();
        });

        // ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !modal.hidden) close();
        });

        // LOGIN
        document.getElementById("btnProLogin")?.addEventListener("click", async () => {
            const email = document.getElementById("proEmail")?.value?.trim();
            const senha = document.getElementById("proSenha")?.value;

            if (msg) msg.textContent = "Entrando...";

            try {
                if (!email || !senha) throw new Error("Preencha e-mail e senha.");
                if (!Auth()) throw new Error("Auth não inicializado.");

                await Auth().login(email, senha);

                // 🔐 quem decide o plano agora é a sessão
                Core()?.setPlan("pro");

                if (msg) msg.textContent = "✅ Login realizado!";
                setTimeout(close, 600);
            } catch (err) {
                if (msg) msg.textContent = "❌ " + (err.message || "Erro no login");
            }
        });

        // Assinar
        document.getElementById("btnProAssinar")?.addEventListener("click", () => {
            if (msg) msg.textContent = "Assinatura PRO será implementada em breve.";
        });

        // Estado inicial
        modal.hidden = true;
        modal.style.display = "non:contentReference[oaicite:0]{index=0}
