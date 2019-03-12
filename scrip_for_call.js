(function (window) {

    let nectarWebphone = window.nectarWebphone;
let urlServidor = 'https://enderecoServidor.com.br';
let chaveAPI = "chaveAPIServidor";

let endpointChamada = `${urlServidor}api/`;
let endpointBuscarLigacao = `${urlServidor}mp3/`;


let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");


// REALIZANDO UMA LIGACAO
let checkCall = null;
let idLigacao = null;
let _doCall = (params) => {
    let numero = params.numero;
    let ramal = params.ramalUsuario;
    if (!numero) {
        alert("Numero não foi encontrado")
    } else if (!ramal) {
        alert("O ramal do usuário não foi configurado")
    }
    //nosso servico de ligacao nao pode receber o prefixo do pais
    if(numero.startsWith("+55")){
        numero = numero.substring(3, numero.length);
    }else if(numero.startsWith("55")){
        numero = numero.substring(2, numero.length);
    }
    if (idLigacao) {
        alert('Uma ligação já esta em andamento');
        return false;
    }
    idLigacao = true;
    let url = `${endpointChamada}chamada?ramal=${ramal}&telefone=${numero}&chave_api=${chaveAPI}`;
    let cfg = {
        method: 'POST',
        headers: myHeaders
    };
    fetch(url, cfg)
        .then(response => {
            return response.text().then(function (text) {
                let resposta = text ? JSON.parse(text) : {};
                if (response.status !== 200) {
                    throw Error(resposta.mensagem);
                }
                return Promise.resolve(resposta);
            });
        })
        .then(resposta => {
            idLigacao = resposta.id;
            nectarWebphone.notify("call:start");
            nectarWebphone.notify("call:id", {id: idLigacao});
            // QUANDO A LIGACAO E FEITA, FICAMOS MONITORANDO O STATUS DELA ATE QUE SEJA ENCERRADA
            checkCall = setInterval(() => {
                _getCall()
            }, 2000)
        })
        .catch(resposta => {
            idLigacao = null;
            handleError(resposta, true);
        });
};

//MONITORA O STATUS DA LIGACAO
let loadinCall = false;
let _getCall = function () {

    let url = `${endpointChamada}chamada?id=${idLigacao}&chave_api=${chaveAPI}`;
    let cfg = {method: 'GET'};

    fetch(url, cfg)
        .then(function (response) {
            return response.text().then(function (text) {
                let resposta = text ? JSON.parse(text) : {};
                if (response.status !== 200) {
                    throw Error(resposta.mensagem);
                }
                return Promise.resolve(resposta);
            });
        })
        .then(function (resposta) {
            console.log(resposta);
            _validadeCall(resposta);
            loadinCall = false;
        })
        .catch((error) => {
            loadinCall = false;
            handleError(error, true);
        });
};
let lastStatus = null;
let _validadeCall = (callInfo) => {
    if (callInfo && callInfo.status) {
        let status = callInfo.status.toLowerCase(); //esse saos os possiveis status que o servico da itvix me retorna
        let finalizar = false;
        if(lastStatus != null && lastStatus === status){
            return false;
        }
        lastStatus = status;
        switch (status) {
            case "ramal chamando":
                nectarWebphone.notify("call:preparing");
                break;
            case "discando":
                nectarWebphone.notify("call:preparing");
                break;
            case "telefone chamando":
                nectarWebphone.notify("call:start");
                break;
            case "chamada em curso":
                nectarWebphone.notify("call:answered");
                break;
            case "atendida":
                var call = {
                    url: `${endpointBuscarLigacao}${callInfo.arquivo_audio}`
                };
                nectarWebphone.notify("call:end", call);
                finalizar = true;
                break;
            case "nao atendida":
                nectarWebphone.notify("call:not_answered");
                finalizar = true;
                break;
            case "telefone ocupado":
                nectarWebphone.notify("call:not_answered");
                finalizar = true;
                break;
            case "a ligacao falhou":
                nectarWebphone.notify("call:erro");
                handleError(status, false);
                finalizar = true;
                break;
        }
        if (finalizar) {
            cancelInterval();
        }
    }
}


let handleError = (msg, supress) => {
    if (typeof msg === 'object' && msg.message) {
        msg = msg.message;
        supress = false;
    }
    if (msg) {
        if (!supress) {
            alert(msg);
        }
        console.error(msg);
    }
    nectarWebphone.notify("erro");
    cancelInterval();
};
let cancelInterval = function () {
    if (checkCall) {
        clearInterval(checkCall);
        checkCall = null;
        idLigacao = null;
    }
};

let _endCall = () => {
    if (!idLigacao) {
        return false;
    }
    let endingCall = false;
    let url = `${endpointChamada}chamada?id=${idLigacao}&chave_api=${chaveAPI}`;
    let cfg = {method: 'DELETE'};

    fetch(url, cfg)
        .then(function (response) {
            return response.text().then(function (text) {
                let resposta = text ? JSON.parse(text) : {};
                if (response.status !== 200) {
                    throw Error(resposta.mensagem);
                }
                return Promise.resolve(resposta);
            });
        })
        .then(function (resposta) {
            console.log(resposta);
            endingCall = false;
        })
        .catch((error) => {
            endingCall = false;
            handleError(error, true);
        });

}

let events = nectarWebphone.getEvents();
events.register("call:new", _doCall);
events.register("call:end", _endCall);


})(window, undefined);
