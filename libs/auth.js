(() => {
    "use strict";

    const supabase = window.MecPrice?.supabase;

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    }

    async function logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async function getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    async function initAuth() {
        const session = await getSession();
        if (session?.user) window.MecPrice.core.setPlan("pro");
        else window.MecPrice.core.setPlan("free");
    }

    window.MecPrice.auth = { login, logout, getSession, initAuth };
})();
