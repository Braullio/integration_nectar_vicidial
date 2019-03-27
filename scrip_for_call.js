(function (window) {

let nectarWebphone = window.nectarWebphone;
let urlServidor = 'https://IP_Vicidial';
let source = "CallNectarAPI"
let user = "userApi"
let pass = "passApi"
let AGENT_API = `${urlServidor}/agc/api.php`;
let NON_AGENT = `${urlServidor}/vicidial/non_agent_api.php`;

let phone = "telephone_client";
let agent_user = "user_logged";

let urlSetPause = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_pause&value=PAUSE`;
let urlValuePause = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=pause_code&value=NECTAR`;
let urlStartCall = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_dial&phone_code=1&search=YES&preview=NO&focus=YES&value=${phone}`;
let urlStopCall = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_hangup&value=1`;
let urlUnsetPause = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_pause&value=RESUME`;
let urlSetStatusCall = `${AGENT_API}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=external_status&value=SUCESS`;
let urlGetCallID = `${NON_AGENT}?source=${source}&user=${user}&pass=${pass}&agent_user=${agent_user}&function=agent_status&stage=csv&header=YES`;

let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
let valueGet = {method: 'GET',mode: 'cors','Access-Control-Allow-Origin':'*'};

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
    }
    nectarWebphone.notify("erro");
 };

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function sendRequest(urlReceived,option){
    fetch(urlReceived , valueGet)
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
    if (!phone) {
        alert("Telefone não foi encontrado")
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
    if(phone.startsWith("+55")){
        phone = phone.substring(3, phone.length);
    }else if(phone.startsWith("55")){
        phone = phone.substring(2, phone.length);
    }
}

function _test(){
    sendRequest(urlGetCallID,'2');
}

function _startCall(params) {
    let nectarWebphone = window.nectarWebphone;

    if (idForCall != null) { alert('Voce ja existe uma ligacao em andamento'); return; }
    else {
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
    sendRequest(urlUnsetPause,'0');  sleep(1000);
    nectarWebphone.notify("call:end"); // olha isso Lentidão
    finalizar = true;
    idForCall = null;
}
})(window, undefined);
