

function consultarSolicitacao() {
    const cpf = document.getElementById("cpf").value;

    if (!cpf) {
        alert("Por favor, digite o CPF.");
        return;
    }

    const fluxoURL = 'https://prod-28.brazilsouth.logic.azure.com:443/workflows/ae14ab79dc264f8c9afb314f85b65660/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2xiyOniaPqJwgoVg9O545JnDV99OjKtNgbBzTu8keEM'; // Substitua pelo URL do seu fluxo
    const dados = { cpf: cpf };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', fluxoURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const respostaTexto = xhr.responseText;
                console.log("Resposta bruta:", respostaTexto);
                const resposta = JSON.parse(respostaTexto);

                const campoNome = document.getElementById('nome');
                const campoCargo = document.getElementById('cargo');

                if (Array.isArray(resposta) && resposta.length > 0 && resposta[0].nome && resposta[0].cargo) {
                    const nome = resposta[0].nome;
                    campoNome.value = nome;
                    const cargo = resposta[0].cargo;
                    campoCargo.value = cargo;

                    buscarMunicipiosPorCargo(cargo);

                } else {
                    // campoNome.value = "Nome não encontrado";
                    // campoCargo.value = "Cargo não encontrado";
                    alert("CPF incorreto ou não se encotra na relação, favor procurar o RH.");
                }


            } catch (erro) {
                alert('Erro ao interpretar a resposta.');
                console.error("Erro no JSON.parse:", erro);
            }
        } else {
            alert('Erro na requisição: ' + xhr.status);
        }
    };
    xhr.send(JSON.stringify(dados));
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


function buscarMunicipiosPorCargo(cargo) {
    const fluxoMunicipiosURL = 'https://prod-03.brazilsouth.logic.azure.com:443/workflows/1ed2c86b44394605bac7367483290604/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nE-C2B4C5_xK3RnSsqzFC0OveevSHM--oSoe6k9JAx4'; // Substitua pelo URL real do segundo fluxo

    const dados = { cargo: cargo };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', fluxoMunicipiosURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const respostaTexto = xhr.responseText;
                console.log("Resposta de municípios:", respostaTexto);

                const resposta = JSON.parse(respostaTexto);

                // Extrair a lista a partir de array de objetos
                if (Array.isArray(resposta)) {
                    // Mapear os valores da chave "municipios"
                    const lista = resposta.map(item => item.municipios).filter(Boolean);
                    popularMunicipios(lista);
                } else {
                    alert("Ocorreu um erro na tabela de cargos e municípios.");
                }

            } catch (erro) {
                alert('Erro ao interpretar a resposta dos municípios.');
                console.error("Erro no JSON.parse (municípios):", erro);
            }
        } else {
            alert('Erro ao consultar municípios: ' + xhr.status);
        }
    };
    xhr.send(JSON.stringify(dados));
}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


function popularMunicipios(listaMunicipios) {
    const selects = [
        document.getElementById('municipio1'),
        document.getElementById('municipio2'),
        document.getElementById('municipio3'),
        document.getElementById('municipio4'),
        document.getElementById('municipio5')
    ];

    selects.forEach((select, index) => {
        // Habilita o select (caso estivesse desativado)
        select.disabled = false;

        // Limpa opções anteriores
        select.innerHTML = '';

        // Adiciona a opção inicial
        const opcaoPadrao = document.createElement('option');
        opcaoPadrao.value = '';
        opcaoPadrao.textContent = 'Selecione um município';
        select.appendChild(opcaoPadrao);

        // Adiciona os municípios na lista
        listaMunicipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio;
            option.textContent = municipio;
            select.appendChild(option);
        });
    });
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


function limparFormulario() {
    document.getElementById('cpf').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('cargo').value = '';
    document.getElementById('email').value = '';
    desabilitarMunicipios();
}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


function desabilitarMunicipios() {
    const selectsMunicipios = [
        document.getElementById('municipio1'),
        document.getElementById('municipio2'),
        document.getElementById('municipio3'),
        document.getElementById('municipio4'),
        document.getElementById('municipio5')
    ];
    selectsMunicipios.forEach(select => {
        select.disabled = true;
        select.value = '';
        select.innerHTML = '<option value="">Selecione um município</option>';
    });
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


async function salvarDadosParaPowerAutomate() {
    const cpf = document.getElementById('cpf').value;
    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const email = document.getElementById('email').value.trim();
    const municipio1Valor = document.getElementById('municipio1').value;
    const municipio2Valor = document.getElementById('municipio2').value;
    const municipio3Valor = document.getElementById('municipio3').value;
    const municipio4Valor = document.getElementById('municipio4').value;
    const municipio5Valor = document.getElementById('municipio5').value;
    const webhookUrl = 'https://prod-01.brazilsouth.logic.azure.com:443/workflows/1fb9782709ea489f8118a7c5e6408497/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9ZFHCbVBb6WufeVspGOCEARPhsRlTz-umpMGruWualw'; // **SUBSTITUA PELA URL DO SEU WEBHOOK**


    const verificaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!verificaEmail.test(email)) {
        alert("Por favor, digite um e-mail válido.");
        return;
    }
    
    if (!cpf || !nome || !cargo || !email || !municipio1Valor) {
        alert('Os campos CPF, Nome, Cargo e E-mail devem estar preenchidos e, ao menos, a 1ª opção de município deve ser preenchida.');
        return;
    }

    const data = {
        cpf: cpf,
        nome: nome,
        cargo: cargo,
        email: email,
        Municipio1: municipio1Valor,
        Municipio2: municipio2Valor,
        Municipio3: municipio3Valor,
        Municipio4: municipio4Valor,
        Municipio5: municipio5Valor
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok || response.status === 0) {
            alert('Dados cadastrados com sucesso!');
            limparFormulario();
        } else {
            const responseData = await response.json(); // Tenta obter detalhes do erro, se disponíveis
            console.error('Erro ao enviar dados:', response.status, responseData);
            //alert(`Erro ao enviar dados: Status ${response.status}`);
            alert('CPF já cadastrado.');
            limparFormulario();
        }
    } catch (error) {
        console.error('Erro inesperado ao enviar:', error);
        alert('Ocorreu um erro inesperado ao enviar os dados.');
        limparFormulario();
    }
}


