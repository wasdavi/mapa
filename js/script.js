
async function consultarDados() {
    const cpf = document.getElementById('cpf').value;
    
    if (!cpf) {
        alert('Por favor, digite um CPF válido.');
        return;
    }

    try {
        // Simulação da chamada ao Power Automate
        // Na implementação real, você usaria o conector do Power Automate
        const dados = await consultarDadosReal(cpf);
        
        if (dados) {
            document.getElementById('nome').value = dados.nome || '';
            document.getElementById('cargo').value = dados.cargo || '';
            
            // Preencher o combo de localização baseado no cargo
            if (dados.cargo) {
                const localizacoes = await simularConsultaLocalizacao(dados.cargo);
                const select = document.getElementById('localizacao');
                select.innerHTML = '<option value="">Selecione...</option>';
                
                localizacoes.forEach(local => {
                    const option = document.createElement('option');
                    option.value = local;
                    option.textContent = local;
                    select.appendChild(option);
                });
                
                select.disabled = false;
            }
        } else {
            alert('Nenhum dado encontrado para o CPF informado.');
        }
    } catch (error) {
        console.error('Erro ao consultar dados:', error);
        alert('Ocorreu um erro ao consultar os dados.');
    }
}


async function consultarDadosReal(cpf) {
    const response = await fetch("https://prod-14.brazilsouth.logic.azure.com:443/workflows/e03b2a2f15b149e483bf7910c1b05b32/triggers/manual/paths/invoke?api-version=2016-06-01", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf: cpf })
    });
    
    if (!response.ok) {
        throw new Error('Erro na consulta');
    }
    
    return await response.json();
}


async function simularConsultaLocalizacao(cargo) {
    // Simulação - na prática, você faria outra chamada ao Power Automate
    // para consultar a planilha LOCAL
    console.log(`Simulando consulta de localização para cargo: ${cargo}`);
    
    // Retorno simulado
    return ["Brasília/DF", "São Paulo/SP", "Rio de Janeiro/RJ"];
}



