
function mascaraCPF() {
    // Máscara de CPF automática
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function () {
        let valor = cpfInput.value.replace(/\D/g, '');
        valor = valor.slice(0, 11);

        if (valor.length > 9) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (valor.length > 6) {
            valor = valor.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
        } else if (valor.length > 3) {
            valor = valor.replace(/(\d{3})(\d+)/, '$1.$2');
        }

        cpfInput.value = valor;
    });
}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

function consultarListaResultado() {
    let cpf = document.getElementById("cpf").value.trim();

    // Remove pontuação e zeros à esquerda
    cpf = cpf.replace(/\D/g, '').replace(/^0+/, '');


    if (!cpf) {
        alert("Por favor, digite o CPF.");
        return;
    }

    const fluxoURL = 'https://prod-10.brazilsouth.logic.azure.com:443/workflows/ecbc7e73f207409597c6982ff99ece05/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=t6LHITg9L4-fSRnUgc6_0OtTk1nwdMAyTGwOqxJo10A'; // Substitua pelo URL do seu fluxo
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

                //const campoNome = document.getElementById('nome');
                //const campoCargo = document.getElementById('cargo');

                if (Array.isArray(resposta) && resposta.length > 0 && resposta[0].nome && resposta[0].cargo) {
                    alert("CPF já cadastrado.");
                    limparFormulario();
                } else {
                    consultarSolicitacao();
                }


            } catch (erro) {
                alert('Lista Resultado: Erro ao interpretar a resposta.');
                console.error("Erro no JSON.parse:", erro);
            }
        } else {
            alert('Lista Resultado: Erro na requisição ' + xhr.status);
        }
    };
    xhr.send(JSON.stringify(dados));
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx



function consultarSolicitacao() {
    let cpf = document.getElementById("cpf").value.trim();

    // Remove pontuação e zeros à esquerda
    cpf = cpf.replace(/\D/g, '').replace(/^0+/, '');


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
                    alert("CPF incorreto ou não se encotra na relação, favor procurar o RH.");
                }


            } catch (erro) {
                alert('Lista Dados: Erro ao interpretar a resposta.');
                console.error("Erro no JSON.parse:", erro);
            }
        } else {
            alert('Lista Dados: Erro na requisição ' + xhr.status);
        }
    };
    xhr.send(JSON.stringify(dados));
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


function buscarMunicipiosPorCargo(cargo) {
    const fluxoMunicipiosURL = 'https://prod-03.brazilsouth.logic.azure.com:443/workflows/1ed2c86b44394605bac7367483290604/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nE-C2B4C5_xK3RnSsqzFC0OveevSHM--oSoe6k9JAx4';

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
        document.getElementById('municipio5'),
        document.getElementById('municipio6'),
        document.getElementById('municipio7'),
        document.getElementById('municipio8'),
        document.getElementById('municipio9'),
        document.getElementById('municipio10'),
        document.getElementById('municipio11'),
        document.getElementById('municipio12'),
        document.getElementById('municipio13'),
        document.getElementById('municipio14'),
        document.getElementById('municipio15'),
        document.getElementById('municipio16'),
        document.getElementById('municipio17'),
        document.getElementById('municipio18'),
        document.getElementById('municipio19'),
        document.getElementById('municipio20'),
        document.getElementById('municipio21'),
        document.getElementById('municipio22'),
        document.getElementById('municipio23'),
        document.getElementById('municipio24'),
        document.getElementById('municipio25'),
        document.getElementById('municipio26'),
        document.getElementById('municipio27'),
        document.getElementById('municipio28'),
        document.getElementById('municipio29'),
        document.getElementById('municipio30'),
        document.getElementById('municipio31'),
        document.getElementById('municipio32'),
        document.getElementById('municipio33'),
        document.getElementById('municipio34'),
        document.getElementById('municipio35'),
        document.getElementById('municipio36'),
        document.getElementById('municipio37'),
        document.getElementById('municipio38'),
        document.getElementById('municipio39'),
        document.getElementById('municipio40'),
        document.getElementById('municipio41'),
        document.getElementById('municipio42'),
        document.getElementById('municipio43'),
        document.getElementById('municipio44'),
        document.getElementById('municipio45'),
        document.getElementById('municipio46'),
        document.getElementById('municipio47'),
        document.getElementById('municipio48'),
        document.getElementById('municipio49'),
        document.getElementById('municipio50'),
        document.getElementById('municipio51'),
        document.getElementById('municipio52'),
        document.getElementById('municipio53'),
        document.getElementById('municipio54'),
        document.getElementById('municipio55'),
        document.getElementById('municipio56'),
        document.getElementById('municipio57'),
        document.getElementById('municipio58'),
        document.getElementById('municipio59'),
        document.getElementById('municipio60'),
        document.getElementById('municipio61'),
        document.getElementById('municipio62'),
        document.getElementById('municipio63'),
        document.getElementById('municipio64'),
        document.getElementById('municipio65'),
        document.getElementById('municipio66'),
        document.getElementById('municipio67'),
        document.getElementById('municipio68'),
        document.getElementById('municipio69')
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
        document.getElementById('municipio5'),
        document.getElementById('municipio6'),
        document.getElementById('municipio7'),
        document.getElementById('municipio8'),
        document.getElementById('municipio9'),
        document.getElementById('municipio10'),
        document.getElementById('municipio11'),
        document.getElementById('municipio12'),
        document.getElementById('municipio13'),
        document.getElementById('municipio14'),
        document.getElementById('municipio15'),
        document.getElementById('municipio16'),
        document.getElementById('municipio17'),
        document.getElementById('municipio18'),
        document.getElementById('municipio19'),
        document.getElementById('municipio20'),
        document.getElementById('municipio21'),
        document.getElementById('municipio22'),
        document.getElementById('municipio23'),
        document.getElementById('municipio24'),
        document.getElementById('municipio25'),
        document.getElementById('municipio26'),
        document.getElementById('municipio27'),
        document.getElementById('municipio28'),
        document.getElementById('municipio29'),
        document.getElementById('municipio30'),
        document.getElementById('municipio31'),
        document.getElementById('municipio32'),
        document.getElementById('municipio33'),
        document.getElementById('municipio34'),
        document.getElementById('municipio35'),
        document.getElementById('municipio36'),
        document.getElementById('municipio37'),
        document.getElementById('municipio38'),
        document.getElementById('municipio39'),
        document.getElementById('municipio40'),
        document.getElementById('municipio41'),
        document.getElementById('municipio42'),
        document.getElementById('municipio43'),
        document.getElementById('municipio44'),
        document.getElementById('municipio45'),
        document.getElementById('municipio46'),
        document.getElementById('municipio47'),
        document.getElementById('municipio48'),
        document.getElementById('municipio49'),
        document.getElementById('municipio50'),
        document.getElementById('municipio51'),
        document.getElementById('municipio52'),
        document.getElementById('municipio53'),
        document.getElementById('municipio54'),
        document.getElementById('municipio55'),
        document.getElementById('municipio56'),
        document.getElementById('municipio57'),
        document.getElementById('municipio58'),
        document.getElementById('municipio59'),
        document.getElementById('municipio60'),
        document.getElementById('municipio61'),
        document.getElementById('municipio62'),
        document.getElementById('municipio63'),
        document.getElementById('municipio64'),
        document.getElementById('municipio65'),
        document.getElementById('municipio66'),
        document.getElementById('municipio67'),
        document.getElementById('municipio68'),
        document.getElementById('municipio69')
    ];
    selectsMunicipios.forEach(select => {
        select.disabled = true;
        select.value = '';
        select.innerHTML = '<option value="">Selecione um município</option>';
    });
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

function verificarMunicipiosDuplicados() {
    const municipios = [
        document.getElementById('municipio1').value,
        document.getElementById('municipio2').value,
        document.getElementById('municipio3').value,
        document.getElementById('municipio4').value,
        document.getElementById('municipio5').value,
        document.getElementById('municipio6').value,
        document.getElementById('municipio7').value,
        document.getElementById('municipio8').value,
        document.getElementById('municipio9').value,
        document.getElementById('municipio10').value,
        document.getElementById('municipio11').value,
        document.getElementById('municipio12').value,
        document.getElementById('municipio13').value,
        document.getElementById('municipio14').value,
        document.getElementById('municipio15').value,
        document.getElementById('municipio16').value,
        document.getElementById('municipio17').value,
        document.getElementById('municipio18').value,
        document.getElementById('municipio19').value,
        document.getElementById('municipio20').value,
        document.getElementById('municipio21').value,
        document.getElementById('municipio22').value,
        document.getElementById('municipio23').value,
        document.getElementById('municipio24').value,
        document.getElementById('municipio25').value,
        document.getElementById('municipio26').value,
        document.getElementById('municipio27').value,
        document.getElementById('municipio28').value,
        document.getElementById('municipio29').value,
        document.getElementById('municipio30').value,
        document.getElementById('municipio31').value,
        document.getElementById('municipio32').value,
        document.getElementById('municipio33').value,
        document.getElementById('municipio34').value,
        document.getElementById('municipio35').value,
        document.getElementById('municipio36').value,
        document.getElementById('municipio37').value,
        document.getElementById('municipio38').value,
        document.getElementById('municipio39').value,
        document.getElementById('municipio40').value,
        document.getElementById('municipio41').value,
        document.getElementById('municipio42').value,
        document.getElementById('municipio43').value,
        document.getElementById('municipio44').value,
        document.getElementById('municipio45').value,
        document.getElementById('municipio46').value,
        document.getElementById('municipio47').value,
        document.getElementById('municipio48').value,
        document.getElementById('municipio49').value,
        document.getElementById('municipio50').value,
        document.getElementById('municipio51').value,
        document.getElementById('municipio52').value,
        document.getElementById('municipio53').value,
        document.getElementById('municipio54').value,
        document.getElementById('municipio55').value,
        document.getElementById('municipio56').value,
        document.getElementById('municipio57').value,
        document.getElementById('municipio58').value,
        document.getElementById('municipio59').value,
        document.getElementById('municipio60').value,
        document.getElementById('municipio61').value,
        document.getElementById('municipio62').value,
        document.getElementById('municipio63').value,
        document.getElementById('municipio64').value,
        document.getElementById('municipio65').value,
        document.getElementById('municipio66').value,
        document.getElementById('municipio67').value,
        document.getElementById('municipio68').value,
        document.getElementById('municipio69').value
    ].filter(v => v !== '');

    const duplicados = new Set(municipios).size !== municipios.length;

    if (duplicados) {
        alert('Existem municípios duplicados. Por favor, altere ou não selecione".');
        return false;
    }

    return true;
}



//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
/*
let dadosParaSalvar = null;


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
    const webhookUrl = 'https://prod-01.brazilsouth.logic.azure.com:443/workflows/1fb9782709ea489f8118a7c5e6408497/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9ZFHCbVBb6WufeVspGOCEARPhsRlTz-umpMGruWualw'; 
    
    
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
       

    if (!verificarMunicipiosDuplicados()) return;

    // Armazenar dados antes da confirmação
    const cpf = document.getElementById('cpf').value;
    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const municipio1 = document.getElementById('municipio1').value;
    const municipio2 = document.getElementById('municipio2').value;
    const municipio3 = document.getElementById('municipio3').value;
    const municipio4 = document.getElementById('municipio4').value;
    const municipio5 = document.getElementById('municipio5').value;

    const cpfLimpo = cpf.replace(/\D/g, '').replace(/^0+/, '');

    if (!cpfLimpo || !nome || !cargo || !municipio1) {
        alert('Os campos CPF, Nome e Cargo devem estar preenchidos e, ao menos, a 1ª opção de município.');
        return;
    }

    dadosParaSalvar = {
        cpf: cpfLimpo,
        nome: nome,
        cargo: cargo,
        Municipio1: municipio1,
        Municipio2: municipio2,
        Municipio3: municipio3,
        Municipio4: municipio4,
        Municipio5: municipio5
    };

    // Mostrar modal
    document.getElementById('confirmModal').style.display = 'flex';

}

document.getElementById('btnSim').addEventListener('click', async function () {
    const webhookUrl = 'https://prod-01.brazilsouth.logic.azure.com:443/workflows/1fb9782709ea489f8118a7c5e6408497/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9ZFHCbVBb6WufeVspGOCEARPhsRlTz-umpMGruWualw'; 
    document.getElementById('confirmModal').style.display = 'none';

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaSalvar)
        });

        if (response.ok || response.status === 0) {
            alert('Dados cadastrados com sucesso!');
            limparFormulario();
        } else {
            alert('CPF já cadastrado.');
            limparFormulario();
        }
    } catch (error) {
        alert('Erro inesperado ao enviar os dados.');
        limparFormulario();
    }
});

document.getElementById('btnNao').addEventListener('click', function () {
    document.getElementById('confirmModal').style.display = 'none';
    dadosParaSalvar = null;
});
*/
