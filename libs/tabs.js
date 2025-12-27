(function (w) {
    const { Dom } = w.MecPrice;

    function init() {
        const root = Dom.$("[data-tabs]");
        if (!root) return;

        Dom.delegate(root, "click", "[data-tab]", (e, btn) => {
            e.preventDefault();
            const tab = btn.getAttribute("data-tab");
            if (!tab) return;

            Dom.$$("[data-tab]", root).forEach(b => b.classList.toggle("active", b === btn));
            Dom.$$("[data-pane]").forEach(p => p.classList.toggle("active", p.getAttribute("data-pane") === tab));
        });
    }

    w.MecPrice = w.MecPrice || {};
    w.MecPrice.Tabs = { init };
})(window);
