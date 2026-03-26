(() => {
    "use strict";

    const ORCAMENTO_KEY = "ultimoOrcamentoOficina";
    const ESTOQUE_KEY = "mecprice_estoque";

    function getJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function setJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    window.MecPrice.storage = {
        ORCAMENTO_KEY,
        ESTOQUE_KEY,
        getJSON,
        setJSON,
    };
})();
