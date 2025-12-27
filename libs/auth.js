(() => {
    "use strict";

    const supabase = window.MecPrice.supabase;

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
    }

    async function logout() {
        await supabase.auth.signOut();
    }

    async function getSession() {
        const { data } = await supabase.auth.getSession();
        return data.session;
    }

    window.MecPrice.auth = { login, logout, getSession };
})();
