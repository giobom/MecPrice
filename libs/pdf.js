(() => {
    "use strict";

    function safeText(v) {
        return (v ?? "").toString().trim();
    }

    function onlySafeFilename(text) {
        return safeText(text)
            .replace(/[\\/:*?"<>|]+/g, "-")
            .replace(/\s+/g, "_")
            .slice(0, 60);
    }

    function getJsPDF() {
        // jsPDF UMD costuma vir em window.jspdf.jsPDF
        if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
        // fallback raro
        if (window.jsPDF) return window.jsPDF;
        return null;
    }

    function asBRL(value) {
        // tenta usar o core, se existir
        const core = window.MecPrice?.core;
        if (core?.formatBRL) return core.formatBRL(value);

        const n = Number(value);
        const ok = Number.isFinite(n) ? n : 0;
        return ok.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function gerarPDF() {
        const MecPrice = window.MecPrice;
        const DOM = MecPrice?.dom;
        const Orc = MecPrice?.orcamento;

        const JsPDF = getJsPDF();
        if (!JsPDF) {
            alert("jsPDF não carregou. Verifique se libs/jspdf.umd.min.js está sendo carregado.");
            return;
        }

        // Garante que o orçamento esteja gerado/validado
        if (Orc?.validarDadosPrincipais && !Orc.validarDadosPrincipais()) return;
        // Se o card estiver escondido, tenta gerar antes
        if (DOM?.cardOrcamento?.hidden && Orc?.gerarOrcamento) Orc.gerarOrcamento();

        const doc = new JsPDF({ unit: "pt", format: "a4" });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;

        const cliente = safeText(DOM?.clienteInput?.value);
        const telefone = safeText(DOM?.telefoneInput?.value);
        const cpfCnpj = safeText(DOM?.cpfCnpjInput?.value);
        const placa = safeText(DOM?.placaInput?.value);
        const modelo = safeText(DOM?.modeloInput?.value);
        const ano = safeText(DOM?.anoInput?.value);
        const km = safeText(DOM?.kmInput?.value);
        const obs = safeText(DOM?.descricaoInput?.value);

        const servicos = (Orc?.getServicos?.() || []).map((s) => ({
            nome: safeText(s.nome),
            qtd: Number(s.qtd) || 0,
            valor: Number(s.valor) || 0,
            total: (Number(s.qtd) || 0) * (Number(s.valor) || 0),
        }));

        const pecas = (Orc?.getPecas?.() || []).map((p) => ({
            nome: safeText(p.nome),
            qtd: Number(p.qtd) || 0,
            valor: Number(p.valor) || 0,
            total: (Number(p.qtd) || 0) * (Number(p.valor) || 0),
        }));

        const totals = Orc?.calcularTotais?.()
            ? Orc.calcularTotais()
            : {
                totalPecas: pecas.reduce((a, p) => a + p.total, 0),
                totalServicos: servicos.reduce((a, s) => a + s.total, 0),
                totalGeral:
                    pecas.reduce((a, p) => a + p.total, 0) +
                    servicos.reduce((a, s) => a + s.total, 0),
            };

        // ===== Cabeçalho
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("MecPrice — Orçamento", margin, 55);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const dataHoje = new Date().toLocaleDateString("pt-BR");
        doc.text(`Data: ${dataHoje}`, pageWidth - margin, 55, { align: "right" });

        // ===== Bloco dados
        let y = 85;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Dados do Cliente", margin, y);
        y += 16;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const linhas = [
            `Cliente: ${cliente || "-"}`,
            `Telefone: ${telefone || "-"}`,
            `CPF/CNPJ: ${cpfCnpj || "-"}`,
            `Veículo: ${modelo || "-"}`,
            `Placa: ${placa || "-"}`,
            `Ano: ${ano || "-"}`,
            `KM: ${km || "-"}`,
        ];

        linhas.forEach((line) => {
            doc.text(line, margin, y);
            y += 14;
        });

        y += 4;
        doc.setFont("helvetica", "bold");
        doc.text("Observações", margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        const obsText = obs || "-";
        const obsWrapped = doc.splitTextToSize(obsText, pageWidth - margin * 2);
        doc.text(obsWrapped, margin, y);
        y += obsWrapped.length * 12 + 10;

        // ===== Serviços (Tabela)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Serviços", margin, y);
        y += 10;

        if (doc.autoTable) {
            doc.autoTable({
                startY: y,
                head: [["Serviço", "Qtd", "Unitário", "Total"]],
                body: servicos.length
                    ? servicos.map((s) => [
                        s.nome || "-",
                        String(s.qtd || 0),
                        asBRL(s.valor),
                        asBRL(s.total),
                    ])
                    : [["(Sem serviços)", "-", "-", "-"]],
                styles: { font: "helvetica", fontSize: 9 },
                headStyles: { fontStyle: "bold" },
                theme: "grid",
                margin: { left: margin, right: margin },
                columnStyles: {
                    0: { cellWidth: 260 },
                    1: { halign: "right", cellWidth: 45 },
                    2: { halign: "right", cellWidth: 90 },
                    3: { halign: "right", cellWidth: 90 },
                },
            });

            y = doc.lastAutoTable.finalY + 18;

            // ===== Peças (Tabela)
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("Peças", margin, y);
            y += 10;

            doc.autoTable({
                startY: y,
                head: [["Peça", "Qtd", "Unitário", "Total"]],
                body: pecas.length
                    ? pecas.map((p) => [
                        p.nome || "-",
                        String(p.qtd || 0),
                        asBRL(p.valor),
                        asBRL(p.total),
                    ])
                    : [["(Sem peças)", "-", "-", "-"]],
                styles: { font: "helvetica", fontSize: 9 },
                headStyles: { fontStyle: "bold" },
                theme: "grid",
                margin: { left: margin, right: margin },
                columnStyles: {
                    0: { cellWidth: 260 },
                    1: { halign: "right", cellWidth: 45 },
                    2: { halign: "right", cellWidth: 90 },
                    3: { halign: "right", cellWidth: 90 },
                },
            });

            y = doc.lastAutoTable.finalY + 18;
        } else {
            // fallback se o autotable não carregou
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("(AutoTable não carregou. Verifique libs/jspdf.plugin.autotable.min.js)", margin, y);
            y += 20;
        }

        // ===== Totais
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Totais", margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        doc.text(`Total serviços: ${asBRL(totals.totalServicos)}`, margin, y);
        y += 14;
        doc.text(`Total peças: ${asBRL(totals.totalPecas)}`, margin, y);
        y += 14;

        doc.setFont("helvetica", "bold");
        doc.text(`Total geral: ${asBRL(totals.totalGeral)}`, margin, y);

        // ===== Salvar
        const nomeArquivo = `Orcamento_${onlySafeFilename(cliente || "cliente")}_${dataHoje.replace(/\//g, "-")}.pdf`;
        doc.save(nomeArquivo);
    }

    window.MecPrice = window.MecPrice || {};
    window.MecPrice.pdf = { gerarPDF };
})();
