(() => {
    "use strict";

    const { AppContext, formatBRL, toNumber } = window.MecPrice.core;
    const DOM = window.MecPrice.dom;
    const Orc = window.MecPrice.orcamento;

    function gerarPDF() {
        if (AppContext.plan === "pro") return gerarPDFPro();
        return gerarPDFOrcamento();
    }

    function gerarPDFPro() {
        alert("PDF PRO ainda não implementado. (Depois: logo, dados da oficina, garantias.)");
    }

    function gerarPDFOrcamento() {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert("Biblioteca de PDF não carregou. Verifique se adicionou jsPDF no index.html.");
            return;
        }

        const cliente =
            (DOM.orcCliente?.textContent || "").trim() || (DOM.clienteInput?.value || "").trim();
        const servico =
            (DOM.orcDescricao?.textContent || "").trim() || (DOM.descricaoInput?.value || "").trim();
        const data = (DOM.orcData?.textContent || "").trim() || new Date().toLocaleDateString("pt-BR");

        const pecas = Orc.getPecas();
        const linhas = (pecas || []).map((p) => {
            const qtd = toNumber(p.qtd, 0);
            const unit = toNumber(p.valor, 0);
            const tot = qtd * unit;
            return [p.nome || "", String(qtd), formatBRL(unit), formatBRL(tot)];
        });

        const { totalPecas, maoDeObra, totalGeral } = Orc.calcularTotais();

        const doc = new jsPDF({ unit: "mm", format: "a4" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("MecPrice", 14, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Orçamento automotivo", 14, 25);

        doc.setFontSize(12);
        doc.text(`Cliente: ${cliente}`, 14, 35);
        doc.text(`Serviço: ${servico}`, 14, 42);
        doc.text(`Data: ${data}`, 14, 49);

        doc.setFont("helvetica", "bold");
        doc.text("Peças", 14, 60);

        doc.autoTable({
            startY: 64,
            head: [["Peça", "Qtd", "Unitário", "Total"]],
            body: linhas.length ? linhas : [["(nenhuma peça adicionada)", "-", "-", "-"]],
            styles: { font: "helvetica", fontSize: 10 },
            headStyles: { fillColor: [25, 35, 60] },
            margin: { left: 14, right: 14 },
        });

        const y = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Total de peças: ${formatBRL(totalPecas)}`, 14, y);
        doc.text(`Mão de obra: ${formatBRL(maoDeObra)}`, 14, y + 7);

        doc.setFont("helvetica", "bold");
        doc.text(`Total geral: ${formatBRL(totalGeral)}`, 14, y + 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("____________________________________", 14, y + 35);
        doc.text("Assinatura / Responsável", 14, y + 40);

        const safeCliente = (cliente || "cliente")
            .replace(/[^\w\s-]/g, "")
            .trim()
            .replace(/\s+/g, "_");

        doc.save(`MecPrice_Orcamento_${safeCliente}_${new Date().toISOString().slice(0, 10)}.pdf`);
    }

    window.MecPrice.pdf = { gerarPDF };
})();
