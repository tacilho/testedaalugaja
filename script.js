document.addEventListener("DOMContentLoaded", () => {
    const cepInput = document.getElementById("cep");
    const ruaInput = document.getElementById("rua");
    const bairroInput = document.getElementById("bairro");
    const cidadeInput = document.getElementById("cidade");
    const estadoInput = document.getElementById("estado");
    const cpfInput = document.getElementById("cpf");
    const rgInput = document.getElementById("rg");
    const cnhInput = document.getElementById("cnh");
    const fotoInput = document.getElementById("foto");  // Campo de foto
    const form = document.getElementById('clienteForm');
    const saveAndBackButton = document.getElementById("save-and-back-button"); // Botão "Salvar e Voltar"

    // API de CEP
    cepInput.addEventListener("blur", () => {
        const cep = cepInput.value.replace(/\D/g, '');  // Remove caracteres não numéricos
        
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (!data.erro) {
                        ruaInput.value = data.logradouro || '';
                        bairroInput.value = data.bairro || '';
                        cidadeInput.value = data.localidade || '';
                        estadoInput.value = data.uf || '';
                    } else {
                        alert('CEP não encontrado.');
                        clearAddressFields();
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar o CEP:', error);
                    alert('Erro ao buscar o CEP.');
                });
        } else {
            alert('CEP inválido.');
            clearAddressFields();
        }
    });

    function clearAddressFields() {
        ruaInput.value = '';
        bairroInput.value = '';
        cidadeInput.value = '';
        estadoInput.value = '';
    }

    // Formatação de CPF, RG e CNH
    cpfInput.addEventListener('input', function() {
        this.value = formatarCPF(this.value);
    });

    rgInput.addEventListener('input', function() {
        this.value = formatarRG(this.value);
    });

    cnhInput.addEventListener('input', function() {
        this.value = formatarCNH(this.value);
    });

    function formatarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length > 11) {
            cpf = cpf.slice(0, 11);
        }
        return cpf.replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    function formatarRG(rg) {
        rg = rg.replace(/\D/g, '');
        if (rg.length > 9) {
            rg = rg.slice(0, 9);
        }
        return rg.replace(/(\d{1})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
    }

    function formatarCNH(cnh) {
        cnh = cnh.replace(/\D/g, '');
        if (cnh.length > 11) {
            cnh = cnh.slice(0, 11);
        }
        return cnh.replace(/(\d{10})(\d)/, '$1-$2');
    }

    // Função para obter o próximo ID disponível
    function getNextClientId() {
        return axios.get('http://localhost:8080/clientes')  // Obtem todos os clientes
            .then(response => {
                const clientes = response.data;
                if (clientes.length > 0) {
                    const maxId = Math.max(...clientes.map(cliente => cliente.id));
                    return maxId + 1;
                }
                return 1;
            })
            .catch(error => {
                console.error('Erro ao buscar clientes:', error);
                return 1;
            });
    }

    // Função para enviar a foto para o Cloudinary
    function uploadFoto(fotoFile) {
        const cloudinaryURL = 'https://api.cloudinary.com/v1_1/dkah0zn7l/upload';  // Seu Cloud Name
        const uploadPreset = 'meu_preset';  // Substitua pelo seu preset de upload

        const formData = new FormData();
        formData.append('file', fotoFile);
        formData.append('upload_preset', uploadPreset);

        return axios.post(cloudinaryURL, formData)
            .then(response => response.data.secure_url)  // Retorna a URL da foto
            .catch(error => {
                console.error('Erro ao fazer upload da foto:', error);
                return null;
            });
    }

    // Evento de submit do formulário
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const fotoFile = fotoInput.files[0];
        let fotoURL = null;

        if (fotoFile) {
            uploadFoto(fotoFile).then(url => {
                if (url) {
                    fotoURL = url;  // Armazena a URL da foto

                    getNextClientId().then(nextId => {
                        const clienteData = {
                            id: nextId,  // ID obtido após checar o banco
                            nomeCompleto: document.getElementById("nome").value,
                            dataNascimento: document.getElementById("dataNascimento").value,
                            cpf: cpfInput.value,
                            rg: rgInput.value,
                            cnh: cnhInput.value,
                            tipoCnh: document.getElementById("tipoCnh").value,
                            telefone: document.getElementById("telefone").value,
                            celular1: document.getElementById("celular1").value,
                            celular2: document.getElementById("celular2").value,
                            email: document.getElementById("email").value,
                            cep: cepInput.value,
                            rua: ruaInput.value,
                            numeroCasa: document.getElementById("numeroCasa").value,
                            bairro: bairroInput.value,
                            cidade: cidadeInput.value,
                            estado: estadoInput.value,
                            idContrato: document.getElementById("idContrato").value,
                            planoEscolhido: document.getElementById("planoEscolhido").value,
                            status: document.getElementById("status").value,
                            foto: fotoURL,  // URL da foto
                        };

                        axios.post('http://localhost:8080/clientes', clienteData, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            console.log('Sucesso:', response.data);
                            alert('Cliente cadastrado com sucesso!');
                            clearFormFields();
                        })
                        .catch(error => {
                            console.error('Erro:', error);
                            alert('Erro ao cadastrar cliente.');
                        });
                    });
                } else {
                    alert('Erro ao fazer upload da foto.');
                }
            });
        } else {
            alert('Por favor, anexe uma foto!');
        }
    });

    // Evento do botão "Salvar e Voltar"
    saveAndBackButton.addEventListener("click", function(event) {
        event.preventDefault();

        const fotoFile = fotoInput.files[0];
        let fotoURL = null;

        if (fotoFile) {
            uploadFoto(fotoFile).then(url => {
                if (url) {
                    fotoURL = url;

                    getNextClientId().then(nextId => {
                        const clienteData = {
                            id: nextId,
                            nomeCompleto: document.getElementById("nome").value,
                            dataNascimento: document.getElementById("dataNascimento").value,
                            cpf: cpfInput.value,
                            rg: rgInput.value,
                            cnh: cnhInput.value,
                            tipoCnh: document.getElementById("tipoCnh").value,
                            telefone: document.getElementById("telefone").value,
                            celular1: document.getElementById("celular1").value,
                            celular2: document.getElementById("celular2").value,
                            email: document.getElementById("email").value,
                            cep: cepInput.value,
                            rua: ruaInput.value,
                            numeroCasa: document.getElementById("numeroCasa").value,
                            bairro: bairroInput.value,
                            cidade: cidadeInput.value,
                            estado: estadoInput.value,
                            idContrato: document.getElementById("idContrato").value,
                            planoEscolhido: document.getElementById("planoEscolhido").value,
                            status: document.getElementById("status").value,
                            foto: fotoURL,
                        };

                        axios.post('http://localhost:8080/clientes', clienteData, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            console.log('Sucesso:', response.data);
                            alert('Cliente cadastrado com sucesso!');
                            window.location.href = '/clientes cadastrados/index.html'; // Redireciona para a página de clientes cadastrados
                        })
                        .catch(error => {
                            console.error('Erro:', error);
                            alert('Erro ao cadastrar cliente.');
                        });
                    });
                } else {
                    alert('Erro ao fazer upload da foto.');
                }
            });
        } else {
            alert('Por favor, anexe uma foto!');
        }
    });

    // Limpar os campos do formulário após o envio bem-sucedido
    function clearFormFields() {
        document.getElementById("clienteForm").reset(); // Isso limpa todos os campos do formulário
    }
});
