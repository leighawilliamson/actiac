/**
  *
  * The top-level exported function will be run when you invoke this module from
  * the app.js module.
  *
  * @params These webhook accepts a single parameter, which must be a JSON object.
  * @params.command = command passed in telling this webhook which subfunction to invoke.
  *
  * @return The output of the command, which must be a JSON object.
  *
  */

var debug = false;
var sessionInfo;
var sessionInfoTitle;
var session_json = require('./sessions.json');
var speaker_json = require('./speakers.json');

/* The main function just serves to determine which command has been requested
   by the calling code. Based on the value of params.command passed in,
   a sub-function is invoked by this main function.
*/
module.exports = function (params) {
    if (params.debug != null && params.debug == "true"){
      debug = true;
    }
    var command = params.command;

    if (command === "test"){
        console.log('Command recognized: ' + command );
        return test(params);
    }
    else if (command === "when_is_speaker_session_v2"){
        console.log('Command recognized: ' + command );
        return when_is_speaker_session_v2(params);
    } 
    else if (command === "what_sessions_are_next_v2"){
        console.log('Command recognized: ' + command );
        return what_sessions_are_next_v2(params);
    }
    else if (command === "what_sessions_are_now"){
        console.log('Command recognized: ' + command );
        return what_sessions_are_now(params);
    }
    else if (command === "what_sessions_are_scheduled_for"){
        console.log('Command recognized: ' + command );
        return what_sessions_are_scheduled_for(params);
    }
    else if (command === "get_session_info"){
        console.log('Command recognized: ' + command );
        return get_session_info(params);
    }
    else if (command === "list_session_by_type"){
        console.log('Command recognized: ' + command );
        return list_session_by_type(params);
    }
    else if (command === "getSessionInfo"){
        console.log('Command recognized: ' + command );
        return getSessionInfo(params);
    }   
    else if (command === "list_session_by_track"){
        console.log('Command recognized: ' + command );
        return list_session_by_track(params);
    }
    else {
	    return { message: 'Command not recognized: ' + command };
    }
}

/* The test sub-function just returns a "success" response.
    This just tests that the round-trip from Watson Assistant to the webhook module
    works and that it is possible to invoke the webhook logic successfully.
*/
async function test (params){
    console.log("entering test function");

    parseTime("8:00AM");

    return {status:"200",statusText:"OK"};
}

// Convert Excel dates into JS date objects
//
// @param excelDate {Number}
// @return {Date}

function getJsDateFromExcel(excelDate) {

  // JavaScript dates can be constructed by passing milliseconds
  // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

  // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")             
  // 2. Convert to milliseconds.

    var fixedDate = new Date((excelDate - (25567 + 2))*86400*1000);
    fixedDate = fixedDate.toISOString().split('T')[0];
    return fixedDate;
} // --------- end getJsDateFromExcel function --------------------



/* The when_is_speaker_session_v2 sub-function returns the session record for a given speaker.
    @params.speaker = the speaker name used as the lookup key
*/
async function when_is_speaker_session_v2 (params){
    console.log("entering when_is_speaker_session_v2 function");
  
    var returnobj = {
      "status": "200",
      "statusText": "OK",
      "errorCode": "",
      "errorMessage": "",
      "formatted": "",
      "sessions": [],
      "speaker": ""
      };
  
      try {
                  
        var sessionList;
        var session_array =[];

        // get speaker record and session id
        for (i in speaker_json.Speakers) {

            if (params.speaker.includes(speaker_json.Speakers[i]['Last Name'])){
                if (debug) console.log("Found Last Name.");
                if (params.speaker.includes(speaker_json.Speakers[i]['First Name'])){
                    if (debug) console.log("Found First Name.");
                    sessionList = speaker_json.Speakers[i]['List of Session ID(s)'];
                    returnobj.speaker = speaker_json.Speakers[i];
                    break;
                }
            }
        }

        var speaker_sessions = parseSessions(sessionList);

        for (j in speaker_sessions){

            var session_id = speaker_sessions[j];

            // get session record  
            for (i in session_json.Sessions){

                if (session_json.Sessions[i]['Session ID'] == session_id){
                    if (debug)console.log("Found a session: ",session_json.Sessions[i].Title);
                    session_array.push(session_json.Sessions[i]);
                    break;
                }
            }
        }
        
        returnobj.sessions = session_array;

    }
    catch (error) {
        console.error(`An error occurred during when_is_speaker_session_v2 processing: ${error}`);
    }
  
    return returnobj;
} // --------- end when_is_speaker_session_v2 function --------------------
  
 /* The what_sessions_are_now sub-function returns information about the currently underway sessions.
    "now" is based on the current time. However, the function does accept test input if params.use_params is true.
    @params.use_params = tells the function whether to use the current date/time or else use passed in test data.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function what_sessions_are_now (params){
    console.log("entering what_sessions_are_now function");

    if (params.use_params == "true") {
        //console.log("Use passed in params.");
        //console.log(JSON.stringify(params));
        return what_sessions_are_scheduled_for(params);
    }
    else {
        params.use_params = "true";
        var target_session_time = new Date(Date.now());
        var monthString = ("0" + (target_session_time.getMonth() + 1)).slice(-2);
        var dayString = ("0" + target_session_time.getDate()).slice(-2);
        params.day = target_session_time.getFullYear() + "-" + monthString + "-" + dayString;
        params.time = target_session_time.getHours() + ":" + target_session_time.getMinutes();

        return what_sessions_are_scheduled_for(params);
    }
  } // --------- end what_sessions_are_now function --------------------
 
/* The what_sessions_are_next_v2 sub-function returns information about the next sessions in the conference schedule.
    "now" is based on the current time. However, the function does accept test input if params.use_params is true.
    @params.use_params = tells the function whether to use the current date/time or else use passed in test data.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function what_sessions_are_next_v2 (params){
    console.log("entering what_sessions_are_next_v2 function");
  
    var returnobj = {
      "status": "200",
      "statusText": "OK",
      "errorCode": "",
      "errorMessage": "",
      "formatted": "",
      "fields": {},
      "raw": ""
      };
  
    try {
        var Sessions = session_json.Sessions;
        //var Speakers = speaker_json.Speakers;

        var paramTime;
        var now;
        if (params.use_params == "true"){
            now = new Date(params.day);
            paramTime = parseTime2(params.time);
            now.setHours(paramTime.hour,paramTime.minutes);
        }
        else {
            now = new Date(Date.now());
            paramTime = {
                "hours": now.getHours(),
                "minutes": now.getMinutes()
            }
        }
        var now_plus_90_minutes = new Date(now.getTime() + (90 * 60000));
        if (debug) {
            console.log("Now is: ",now);
            console.log("Day is: ", now.getDay());
            console.log("Now +90 is:", now_plus_90_minutes);
        }
        var session_array = [];
  
        // go through list of sessions
        for (i in Sessions) {

            var session_day = new Date(Sessions[i].Date); // create a date object with no time set
            var session_start = new Date(Sessions[i].Date);
            var session_end = new Date(Sessions[i].Date);

            // only process sessions that scheduled for today
            if (session_day.getDay() == now.getDay()){
                console.log("Checking session: ",Sessions[i].Date, Sessions[i]['Start Time']);

                // set times for this session's start and end Date objects
                var session_start_time = parseTime2(Sessions[i]['Start Time']);
                session_start.setHours(session_start_time.hour,session_start_time.minutes); // add in session start time
                var session_end_time = parseTime2(Sessions[i]['End Time']);
                session_end.setHours(session_end_time.hour,session_end_time.minutes);

                if (debug){
                    console.log("Now time = ",now.getTime());
                    console.log("Session start = ",session_start.getTime());
                    console.log("Session end = ",session_end.getTime());
                }

                // check if the session start time is within 1.5 hours of now (meaining it is one of the "next" sessions)
                var time_diff = session_start.getTime() - now.getTime();
                if (debug) console.log("Time diff = ",time_diff);
                if ((time_diff > 0) && (time_diff < 5400000)) {
                    if (debug) {
                        console.log("Found a session within the next 90 minutes.");
                        console.log(JSON.stringify(Sessions[i]));
                    }

                    // push this session in the list
                    session_array.push(Sessions[i]);
                }
            }
            else {
                //console.log("Ignoring session dated: ",session_day);
            }            
        }

        // format the response back for the assistant to say
        var session_id, session_title, session_location;

        if (session_array.length > 0) {
            var formatted_response = "There are " + session_array.length + " sessions coming up next. ";
        }
        else {
            formatted_response = "There are no more upcoming sessions today."
        }
     
        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;
        var start_time_json = formatTime(paramTime.hour + ":" + paramTime.minutes);
        var formatted_start_time = start_time_json.hour + ":" + start_time_json.minutes + " " + start_time_json.am_pm;
        
        sessionInfoTitle = "Conference Sessions coming up after \
         " +  formatted_start_time + " today";

        returnobj.fields.session_count = session_array.length;
        returnobj.raw = session_array;
        returnobj.formatted = formatted_response;
    }
    catch (error) {
        console.error(`An error occurred during what_sessions_are_next_v2 processing: ${error}`);
    }
  
    
    return returnobj;
} // --------- end what_sessions_are_next_v2 function --------------------

/* The get_thought_leadership_info sub-function returns information about the conference thought leadership sessions.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function list_session_by_type (params){
    console.log("entering list_session_by_type function");
  
    var returnobj = {
      "status": "200",
      "statusText": "OK",
      "errorCode": "",
      "errorMessage": "",
      "formatted": "",
      "fields": {},
      "raw": ""
      };
  
    try {
        
        var Sessions = session_json.Sessions;
        var session_array = [];
  
        // go through list of sessions
        for (i in Sessions) {
                // check if the session type matches param passed in
                if (Sessions[i]['Session Type'] == params.session_type)
                {
                    if (debug) {
                        console.log("Found a session matching the requested type.");
                        console.log(JSON.stringify(Sessions[i]));
                    }

                    // push this session in the list
                    session_array.push(Sessions[i]);
                }
            //}
            else {
                //console.log("Ignoring session dated: ",session_day);
            }            
        }

        // format the response back for the assistant to say
        var session_id, session_title, session_location,formatted_response;

        if (session_array.length > 0) {
            formatted_response = "There are " + session_array.length + " sessions of that type. ";
        }
        else {
            formatted_response = "I could not find any sessions of that type. Is there another session type that I can search for?"
        }
        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;
        sessionInfoTitle = params.session_type + " Conference Sessions";

        returnobj.fields.session_count = session_array.length;
        returnobj.formatted = formatted_response;
    }
    catch (error) {
        console.error(`An error occurred during list_session_by_type processing: ${error}`);
    }
    
    return returnobj;
  } // --------- end list_session_by_type function --------------------


/* The list_session_by_track sub-function returns the list of sessions for a specific conference track.
@params.track = track name to be used as the key for building the list.
*/
async function list_session_by_track (params){
console.log("entering list_session_by_track function");

var returnobj = {
  "status": "200",
  "statusText": "OK",
  "errorCode": "",
  "errorMessage": "",
  "formatted": "",
  "fields": {},
  "raw": ""
  };

try {
    
    var Sessions = session_json.Sessions;
    var session_array = [];

    // go through list of sessions
    for (i in Sessions) {
            // check if the session track matches param passed in
            if (Sessions[i]['Track Name(s)'] == params.track)
            {
                if (debug) {
                    console.log("Found a session matching the requested track.");
                    console.log(JSON.stringify(Sessions[i]));
                }

                // push this session in the list
                session_array.push(Sessions[i]);
            }            
    }

    // format the response back for the assistant to say
    var formatted_response;

    if (session_array.length > 0) {
        formatted_response = "There are " + session_array.length + " sessions in that track. ";
    }
    else {
        formatted_response = "I could not find any sessions for that track. Is there another conference track that I can search for?"
    }
    // stash the session list so that it can be displayed in the browser link
    sessionInfo = session_array;
    sessionInfoTitle = params.track + " Conference Sessions";

    returnobj.fields.session_count = session_array.length;
    returnobj.formatted = formatted_response;
}
catch (error) {
    console.error(`An error occurred during list_session_by_track processing: ${error}`);
}

return returnobj;
} // --------- end list_session_by_track function --------------------



/* The get_session_info sub-function returns information about a specific session based on its session ID.
    @params.key_type = required parameter to tell the function which field in the session data to search.
    @params.session_id = used to look up the specific session record
*/
async function get_session_info (params){
    console.log("entering get_session_info function");
  
    var returnobj = {
      "status": "200",
      "statusText": "OK",
      "errorCode": "",
      "errorMessage": "",
      "formatted": "",
      "fields": {},
      "raw": ""
      };
  
    // check for required keytype parameter
    if ((params.key_type == null) || (params.key_type == "")) {
        returnobj.status = "500";
        returnobj.statusText = "Failed - missing parameter"
        returnobj.errorCode = "1000";
        returnobj.errorMessage = "No keytype parameter supplied!";
        return returnobj;
    }

    try {
        var Sessions = session_json.Sessions;
        var Speakers = speaker_json.Speakers;
        
        var session_array = [];
        var sessions_found = false;
        var theSpeaker = {};
        var theSpeakerSessions = [];
        var formatted_response = "";

        if (params.key_type == "speaker_name"){
            for (i in Speakers){
                if ((params.speaker_name.includes(Speakers[i]['First Name'])) &&
                     (params.speaker_name.includes(Speakers[i]['Last Name'])))
                {
                    if (debug) console.log("Found the speaker ", JSON.stringify(Speakers[i]));
                    theSpeaker = Speakers[i];
                    theSpeakerSessions = parseSessions(Speakers[i]['List of Session ID(s)']);
                }
            }
        }

        // go through list of sessions
        for (i in Sessions) {

            if (params.key_type == "session_id") { // check session ID
                if (Sessions[i]['Session ID'] == params.session_id) {
                    if (debug) console.log("Found a session: ", JSON.stringify(Sessions[i]));
                    sessions_found = true;
                    session_array.push(Sessions[i]);
                    break;
                }              
            }
            else if (params.key_type == "session_title"){
                if (Sessions[i].Title.includes(params.title)){
                    if (debug) console.log("Found a session: ", JSON.stringify(Sessions[i]));
                    sessions_found = true;
                    session_array.push(Sessions[i]);
                    break;
                }
            }
            else if (params.key_type == "speaker_name"){
                for (j in theSpeakerSessions){
                    if (Sessions[i]['Session ID'] == theSpeakerSessions[j]) {
                        if (debug) console.log("Found a session: ", JSON.stringify(Sessions[i]));
                        sessions_found = true;
                        session_array.push(Sessions[i]);
                    }
                }

            }    
        }    

        if (sessions_found) { // format response for verbal reply
            if (session_array.length == 1) {
                var theSession = session_array[0];
                var sessionTimeJson = formatTime(theSession['Start Time']);
                var sessionTimeString = sessionTimeJson.hour + ":" + sessionTimeJson.minutes + " " + sessionTimeJson.am_pm;
                var sessionLocationString = theSession.Location.replace(/-/g,',');
                
                if (params.key_type == "session_id") {
                    sessionInfoTitle = "Session: " + theSession['Session ID'];
                    formatted_response = "Session " + theSession['Session ID'] + " ";
                    if (theSession.Cancelled == "yes"){
                        sessionInfoTitle = sessionInfoTitle + " NOW CANCELLED";
                        formatted_response = formatted_response + " is now cancelled."
                    }
                    else {
                        formatted_response = formatted_response + "is titled " + theSession.Title;
                        formatted_response = formatted_response + " and is scheduled for " + sessionTimeString;
                        formatted_response = formatted_response + " on " + theSession.Date + ", ";
                        formatted_response = formatted_response + " and is located at " + sessionLocationString;
                    }
                }
                else if (params.key_type == "session_title"){
                    sessionInfoTitle = "Session: " + theSession.Title;
                    if (theSession.Cancelled == "yes"){
                        sessionInfoTitle = sessionInfoTitle + " NOW CANCELLED";
                    }
                    formatted_response = "The session titled " + theSession.Title;
                    formatted_response = formatted_response + " is session number " + theSession['Session ID'];
                    formatted_response = formatted_response + " and is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ", ";
                    formatted_response = formatted_response + " and is located at " + sessionLocationString;
                }
                else if (params.key_type == "speaker_name"){
                    sessionInfoTitle = "Sessions for speaker " + theSpeaker['First Name'] + " " + theSpeaker['Last Name'];
                    formatted_response = "Speaker " + params.speaker_name + ", " + theSpeaker.Title + ", ";
                    formatted_response = formatted_response + theSpeaker.Company + ", is scheduled to deliver ";
                    formatted_response = formatted_response + "session number " + theSession['Session ID'];
                    formatted_response = formatted_response + ", titled " + theSession.Title;
                    formatted_response = formatted_response + " which is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ", ";
                    formatted_response = formatted_response + " and is located at " + sessionLocationString;
                }
            }
            else { // more than 1 session and keytype must be speaker_name
                sessionInfoTitle = "Sessions for speaker " + theSpeaker['First Name'] + " " + theSpeaker['Last Name'];
                formatted_response = "Speaker " + params.speaker_name + ", " + theSpeaker.Title + ", ";
                formatted_response = formatted_response + theSpeaker.Company + ", is scheduled to deliver ";
                formatted_response = formatted_response + session_array.length + " sessions."
            }
                            
            returnobj.formatted = formatted_response;          
        }  
    }
    catch (error) {
        console.error(`An error occurred during get_session_info processing: ${error}`);
    }
    
    sessionInfo = session_array; // stash session data for dynamic web page display
    returnobj.raw = session_array;
    returnobj.fields.session_count = session_array.length;
    if (session_array.length > 0){
        returnobj.fields.session_description = session_array[0].Description;
    }
    return returnobj;
  } // --------- end get_session_info function --------------------
 


/* The what_sessions_are_scheduled_for sub-function returns information about the sessions scheduled for a specific date & time.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function what_sessions_are_scheduled_for (params){
    console.log("entering what_sessions_are_scheduled_for function");
  
    var returnobj = {
      "status": "200",
      "statusText": "OK",
      "errorCode": "",
      "errorMessage": "",
      "formatted": "",
      "fields": {},
      "raw": ""
      };
  
    try {
        var Sessions = session_json.Sessions;
        var target_session_time;
        var paramTime = {};
        var parsedDate = {};
        var allDay = false;

        // process passed in day and time parameters
        if (params.day == null) { // no date provided, make target date today
            target_session_time = new Date(Date.now());
            var monthInt = parseInt(target_session_time.getMonth(),10) + 1;  
            parsedDate.month = monthInt.toString();;
            parsedDate.year = target_session_time.getFullYear();
            parsedDate.day = target_session_time.getDate();
        }
        else { // set target date to passed in value & get json parsed equivalent
            target_session_time = new Date(params.day + "T13:24:00");
            parsedDate = parseDate(params.day);
        } 
        if ((params.time == null) || (params.time == '')) {
            // if no time passed in, then make it all day
            allDay = true;
            paramTime.hour = target_session_time.getHours();
            paramTime.minutes = target_session_time.getMinutes();
        }
        else { // use passed in time
            paramTime = parseTime2(params.time);
            target_session_time.setHours(paramTime.hour,paramTime.minutes);
        }
        
        
        if (debug) {
            console.log("target session time is: ",target_session_time.toLocaleString());
        }
        var session_array = [];
  
        // go through list of sessions
        for (i in Sessions) {

            var session_day = new Date(Sessions[i].Date); // create a date object with no time set
            var session_start = new Date(Sessions[i].Date);
            var session_end = new Date(Sessions[i].Date);

            // only process sessions that scheduled for the target day
            if (session_day.getDay() == target_session_time.getDay()){
                console.log("Checking session: ",Sessions[i].Date, Sessions[i]['Start Time']);

                // set times for this session's start and end Date objects
                var session_start_time = parseTime2(Sessions[i]['Start Time']);
                session_start.setHours(session_start_time.hour,session_start_time.minutes); // add in session start time
                var session_end_time = parseTime2(Sessions[i]['End Time']);
                session_end.setHours(session_end_time.hour,session_end_time.minutes);

                if (false){
                    console.log("Session start = ",session_start.getTime());
                    console.log("Target start = ",target_session_time.getTime());
                }

                // if only the date was supplied, push all sessions into the array
                if (allDay) {
                    // push this session in the list
                    session_array.push(Sessions[i]);
                }
                else 
                // check if the target time falls in between the session start and end times
                if ( (target_session_time.getTime() >= session_start.getTime()) && (target_session_time.getTime() < session_end.getTime()) )
                {
                    if (debug) {
                        console.log("Found a session scheduled during the target time.");
                        console.log(JSON.stringify(Sessions[i]));
                    }

                    // push this session in the list
                    session_array.push(Sessions[i]);
                }
            }
            else {
                //console.log("Ignoring session dated: ",session_day);
            }            
        }

        // format the response back for the assistant to say
        var session_id, session_title, session_location,formatted_response;

        if (session_array.length > 0) {
            formatted_response = "There are " + session_array.length + " sessions scheduled during that time. ";
        }
        else {
            formatted_response = "I could not find any sessions scheduled for that day and time. Is there another time that I can search for?"
        }
        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;
        var start_time_json = formatTime(paramTime.hour + ":" + paramTime.minutes);
        var formatted_start_time = start_time_json.hour + ":" + start_time_json.minutes + " " + start_time_json.am_pm;
        var date_string = parsedDate.month + "/" + parsedDate.day + "/" + parsedDate.year;

        sessionInfoTitle = "Conference Sessions going on";
        if (allDay) {sessionInfoTitle = sessionInfoTitle + " all day ";}
        else {sessionInfoTitle =  sessionInfoTitle + " at " + formatted_start_time;}
        sessionInfoTitle = sessionInfoTitle + " on " + date_string;
        
        returnobj.fields.session_count = session_array.length;
        returnobj.formatted = formatted_response;
    }
    catch (error) {
        console.error(`An error occurred during what_sessions_are_scheduled_for processing: ${error}`);
    }
    
    return returnobj;
  } // --------- end what_sessions_are_scheduled_for function --------------------
 

// --------- begin parseSessions function --------------------
function parseSessions(sessionList){
    // "5916;6078"
    if (debug) console.log("parseSessions List: ",sessionList);
    var sessions = [];
    var start_pointer = 0;
    var end_pointer = sessionList.indexOf(";");
    if (debug) {
        console.log("start pointer: ",start_pointer);
        console.log("end pointer: ",end_pointer);
    }
    if (end_pointer < 0) {
        sessions.push(sessionList);
        return sessions;
    }
    else { // more than one session in the list
        var done = false;
        while (!done){
       
            var session = sessionList.substring(start_pointer,end_pointer);
            if (debug) console.log("session: ",session);
            sessions.push(session);
    
            start_pointer = end_pointer +1;
            end_pointer = sessionList.indexOf(";",start_pointer);
            if (debug) {
                console.log("start pointer: ",start_pointer);
                console.log("end pointer: ",end_pointer);
            }
            if (end_pointer < 0){
                session = sessionList.substring(start_pointer);
                if (debug) console.log("session: ",session);
                sessions.push(session);
                done = true
            }
        }
    }  
    
    if (debug) console.log("Sessions: ",JSON.stringify(sessions));
    return sessions;
} // --------- end parseSessions function --------------------

// --------- begin parseDate function --------------------
function parseDate (datestring) {
    console.log("Parsing: ",datestring);
    var date = new Date(datestring);
    var dash_loc = datestring.indexOf("-");
    var year = datestring.substring(0,dash_loc);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = datestring.substring(dash_loc +4, dash_loc +6);

    //var monthInt = parseInt(month,10) -1;
    //month = monthInt.toString();

    var parsedDate = {
        "year" : year,
        "month" : month,
        "day" : day
    }
    if (debug) console.log("Parsed date: ",JSON.stringify(parsedDate));

    return parsedDate;
} // --------- end parseDate function --------------------

// --------- begin parseTime function --------------------
function parseTime (time){
    //console.log("Parsing: ",time);

    var colon_loc = time.indexOf(":");

    var hour = time.substring(0,colon_loc);
    //console.log(hour);

    var minutes = time.substring(colon_loc + 1,colon_loc + 3);
    //console.log(minutes);

    if (time.includes("PM")){
        var hourInt = parseInt(hour,10) + 12;
        hour = hourInt.toString();
    }
    var parsedTime = {
        "hour": hour,
        "minutes": minutes
        };
    //console.log('Time: ', JSON.stringify(parsedTime));

    return parsedTime;
} // --------- end parseTime function --------------------

// --------- begin parseTime2 function --------------------
function parseTime2 (time){
    //console.log("Parsing: ",time);

    var colon_loc = time.indexOf(":");

    var hour = time.substring(0,colon_loc);
    //console.log(hour);

    var minutes = time.substring(colon_loc + 1,colon_loc + 3);
    //console.log(minutes);

    var parsedTime = {
        "hour": hour,
        "minutes": minutes
        };
    //console.log('Time: ', JSON.stringify(parsedTime));

    return parsedTime;
} // --------- end parseTime2 function --------------------

// --------- begin formatTime function --------------------
function formatTime (time){
    console.log("Formatting: ",time);

    var colon_loc = time.indexOf(":");
    var hour = time.substring(0,colon_loc);
    var hourInt = parseInt(hour,10);
    var minutes = time.substring(colon_loc + 1,colon_loc + 3);
    var am_pm = "AM";

    if (hourInt > 12){
        hourInt = hourInt - 12;
        hour = hourInt.toString();
        am_pm = "PM";
    }
    var formattedTime = {
        "hour": hour,
        "minutes": minutes,
        "am_pm": am_pm
        };
    //console.log('Time: ', JSON.stringify(parsedTime));

    return formattedTime;
} // --------- end formatTime function --------------------

/*
The code below is for the dynamic web page that displays a list of sessions
*/
// --------- begin getSessionInfo function --------------------
async function getSessionInfo(params){
    var html;
    try {
        html = build_html();
    }
    catch (err){
        console.log("error: ",err);
    }
    return html;
} // --------- end getSessionInfo function --------------------

// --------- begin build_html function --------------------
function build_html (){

    var html = "<!DOCTYPE html>\
    <html>\
        <head>\
            <title>ACT-IAC Virtual Assistant</title>\
            <link href=\"table.css\" rel=\"stylesheet\" type=\"text/css\">\
        </head>\
        <body>\
            <div id=\"headerdiv\">\
                <img id=\"topimage\" src=\"https://cos-image-server.mybluemix.net/img/actiac/actiac-logo.png\"/>\
                <h1 id=\"tabletitle\">" + sessionInfoTitle + "</h1>\
            </div>\
            <div id=\"tablediv\">\
                <table>\
                    <tr>\
                        <th>Session</th>\
                        <th class=\"titlecell\">Title</th>\
                        <th>Date</th>\
                        <th>Start</th>\
                        <th>End</th>\
                        <th class=\"location_cell\">Location</th>\
                    </tr>";
    
    for (i in sessionInfo){
        //console.log("Session: ",sessionInfo[i]['Session ID']);
        console.log("Session: ",sessionInfo[i]);
        var sessionTitleString = sessionInfo[i]['Title'];
        if (sessionInfo[i]['Cancelled'] == 'yes'){
            if (debug) console.log("Session cancelled.");
            sessionTitleString = "CANCELLED - " + sessionTitleString;
        }
        if (debug) console.log("Title: ",sessionTitleString);
        var start_time = formatTime(sessionInfo[i]['Start Time']);
        var end_time = formatTime(sessionInfo[i]['End Time']);
        var start_time_string = start_time.hour + ":" + start_time.minutes + " " + start_time.am_pm;
        var end_time_string = end_time.hour + ":" + end_time.minutes + " " + end_time.am_pm;
        html = html + "\
        <tr>\
        <td>" + sessionInfo[i]['Session ID'] + "</td>\
        <td class=\"titlecell\">" + sessionTitleString + "</td>\
        <td>" + sessionInfo[i].Date + "</td>\
        <td>" + start_time_string + "</td>\
        <td>" + end_time_string + "</td>\
        <td class=\"location_cell\">" + sessionInfo[i]['Location'] + "</td>\
        </tr>";
/*

                    <tr>\
                        <th>Session</th>\
                        <th>Date</th>\
                        <th>Start</th>\
                        <th>End</th>\
                        <th>Location</th>\
                        <th class=\"titlecell\">Title</th>\
                    </tr>";

        <tr>\
        <td>" + sessionInfo[i]['Session ID'] + "</td>\
        <td class=\"titlecell\">" + sessionInfo[i]['Title'] + "</td>\
        <td>" + start_time_string + "</td>\
        <td>" + sessionInfo[i]['Location'] + "</td>\
        <td>" + sessionInfo[i]['Date'] + "</td>\
        <td>" + end_time_string + "</td>\
        </tr>";

            <tr>
                <td>6073</td>
                <td>02/01/2022</td>
                <td>14:15:00</td>
                <td>ACC - Level 4 - 12A</td>
                <td>8 Action Steps to Foster an Equitable Workplace </td>
            </tr> 
*/
    }

    html = html + "\
                </table>\
            </div>\
        </body>\
    </html>\
    ";

    return html;
} // --------- end build_html function --------------------

           //formatted_response2 =  "Click on the link to my right and take a look at the list of sessions. Tell me if there is a session that you'd like more information about.";
            /*
            formatted_response = formatted_response + "Those sessions are: ";       
            for (i in session_array){
                session_id = session_array[i]['Session ID'];
                session_title = session_array[i].Title;
                session_location = session_array[i].Location;
                session_location = session_location.replace(/-/g,'');
                formatted_response = formatted_response + "Session number " + session_id + ", " + session_title;
                formatted_response = formatted_response + ", located at " + session_location + ". "
            }
            */