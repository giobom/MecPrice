(() => {
    "use strict";

    // Suas chaves do Firebase (Mantenha estas!)
    const firebaseConfig = {
        apiKey: "AIzaSyCCuqkCu9rlOEH_HnBnm9epDtJidZT3Bxk",
        authDomain: "mecprice-fc6c9.firebaseapp.com",
        projectId: "mecprice-fc6c9",
        storageBucket: "mecprice-fc6c9.firebasestorage.app",
        messagingSenderId: "736724336294",
        appId: "1:736724336294:web:7df481faf25a62cb5b3e67"
    };

    // Inicializa o Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // Ativa o modo offline do Firebase (Mágica para sinal ruim)
    db.enablePersistence().catch((err) => {
        console.warn("[Storage] Persistência offline falhou:", err.code);
    });

    const ORCAMENTO_KEY = "ultimoOrcamentoOficina";
    const ESTOQUE_KEY = "mecprice_estoque";

    /**
     * Pega dados do LocalStorage (Rápido)
     */
    function getJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    /**
     * Salva no LocalStorage E na Nuvem (Firebase)
     */
    function setJSON(key, value) {
        // 1. Salva local (para o app responder na hora)
        localStorage.setItem(key, JSON.stringify(value));

        // 2. Sincroniza com Firebase (em segundo plano)
        if (key === ESTOQUE_KEY) {
            sincronizarEstoqueNuvem(value);
        } else if (key === ORCAMENTO_KEY) {
            sincronizarOrcamentoNuvem(value);
        }
    }

    // --- LÓGICA DE NUVEM (FIRESTORE) ---

    async function sincronizarEstoqueNuvem(itens) {
        try {
            await db.collection("estoque").doc("principal").set({
                itens: itens,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("[Storage] Erro ao subir estoque:", e);
        }
    }

    async function sincronizarOrcamentoNuvem(orc) {
        if (!orc || !orc.cliente) return;
        try {
            // Usa o nome do cliente + data como ID ou um ID único do core
            const docId = orc.cliente.replace(/\s+/g, '_') + "_" + Date.now();
            await db.collection("orcamentos").doc(docId).set({
                ...orc,
                sincronizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("[Storage] Erro ao subir orçamento:", e);
        }
    }

    /**
     * Tenta baixar o estoque da nuvem se o local estiver vazio
     * (Útil para primeiro acesso ou novo aparelho)
     */
    async function baixarEstoqueDaNuvem() {
        try {
            const doc = await db.collection("estoque").doc("principal").get();
            if (doc.exists) {
                const dadosNuvem = doc.data().itens;
                localStorage.setItem(ESTOQUE_KEY, JSON.stringify(dadosNuvem));
                console.log("[Storage] Estoque recuperado da nuvem com sucesso.");
                return dadosNuvem;
            }
        } catch (e) {
            console.error("[Storage] Erro ao baixar estoque:", e);
        }
        return null;
    }

    // Exporta para o sistema
    window.MecPrice.storage = {
        ORCAMENTO_KEY,
        ESTOQUE_KEY,
        getJSON,
        setJSON,
        baixarEstoqueDaNuvem, // Nova função
        db // Acesso direto ao banco se precisar
    };
})();