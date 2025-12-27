(() => {
    const SUPABASE_URL = "https://dqnfsvjuvpvqzzkobroc.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_WPBa6h_ApFk_Li6as1AYHA_ZPWWWf2d";

    const supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    window.MecPrice = window.MecPrice || {};
    window.MecPrice.supabase = supabase;
})();
