(function (window) {

let nectarWebphone = window.nectarWebphone;
let urlServidor = 'http://IP_Vicidial';
let source = "CallNectarAPI"
let user = "userApi"
let agent_user = "user_logged";
let AGENT_API = `${urlServidor}/agc/api.php`;
let NON_AGENT = `${urlServidor}/vicidial/non_agent_api.php`;

let urlSetPause = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_pause&value=PAUSE`;
let urlValuePause = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=pause_code&value=NECTAR`;
let urlStartCall = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_dial&phone_code=1&search=YES&preview=NO&focus=YES&value=${numero}`;
let urlStopCall = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_hangup&value=1`;
let urlUnsetPause = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_pause&value=RESUME`;
let urlSetStatusCall = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_status&value=SUCESS`;
let urlGetCallID = `${NON_AGENT}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=agent_status&stage=csv&header=YES`;

let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
let valueGet = {method: 'GET',mode: 'cors','Access-Control-Allow-Origin':'*'};

let checkCall = null;
let idForCall = null;
let loadinCall = false;
let lastStatus = null;

let events = nectarWebphone.getEvents();
events.register("call:new", _startCall);
events.register("call:end", _endCall);

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

function setHtmlValueResponse(valuePrint) {
    document.getElementById("pResponse").innerHTML = valuePrint;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function sendRequest(urlReceived,option){
    fetch(urlReceived , valueGet, option)
    .then(response => {
        return response.text();
    }) 
    .then(function (response) {
        if (response.match(/ERROR: agent_status AGENT NOT LOGGED IN.*/)) { 
            alert("Nao foi encontrado o login do usuario " + agent_user); 
            return;
        }
        else{
            if (option == 0) { 
                console.log(response.split(',')); 
            }  
            if (option == 1) { 
                console.log(response.split(',')); 
                console.log(idForCall); 
                nectarWebphone.notify("call:start"); 
                nectarWebphone.notify("call:id", {id: idForCall}); 
                checkCall = setInterval(() => {  _getCall() }, 2000); 
            }  
            if (option == 2) { 
                console.log(response.split(',')); 
                idForCall = response.replace(/\n/g, "=").split('=')[1].split(',')[1]; 
                loadinCall = false; 
            }
            if (option == 3) { 
                console.log(response.split(',')); 
                endingCall = false; 
        }
        }
        setHtmlValueResponse(response);
    })
    .catch((error) => {
        if (option == 0) { 
            console.log(response); 
        }  
        if (option == 1) { 
            idForCall = null; 
            handleError(response, true); 
        }
        if ((option == 2) || (option == 3)) { 
            endingCall = false; 
            handleError(error, true); 
        } 
    });
}

function checkSetNumber(){
    if (!numero) {
        alert("Numero não foi encontrado")
        return false;
    } 
}

function checkSetUserVicidial(){
    if (!agent_user) {
        alert("Não foi configurado o parametro referente ao usuário do Vicidial")
        return false;
    }
}

function checkAndRemovePrefixBR(){
    if(numero.startsWith("+55")){
        numero = numero.substring(3, numero.length);
    }else if(numero.startsWith("55")){
        numero = numero.substring(2, numero.length);
    }
}

function _test(){
    sendRequest(urlGetCallID,'2');
}

function _startCall(params) {
    let numero = params.numero;
    let agent_user = params.ramalUsuario;
    let nectarWebphone = window.nectarWebphone;

    sendRequest(urlGetCallID,'2');sleep(1000); 
    if (idForCall != null) { alert('Voce ja existe uma ligacao em andamento'); return; }
    else {
        _endCall();
        nectarWebphone.notify("call:start");
        checkSetNumber();
        checkSetUserVicidial();
        checkAndRemovePrefixBR();
        sendRequest(urlSetPause,'0');sleep(1000);
        sendRequest(urlValuePause,'0');sleep(1000);
        sendRequest(urlStartCall,'0');sleep(1000);
        sendRequest(urlGetCallID,'2');sleep(1000);
        nectarWebphone.notify("call:answered");
    }   
}

function _endCall() {
    sendRequest(urlStopCall,'3'); sleep(1000);
    sendRequest(urlSetStatusCall,'0'); sleep(1000);
    sendRequest(urlSetPause,'0'); sleep(1000);
    sendRequest(urlSetPause,'0'); sleep(1000);
    sendRequest(urlValuePause,'0'); sleep(1000);
    sendRequest(urlUnsetPause,'0'); 
    nectarWebphone.notify("call:end", call);
    idForCall = null;
}
})(window, undefined);
