# Integration Nectar CRM with Vicidial for click to call

### [NON-AGENT API DOCUMENT]

agent_status - real-time status of one agent user
callid_info - information about a call based upon the caller_code or call ID

### [AGENT API DOCUMENT]

external_dial - sends command to manually dial a number on the agent's screen
pause_code - set a pause code if the agent is paused
external_pause - sends command to pause/resume an agent now if not on a call, or pause after their next call if on call
external_hangup - sends command to hangup the current phone call for one specific agent(Hangup Customer)


### START Call
	Set pause -> AGENT_API.external_pause
	Set value the pause -> AGENT_API.pause_code
	Start call -> AGENT_API.external_dial

### Check status of Call
	Get call_id -> NON-AGENT.agent_status
	Get status od call -> NON-AGENT.callid_info
 
### STOP Call
 	Stop call -> AGENT_API.external_hangup
 	Set pause -> AGENT_API.external_pause
 	Set value the pause -> AGENT_API.pause_code
 	Unset pause -> AGENT_API.external_pause

[//]: # (LINKS)
[Bootstrap 4.3]: <https://getbootstrap.com/docs/4.3/getting-started/introduction/>
[AGENT API DOCUMENT]: <http://vicidial.org/docs/AGENT_API.txt>
[NON-AGENT API DOCUMENT]: <http://www.vicidial.org/docs/NON-AGENT_API.txt>
