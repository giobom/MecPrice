// libs/validators.js
(function () {
    function onlyDigits(v = "") {
        return String(v).replace(/\D+/g, "");
    }

    function isRepeated(v) {
        return /^(\d)\1+$/.test(v);
    }

    function validarCPF(v) {
        const cpf = onlyDigits(v);
        if (cpf.length !== 11 || isRepeated(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += cpf[i] * (10 - i);
        let d1 = 11 - (soma % 11);
        if (d1 >= 10) d1 = 0;
        if (d1 !== Number(cpf[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += cpf[i] * (11 - i);
        let d2 = 11 - (soma % 11);
        if (d2 >= 10) d2 = 0;

        return d2 === Number(cpf[10]);
    }

    function validarCNPJ(v) {
        const cnpj = onlyDigits(v);
        if (cnpj.length !== 14 || isRepeated(cnpj)) return false;

        const calc = (base) => {
            const pesos =
                base.length === 12
                    ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
                    : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

            let soma = 0;
            for (let i = 0; i < pesos.length; i++) {
                soma += base[i] * pesos[i];
            }
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        const d1 = calc(cnpj.slice(0, 12));
        const d2 = calc(cnpj.slice(0, 13));

        return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
    }

    function validarCpfCnpj(valor) {
        const v = onlyDigits(valor);
        if (!v) return { ok: true }; // opcional
        if (v.length === 11) return { ok: validarCPF(v) };
        if (v.length === 14) return { ok: validarCNPJ(v) };
        return { ok: false };
    }

    window.MecPrice = window.MecPrice || {};
    window.MecPrice.validators = { validarCpfCnpj };
})();
