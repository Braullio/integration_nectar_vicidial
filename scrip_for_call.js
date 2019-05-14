(function (window) {

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let valueGet = {method: 'GET',mode: 'cors','Access-Control-Allow-Origin':'*'};
    let nectarWebphone = window.nectarWebphone;
    let urlServidor = 'https://IP_Vicidial';
    let AGENT_API = `${urlServidor}/agc/api.php`;
    let NON_AGENT = `${urlServidor}/vicidial/non_agent_api.php`;
    let sourceApi = "CallNectarAPI"
    let userApi = "userApi"
    let passApi = "passApi"
    let idForCall = null;
    let loadinCall = false;
    let lastStatus = null;
    let events = nectarWebphone.getEvents();

    events.register("call:new", _startCall);
    events.register("call:end", _endCall);

    function setUrl(agent_user,phone,option) {
        if (option == "urlSetPause") { 
            let url = `${AGENT_API}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=external_pause&value=PAUSE`; 
            return url;
        }
        if (option == "urlValuePause") {
            let url = `${AGENT_API}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=pause_code&value=NECTAR`; 
            return url;
        }
        if (option == "urlStartCall") {
            let url = `${AGENT_API}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=external_dial&phone_code=1&search=YES&preview=NO&focus=YES&value=${phone}`; 
            return url;
        }
        if (option == "urlStopCall") {
            let url = `${AGENT_API}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=external_hangup&value=1`; 
            return url;
        }
        if (option == "urlUnsetPause") {
            let url = `${AGENT_API}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=external_pause&value=RESUME`; 
            return url;
        }
        if (option == "urlSetStatusCall") {
            let url = `${AGENT_API}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=external_status&value=SUCESS`; 
            return url;
        }
        if (option == "urlGetCallID") {
            let url = `${NON_AGENT}?source=${sourceApi}&user=${userApi}&pass=${passApi}&agent_user=${agent_user}&function=agent_status&stage=csv&header=YES`; 
            return url;
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
            } else {
                if (response.match(/ERROR: agent_user is not logged.*/)) { 
                    alert("Usuario não logado ");sleep(1000)
                    window.location.reload(false); 
                } else {
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

    function checkSetNumber(phone){
        if (!phone) {
            alert("Telefone não foi encontrado")
            return false;
        } else {
            return phone;
        }
    }

    function checkSetUserVicidial(agent_user){
        if (!agent_user) {
            alert("Não foi configurado o parametro referente ao usuário do Vicidial")
            return false;
        } else {
            return agent_user;
        }
    }

    function checkAndRemovePrefixBR(phone){
        if(phone.startsWith("+55")){
            phone = phone.substring(3, phone.length);
            return phone;
        } else if(phone.startsWith("55")){
            phone = phone.substring(2, phone.length);
            return phone;
        }
        return phone;
    }

    function _startCall(params) {
        if (idForCall != null) { 
            alert('Voce ja existe uma ligacao em andamento'); 
            return; 
        } else {
            nectarWebphone.notify("call:start");
            ramalUsuario=checkSetUserVicidial(params.ramalUsuario);
            numero=checkSetNumber(params.numero);
            phone=checkAndRemovePrefixBR(numero);
            sendRequest(setUrl(ramalUsuario,phone,"urlSetPause"),'0');
            sleep(1050);
            sendRequest(setUrl(ramalUsuario,phone,"urlValuePause"),'0');
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,phone,"urlValuePause"),'0');
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,phone,"urlStartCall"),'0');
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,phone,"urlGetCallID"),'2');
            sleep(1000);
            nectarWebphone.notify("call:answered");
        }   
    }

    function _endCall(params) {
        ramalUsuario=params.ramalUsuario;
        if (idForCall != null) {
            finalizar = true;
            idForCall = null;
            nectarWebphone.notify("call:end"); 
        } else {
            sendRequest(setUrl(ramalUsuario,'0',"urlStopCall"),'3'); 
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,'0',"urlSetStatusCall"),'0'); 
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,'0',"urlSetPause"),'0'); 
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,'0',"urlSetPause"),'0'); 
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,'0',"urlValuePause"),'0'); 
            sleep(1000);
            sendRequest(setUrl(ramalUsuario,'0',"urlUnsetPause"),'0');  
            sleep(1000);
        }
    }

})(window, undefined);
