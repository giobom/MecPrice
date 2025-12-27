(() => {
    "use strict";

    window.MecPrice = window.MecPrice || {};

    const AppContext = {
        plan: "free", // "free" | "pro"
        user: null,
    };

    function setPlan(plan) {
        AppContext.plan = plan === "pro" ? "pro" : "free";
        const badge = document.getElementById("planBadge");
        if (badge) badge.textContent = AppContext.plan.toUpperCase();
    }

    function formatBRL(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function toNumber(v, fallback = 0) {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    }

    function uid() {
        return crypto?.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()) + Math.random().toString(16).slice(2);
    }

    function normalize(s) {
        return (s || "").toString().trim().toLowerCase();
    }

    window.MecPrice.core = {
        AppContext,
        setPlan,
        formatBRL,
        toNumber,
        uid,
        normalize,
    };
})();

