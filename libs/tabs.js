(() => {
    "use strict";

    function setupTabs() {
        const buttons = Array.from(document.querySelectorAll(".tab-btn"));
        const contents = Array.from(document.querySelectorAll(".tab-content"));
        if (!buttons.length || !contents.length) return;

        function show(tabId) {
            contents.forEach((c) => (c.hidden = c.id !== tabId));
            buttons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
        }

        buttons.forEach((btn) => btn.addEventListener("click", () => show(btn.dataset.tab)));

        const initial =
            buttons.find((b) => b.classList.contains("active"))?.dataset.tab || contents[0].id;
        show(initial);
    }

    window.MecPrice.tabs = { setupTabs };
})();
