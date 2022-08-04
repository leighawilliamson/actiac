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
//var session_json = require('./sessions.json');
var session_json = require('./tasscc_sessions.json');
//var speaker_json = require('./speakers.json');
var speaker_json = require('./tasscc_sessions.json');
var bwi_flights = require('./flights.json');
var flightInfo;
var flightInfoTitle;
var axios = require('axios');

/* The main function just serves to determine which command has been requested
   by the calling code. Based on the value of params.command passed in,
   a sub-function is invoked by this main function.
*/
module.exports = function (params) {
    if (params.debug != null && params.debug == "true"){
        console.log("debug on");
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
    else if (command === "when_is_speaker_session_tasscc"){
        console.log('Command recognized: ' + command );
        return when_is_speaker_session_tasscc(params);
    } 
    else if (command === "what_sessions_are_next_tasscc"){
        console.log('Command recognized: ' + command );
        return what_sessions_are_next_tasscc(params);
    }
    else if (command === "what_sessions_are_now_tasscc"){
        console.log('Command recognized: ' + command );
        return what_sessions_are_now_tasscc(params);
    }
    else if (command === "what_sessions_are_scheduled_for_tasscc"){
        console.log('Command recognized: ' + command );
        return what_sessions_are_scheduled_for_tasscc(params);
    }
    else if (command === "get_session_info"){
        console.log('Command recognized: ' + command );
        return get_session_info(params);
    }
    else if (command === "list_session_by_type"){
        console.log('Command recognized: ' + command );
        return list_session_by_type(params);
    }
    else if (command === "get_session_info_tasscc"){
        console.log('Command recognized: ' + command );
        return get_session_info_tasscc(params);
    }
    else if (command === "list_session_by_type_tasscc"){
        console.log('Command recognized: ' + command );
        return list_session_by_type_tasscc(params);
    }
    else if (command === "getSessionInfo"){
        console.log('Command recognized: ' + command );
        return getSessionInfo(params);
    }       
    else if (command === "getFlightInfoHTML"){
        console.log('Command recognized: ' + command );
        return getFlightInfoHTML(params);
    }
    else if (command === "list_session_by_track"){
        console.log('Command recognized: ' + command );
        return list_session_by_track(params);
    }
    else if (command === "get_speaker_info"){
        console.log('Command recognized: ' + command );
        return get_speaker_info(params);
    }
    else if (command === "list_session_by_track_tasscc"){
        console.log('Command recognized: ' + command );
        return list_session_by_track_tasscc(params);
    }
    else if (command === "get_flight_info"){
        console.log('Command recognized: ' + command );
        return get_flight_info(params);
    }
    else if (command === "get_flight_info_by_destination"){
        console.log('Command recognized: ' + command );
        return get_flight_info_by_destination(params);
    }
    else if (command === "get_flight_info_bwi"){
        console.log('Command recognized: ' + command );
        return get_flight_info_bwi(params);
    }
    else if (command === "get_flight_info_by_destination_bwi"){
        console.log('Command recognized: ' + command );
        return get_flight_info_by_destination_bwi(params);
    }
    else {
	    return { message: 'Command not recognized: ' + command };
    }
}

//=================== Start of airport demo functions ==================================
//======================================================================================
function filter_flight_number(flight_num){
    var filtered_number = flight_num;

    if (typeof flight_num === 'string' || flight_num instanceof String) { // its a String
        filtered_number = flight_num.replace(/\D/g,'');
    }
    else if (Number.isFinite(flight_num)){ // its a number
        filtered_number = flight_num.toString();
    }

    return filtered_number;
}

function get_status(raw_status, direction){
    var status_json = {};
    status_json.end_of_response = false;
    var formatted_status = raw_status;
    switch (raw_status){
        case "on time":
            formatted_status = " is scheduled to depart for ";
            break;
        case "scheduled":
            if (direction == "departing"){
                formatted_status = " is scheduled to depart for ";
            }
            else {
                formatted_status = " is scheduled to arrive from ";
            }
            break;
        case "departed":
        case "active":
            if (direction == "departing"){
                formatted_status = " has already departed to ";
            }
            else {
                formatted_status = " is en route from ";
            }           
            break;
        case "landed":
            if (direction == "departing"){
                formatted_status = " has already landed at ";
            }
            else {
                formatted_status = " has landed from ";
            }           
            break;
        case "cancelled":
            formatted_status = " has been cancelled.";
            status_json.end_of_response = true;
            break;
        case "incident":
            formatted_status = " has had an incident.";
            status_json.end_of_response = true;
            break;
        case "diverted":
            formatted_status = " has been diverted.";
            status_json.end_of_response = true;
            break;
        default:
            break;
    }
    status_json.formatted_response = formatted_status;
    return status_json;
}


function get_airline_iata(airline_name){
    var iata = "";
    switch (airline_name){
        case "Delta":
        case "DL":
            iata = "DL";
            break;
        case "United":
        case "UA":
            iata = "UA";
            break;
        case "American":
        case "AA":
            iata = "AA";
            break;
        case "Southwest":
        case "SWA":
            iata = "WN";
        default:
            break;
    }
    return iata;
}

async function get_flight_info (params){
    console.log("entering get_flight_info function");
    returnobj = {status:"200",statusText:"OK"};
    var axios = require('axios');

    var query =  "&flight_number=" + filter_flight_number(params.flight_number);
    query = query + "&dep_iata=ATL"

    if ((params.airline != null) && (params.airline !='')){
        query = query + "&airline_iata=" + get_airline_iata(params.airline);
    }
    else if ((params.airline_code != null) && (params.airline_code !='')){
        query = query + "&airline_iata=" + get_airline_iata(params.airline_code);
    }

    var date = new Date().toISOString().split('T')[0];
    query = query + "&arr_scheduled_time_dep=" + date;

    console.log("");
    console.log("query: \n",query);
    console.log("");

    var config = {
        method: 'get',
        url: 'https://app.goflightlabs.com/flights?access_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNmYxODVjNmNjZjQ5NWYyZTMxMDM3YWE0OGIyYmZmYjAzOWM1YjQ5OTE5N2E0ZTQzMDk0YjYzZGU0MjRhOTczNGZmMzBkNzZjZmQzODg1M2MiLCJpYXQiOjE2NTM1MTg3NzUsIm5iZiI6MTY1MzUxODc3NSwiZXhwIjoxNjg1MDU0Nzc1LCJzdWIiOiI1MTY0Iiwic2NvcGVzIjpbXX0.YKan_GHp0fecswmBH_wszC2HZTbdiYoXtHIJMVddkOb1jY2SaVsewQ_faMqpko8ZYBp5YtrOjRrJKIusne19Kw' +
        query,
        headers: { 
            'Cookie': 'XSRF-TOKEN=eyJpdiI6Ild5MkljSnV5dHJBRG1WOC8zYm9tSmc9PSIsInZhbHVlIjoiRkNCaytyUmYvalJGL2FtbjhaaHJZYTZja0VMak1ZMFplUldtRUpTaW9hUlFKOXpkVXV3K1JIQk9OaktLbDhQZ2RlZU5NLzVqazc2OEdMK1o4K2tZYkNYY0JSTERUcHBtYXhweTl2c2RHTnhDUnVrc1Vxam5vRFo2eVpxcTZMSEMiLCJtYWMiOiJhNWFjN2JjZTdlODI4MDc4ODM5NGNkZTBjYjg3MTdhYzhiNTdkYWIxODQzOGYyZjg5NTc1ODJkNWQzOTRlNWY0In0%3D; flightlabs_session=eyJpdiI6InpQeTZpVlNXcWk4eEtBZWI1T1hUWWc9PSIsInZhbHVlIjoiOFhFdk16YUxDeGJORk50b2hSaCtTNDVpb3ZXNTFGeFVYL2JaTFVDVUxKUTdpZFhpSi93ZzQzSnl6TUpXU3Q0bGVaOW5yRm5hTWdiQUlMQzE2V1RxUXJxc3NPYnc2Vm5ucWJURTBKSDNPbXZqRFBTSUgvcWVJa3UwUEdQcHlVWUoiLCJtYWMiOiIwMjBiODIxMGZiNmQ1NjdmYjE0NmZiMDNkNGEzYmEwODFmNzZiM2ExNjEzMjM3Y2FjMmIwYTYzM2I5NWNkOWZhIn0%3D'
        }
    };

    let result;
    await axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            result = response.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    var departing_flight_list = [];
    var arriving_flight_list = [];
    var departing_flight = {};
    var arriving_flight = {};
    var departure_response = "";
    var arrival_response = "";
    if (result != null){
        for (const [key, value] of Object.entries(result)) {
            if ((key != "message")&& (key != "success")){
                if ((value.flight_status == "scheduled") || (value.flight_status == "active")){
                    // --------- process departing flight --------------------
                    //console.log(`${key}: ${value.airline.name}`);
                    var flight_time = new Date(value.departure.scheduled);
                    //console.log("departure time: ",flight_time.toISOString())
                    flight_time.setTime(flight_time.getTime() + (4*60*60*1000));
                    departing_flight.time = flight_time.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true });                   
                    departing_flight.flight_iata = value.flight.iata;
                    departing_flight.airline = value.airline.name;
                    departing_flight.status = value.flight_status;
                    departing_flight.gate = value.departure.gate;                   
                    departing_flight.to = value.arrival.airport;
                    departing_flight.delay = value.departure.delay;

                    departure_response = "Departing " + value.airline.name + " flight " + value.flight.iata; // Departing Delta Airline flight DL2323
                    var status_json = get_status(value.flight_status, "departing");
                    departure_response = departure_response + status_json.formatted_response;
                    if (! status_json.end_of_response) {
                        departure_response = departure_response + departing_flight.to;
                        if (value.flight_status == "active"){ departure_response = departure_response + "."}
                        else {
                            departure_response = departure_response + " from gate " +
                                value.departure.gate + " at " + departing_flight.time + ".";
                        }                       
                    }

                    departing_flight_list.push(value);
                    // --------- done process departing flight --------------------
                }
                if (value.arrival.iata == "ATL"){
                    //console.log(`${key}: ${value.airline.name}`);
                    arriving_flight.flight_iata = value.flight.iata;
                    arriving_flight.airline = value.airline.name;
                    arriving_flight.status = value.flight_status;
                    arriving_flight.gate = value.arrival.gate;
                    var flight_time = new Date(value.arrival.scheduled);
                    console.log("arrival time: ",flight_time.toISOString())
                    flight_time.setTime(flight_time.getTime() + (4*60*60*1000));
                    arriving_flight.time = flight_time.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true });                   
                    
                    arriving_flight.from = value.departure.airport;
                    arriving_flight.delay = value.arrival.delay;
                    arriving_flight.baggage = value.arrival.baggage;

                    arrival_response = "Arriving " + value.airline.name + " flight " + value.flight.iata; // Arriving Delta Airline flight DL2323
                    var status_json = get_status(value.flight_status, "arriving");
                    arrival_response = arrival_response + status_json.formatted_response;
                    if (! status_json.end_of_response) {
                        arrival_response = arrival_response + arriving_flight.from;
                        if (value.flight_status == "active"){ arrival_response = arrival_response + "."}
                        else {
                            arrival_response = arrival_response + " at gate " +
                                value.arrival.gate + " at " + arriving_flight.time + ".";
                        }                       
                    }

                    arriving_flight_list.push(value);
                }
            }
        }
    }

    returnobj.departing_flights = departing_flight_list.length;
    returnobj.departing_flight_list = departing_flight_list;
    returnobj.arriving_flights = arriving_flight_list.length;
    returnobj.arriving_flight_list = arriving_flight_list;
    returnobj.departing_flight = departing_flight;
    returnobj.arriving_flight = arriving_flight;
    returnobj.departure_response = departure_response;
    returnobj.arrival_response = arrival_response;
    return returnobj;
}

async function get_flight_info_bwi (params){
    console.log("entering get_flight_info function");
    returnobj = {status:"200",statusText:"OK"};
    
    if (debug) console.log("params: ",params);
    var departing_flight_list = [];
    var departing_flight = {};
    var departure_response = "";
   
    var value = null;
    switch (params.flight_number){
        case 3534:
        case "3534":
            value = bwi_flights[0];
            break;
        case 1283:
        case "1283":
            value = bwi_flights[1];
            break;
        case 4340:
        case "4340":
            value = bwi_flights[2];
            break;
        case 4021:
        case "4021":
            value = bwi_flights[3];
            break;
        default:
            value = bwi_flights[3];
            break;
    }
           
    // --------- process departing flight --------------------
    var flight_time = new Date(value.departure.scheduled);
    //console.log("departure time: ",flight_time.toISOString())
    flight_time.setTime(flight_time.getTime() + (4*60*60*1000));
    departing_flight.time = flight_time.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true });                   
    departing_flight.flight_iata = value.flight.iata;
    departing_flight.airline = value.airline.name;
    departing_flight.status = value.flight_status;
    departing_flight.gate = value.departure.gate;                   
    departing_flight.to = value.arrival.airport;

    departure_response = "Departing " + value.airline.name + " flight " + value.flight.iata; // Departing Delta Airline flight DL2323
    var status_json = get_status(value.flight_status, "departing");
    departure_response = departure_response + status_json.formatted_response;

    if (! status_json.end_of_response) {
        departure_response = departure_response + departing_flight.to;
        if (value.flight_status == "departed"){ departure_response = departure_response + "."}
        else {
            departure_response = departure_response + " from gate " +
            value.departure.gate + " at " + departing_flight.time + ".";
        }                       
    }

    departing_flight_list.push(value);            
                
    returnobj.departing_flights = 1;
    returnobj.departing_flight_list = departing_flight_list;
    returnobj.departing_flight = departing_flight;
    returnobj.departure_response = departure_response;
    return returnobj;
}



async function getDestinationIata(params){
    var dest_iata = "BOS";
    if ((params.destination != null) && (params.destination != "")){
        var dest_str = params.destination;
        var query = "&search=" + dest_str;
        var config = {
            method: 'get',
            url: 'https://app.goflightlabs.com/cities?access_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNmYxODVjNmNjZjQ5NWYyZTMxMDM3YWE0OGIyYmZmYjAzOWM1YjQ5OTE5N2E0ZTQzMDk0YjYzZGU0MjRhOTczNGZmMzBkNzZjZmQzODg1M2MiLCJpYXQiOjE2NTM1MTg3NzUsIm5iZiI6MTY1MzUxODc3NSwiZXhwIjoxNjg1MDU0Nzc1LCJzdWIiOiI1MTY0Iiwic2NvcGVzIjpbXX0.YKan_GHp0fecswmBH_wszC2HZTbdiYoXtHIJMVddkOb1jY2SaVsewQ_faMqpko8ZYBp5YtrOjRrJKIusne19Kw' +
            query,
            headers: { 
                'Cookie': 'XSRF-TOKEN=eyJpdiI6Ild5MkljSnV5dHJBRG1WOC8zYm9tSmc9PSIsInZhbHVlIjoiRkNCaytyUmYvalJGL2FtbjhaaHJZYTZja0VMak1ZMFplUldtRUpTaW9hUlFKOXpkVXV3K1JIQk9OaktLbDhQZ2RlZU5NLzVqazc2OEdMK1o4K2tZYkNYY0JSTERUcHBtYXhweTl2c2RHTnhDUnVrc1Vxam5vRFo2eVpxcTZMSEMiLCJtYWMiOiJhNWFjN2JjZTdlODI4MDc4ODM5NGNkZTBjYjg3MTdhYzhiNTdkYWIxODQzOGYyZjg5NTc1ODJkNWQzOTRlNWY0In0%3D; flightlabs_session=eyJpdiI6InpQeTZpVlNXcWk4eEtBZWI1T1hUWWc9PSIsInZhbHVlIjoiOFhFdk16YUxDeGJORk50b2hSaCtTNDVpb3ZXNTFGeFVYL2JaTFVDVUxKUTdpZFhpSi93ZzQzSnl6TUpXU3Q0bGVaOW5yRm5hTWdiQUlMQzE2V1RxUXJxc3NPYnc2Vm5ucWJURTBKSDNPbXZqRFBTSUgvcWVJa3UwUEdQcHlVWUoiLCJtYWMiOiIwMjBiODIxMGZiNmQ1NjdmYjE0NmZiMDNkNGEzYmEwODFmNzZiM2ExNjEzMjM3Y2FjMmIwYTYzM2I5NWNkOWZhIn0%3D'
            }
        };
        let result;
        await axios(config)
            .then(function (response) {
                //console.log(JSON.stringify(response.data));
                result = response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        
        if (result != null){
            for (const [key, value] of Object.entries(result)) {
                if ((key != "message")&& (key != "success")){
                    console.log("Destination IATA: ", value.iata_code);
                    dest_iata = value.iata_code;
                }
            }
        }
                 
    }
    if (params.destination == "Washington"){
        dest_iata = "WAS";
    }
    if (params.destination == "New York"){
        dest_iata = "NYC";
    }
    if (params.destination == "Chicago"){
        dest_iata = "ORD";
    }
    if (params.destination == "Jacksonville"){
        dest_iata = "JAX";
    }
    return dest_iata;
}

async function get_flight_info_by_destination(params){
    console.log("entering get_flight_info_by_destination function");
    returnobj = {status:"200",statusText:"OK"};

    var query =  "&dep_iata=ATL";

    let today = new Date(Date.now());
    var today_string = today.toISOString().split('T')[0]
    query = query + "&arr_scheduled_time_dep=" + today_string; //should be in format "2022-05-28";

    var destination_iata = await getDestinationIata(params);
    query = query + "&arr_iata=" + destination_iata;

    if (debug) console.log("");
    if (debug) console.log("query: \n",query);
    if (debug) console.log("");

    var config = {
        method: 'get',
        url: 'https://app.goflightlabs.com/flights?access_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNmYxODVjNmNjZjQ5NWYyZTMxMDM3YWE0OGIyYmZmYjAzOWM1YjQ5OTE5N2E0ZTQzMDk0YjYzZGU0MjRhOTczNGZmMzBkNzZjZmQzODg1M2MiLCJpYXQiOjE2NTM1MTg3NzUsIm5iZiI6MTY1MzUxODc3NSwiZXhwIjoxNjg1MDU0Nzc1LCJzdWIiOiI1MTY0Iiwic2NvcGVzIjpbXX0.YKan_GHp0fecswmBH_wszC2HZTbdiYoXtHIJMVddkOb1jY2SaVsewQ_faMqpko8ZYBp5YtrOjRrJKIusne19Kw' +
        query,
        headers: { 
            'Cookie': 'XSRF-TOKEN=eyJpdiI6Ild5MkljSnV5dHJBRG1WOC8zYm9tSmc9PSIsInZhbHVlIjoiRkNCaytyUmYvalJGL2FtbjhaaHJZYTZja0VMak1ZMFplUldtRUpTaW9hUlFKOXpkVXV3K1JIQk9OaktLbDhQZ2RlZU5NLzVqazc2OEdMK1o4K2tZYkNYY0JSTERUcHBtYXhweTl2c2RHTnhDUnVrc1Vxam5vRFo2eVpxcTZMSEMiLCJtYWMiOiJhNWFjN2JjZTdlODI4MDc4ODM5NGNkZTBjYjg3MTdhYzhiNTdkYWIxODQzOGYyZjg5NTc1ODJkNWQzOTRlNWY0In0%3D; flightlabs_session=eyJpdiI6InpQeTZpVlNXcWk4eEtBZWI1T1hUWWc9PSIsInZhbHVlIjoiOFhFdk16YUxDeGJORk50b2hSaCtTNDVpb3ZXNTFGeFVYL2JaTFVDVUxKUTdpZFhpSi93ZzQzSnl6TUpXU3Q0bGVaOW5yRm5hTWdiQUlMQzE2V1RxUXJxc3NPYnc2Vm5ucWJURTBKSDNPbXZqRFBTSUgvcWVJa3UwUEdQcHlVWUoiLCJtYWMiOiIwMjBiODIxMGZiNmQ1NjdmYjE0NmZiMDNkNGEzYmEwODFmNzZiM2ExNjEzMjM3Y2FjMmIwYTYzM2I5NWNkOWZhIn0%3D'
        }
    };

    let result;
    await axios(config)
        .then(function (response) {
            if (debug) console.log(JSON.stringify(response.data));
            result = response.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    var flight_list = [];
    if (result != null){
        for (const [key, value] of Object.entries(result)) {
            if ((key != "message")&& (key != "success")){

                var flight_time = new Date(value.departure.scheduled);
                flight_time.setTime(flight_time.getTime() + (8*60*60*1000));
                if (debug) console.log("flight_time: ",flight_time.toLocaleString(('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true })));
                dep_time_milli = flight_time.getTime();

                if (debug) console.log("time now is: ", new Date(Date.now()).toLocaleString(('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true })));

                if ((dep_time_milli > Date.now()) && (value.flight_status == "scheduled")) {
                    flight_list.push(value);
                }
            }
        }
    }
      
    flight_list.sort(function(a, b) {
        return new Date(a.departure.scheduled) - new Date(b.departure.scheduled);
    });
    returnobj.num_flights = flight_list.length;
    flightInfo = flight_list;
    flightInfoTitle = "Flights to " + params.destination;
    
    return returnobj;
}

async function get_flight_info_by_destination_bwi(params){
    console.log("entering get_flight_info_by_destination_bwi function");
    returnobj = {status:"200",statusText:"OK"};

    var flight_list = [];
    var i = 0;
    var value
    while (i < 4 ) 
    {
        value = bwi_flights[i];
        flight_list.push(value);
        i = i +1;
    }
    
      /*
    flight_list.sort(function(a, b) {
        return new Date(a.departure.scheduled) - new Date(b.departure.scheduled);
    }); */
    returnobj.num_flights = 4;
    flightInfo = flight_list;
    flightInfoTitle = "Flights to " + params.destination;
    
    return returnobj;
}

//================= End of Airport Demo functions ================================
//================================================================================

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
        
        sessionInfoTitle= "Conference Sessions coming up after \
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
            var thisSessionType = Sessions[i]['Session Type'];
            if (thisSessionType != null) {

                // check if the session type matches param passed in
                if (thisSessionType == params.session_type)
                {
                    if (debug) {
                        console.log("Found a session matching the requested type.");
                        console.log(JSON.stringify(Sessions[i]));
                    }

                    // push this session in the list
                    session_array.push(Sessions[i]);
                }
                else if (thisSessionType.includes(params.session_type)){
                     // push this session in the list
                    session_array.push(Sessions[i]);
                }
                else {
                    //console.log("Ignoring session dated: ",session_day);
                }     
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
        sessionInfoTitle= params.session_type + " Conference Sessions";

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
    sessionInfoTitle= params.track + " Conference Sessions";

    returnobj.fields.session_count = session_array.length;
    returnobj.formatted = formatted_response;
}
catch (error) {
    console.error(`An error occurred during list_session_by_track processing: ${error}`);
}

return returnobj;
} // --------- end list_session_by_track function --------------------


async function get_speaker_info (params){
    console.log("entering get_speaker_info function");
  
    var returnobj = {
      "status": "200",
      "statusText": "OK",
      "errorCode": "",
      "errorMessage": "",
      "formatted": "",
      "fields": {},
      "raw": ""
      };
  
    var Speakers = speaker_json.Sessions;
    var theSpeaker = {};

    try {
        for (i in Speakers){
            //console.log("Speaker: ",JSON.stringify(Speakers[i]));

            if (params.speaker_name.includes(Speakers[i]['First Name'])) {
                if (params.speaker_name.includes(Speakers[i]['Last Name'])) {
                    if (debug) console.log("Found the speaker ", JSON.stringify(Speakers[i]));
                    returnobj.formatted = params.speaker_name + " is a speaker at this conference and is " + Speakers[i]['Role'] + ", " + Speakers[i]['Organization'];
                    break;
                }
            }
        }      
    }
    catch (error) {
        console.error(`An error occurred during get_speaker_info processing: ${error}`);
    }
    
    return returnobj;

}

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
                if (params.speaker_name.includes(Speakers[i]['First Name'])) {
                    if (params.speaker_name.includes(Speakers[i]['Last Name']))
                    {
                    if (debug) console.log("Found the speaker ", JSON.stringify(Speakers[i]));
                    theSpeaker = Speakers[i];
                    theSpeakerSessions = parseSessions(Speakers[i]['List of Session ID(s)']);
                    }
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
                // the replace function below was used for the TASA conference because the audio playback couldn't deal with locations with dashes
                //var sessionLocationString = theSession.Location.replace(/-/g,',');
                if (debug) console.log("location: ",theSession.Location);
                var sessionLocationString = theSession.Location;
                if (typeof theSession.Location == 'undefined')
                {
                    sessionLocationString = null;
                }
                if (debug)console.log("sessionLocationString: ",sessionLocationString);
                
                if (params.key_type == "session_id") {
                    sessionInfoTitle= "Session: " + theSession['Session ID'];
                    formatted_response = "Session " + theSession['Session ID'] + " ";
                    if (theSession.Cancelled == "yes"){
                        sessionInfoTitle= sessionInfoTitle+ " NOW CANCELLED";
                        formatted_response = formatted_response + " is now cancelled."
                    }
                    else {
                        formatted_response = formatted_response + "is titled " + theSession.Title;
                        formatted_response = formatted_response + " and is scheduled for " + sessionTimeString;
                        formatted_response = formatted_response + " on " + theSession.Date + ".";
                        if (sessionLocationString !== null){
                            formatted_response = formatted_response + " And is located at " + sessionLocationString;
                        }
                    }
                    if (debug) console.log("formatted response: ",formatted_response);
                }
                else if (params.key_type == "session_title"){
                    sessionInfoTitle= "Session: " + theSession.Title;
                    if (theSession.Cancelled == "yes"){
                        sessionInfoTitle= sessionInfoTitle+ " NOW CANCELLED";
                    }
                    formatted_response = "The session titled " + theSession.Title;
                   // formatted_response = formatted_response + " is session number " + theSession['Session ID'];
                    formatted_response = formatted_response + " is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ". ";
                    if (sessionLocationString !== null){
                        formatted_response = formatted_response + "And is located at " + sessionLocationString;
                    }
                }
                else if (params.key_type == "speaker_name"){
                    sessionInfoTitle= "Sessions for speaker " + theSpeaker['First Name'] + " " + theSpeaker['Last Name'];
                    formatted_response = "Speaker " + params.speaker_name + ", " + theSpeaker['Title'] + ", ";
                    formatted_response = formatted_response + theSpeaker['Company Name'];
                    
                    var speaker_role = theSpeaker['Role'];
                    if (speaker_role == "Moderator"){
                        formatted_response = formatted_response  + ", will be the Moderator for ";
                    }
                    else if (speaker_role == "Interviewer"){
                        formatted_response = formatted_response  + ", will be the Interviewer for ";
                    }
                    else if (speaker_role == "Keynote"){
                        formatted_response = formatted_response  + ", will be the Keynote speaker for ";
                    }
                    else if (speaker_role == "Introducer"){
                        formatted_response = formatted_response  + ", will be introducing ";
                    }
                    else if (speaker_role == "Government Co-Chair"){
                        formatted_response = formatted_response  + ", will be the Government Co-Chair for ";
                    }
                    else if (speaker_role == "Moderator & Industry Co-Chair"){
                        formatted_response = formatted_response  + ", will be the moderator and industry Co-Chair for ";
                    }
                    else if (speaker_role == "Interviewer & Industry Co-Chair"){
                        formatted_response = formatted_response  + ", will be the interviewer and industry Co-Chair for ";
                    }
                    else if (speaker_role == "Panelist"){
                        formatted_response = formatted_response  + ", will be a panelist in ";
                    }
                    else {
                        formatted_response = formatted_response  + ", will be speaking in ";
                    }
                    
                    //formatted_response = formatted_response + "session number " + theSession['Session ID'];
                    formatted_response = formatted_response + "the session titled " + theSession.Title+ ".";
                    formatted_response = formatted_response + " That session is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ". ";
                    if (sessionLocationString !== null){
                        formatted_response = formatted_response + "And is located at " + sessionLocationString;
                    }
                }
            }
            else { // more than 1 session and keytype must be speaker_name
                sessionInfoTitle= "Sessions for speaker " + theSpeaker['First Name'] + " " + theSpeaker['Last Name'];
                formatted_response = "Speaker " + params.speaker_name + ", " + theSpeaker['Title'] + ", ";
                formatted_response = formatted_response + theSpeaker['Company Name'] + ", is scheduled to speak in ";
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
            if (debug) console.log("no params.day passed in");
            target_session_time = new Date(Date.now());
            var monthInt = parseInt(target_session_time.getMonth(),10) + 1;  
            parsedDate.month = monthInt.toString();;
            parsedDate.year = target_session_time.getFullYear();
            parsedDate.day = target_session_time.getDate();
        }
        else { // set target date to passed in value & get json parsed equivalent
            if (debug) console.log("date passed in: ",params.day);
            target_session_time = new Date(params.day + "T13:24:00");
            parsedDate = parseDate(params.day);
        } 

        if ((params.time == null) || (params.time == '')) {
            // if no time passed in, then make it all day
            if (debug) console.log("no params.time passed in");
            allDay = true;
            paramTime.hour = target_session_time.getHours();
            paramTime.minutes = target_session_time.getMinutes();
        }
        else { // use passed in time
            if (debug) console.log("time passed in: ",params.time);
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
            if (session_array.length == 1){
                formatted_response = "There is " + session_array.length + " session scheduled during that time. ";
            }
            else {
                formatted_response = "There are " + session_array.length + " sessions scheduled during that time. ";
            }
        }
        else {
            formatted_response = "I could not find any sessions scheduled for that day and time. Is there another time that I can search for?"
        }

        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;

        // format the Titleof the dynamic html page
        var start_time_json = formatTime(paramTime.hour + ":" + paramTime.minutes);
        var formatted_start_time = start_time_json.hour + ":" + start_time_json.minutes + " " + start_time_json.am_pm;
        var date_string = parsedDate.month + "/" + parsedDate.day + "/" + parsedDate.year;
        if (debug) {
            console.log("date for web page display:", date_string);
            console.log("made from: ",parsedDate);
        }
        sessionInfoTitle= "Conference Sessions going on";
        if (allDay) {
            sessionInfoTitle= sessionInfoTitle+ " all day ";
        }
        else {
            sessionInfoTitle=  sessionInfoTitle+ " at " + formatted_start_time;
        }
        sessionInfoTitle= sessionInfoTitle+ " on " + date_string;
        
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
    console.log("function parseData, Parsing: ",datestring);

    var date = new Date(datestring);
    if (debug) console.log("function parseDate, date = ",date.toISOString());
    
    var dash_loc = datestring.indexOf("-");
    var year = datestring.substring(0,dash_loc);

   // var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var month = datestring.substring(dash_loc +1, dash_loc +3);
    if (debug) console.log("function parseDate, month = ", month);


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
    if (debug) console.log("function parseTime2, Parsing: ",time);

    var colon_loc = time.indexOf(":");

    var hour = time.substring(0,colon_loc);
    if (debug) console.log("function parseTime2, hour = ",hour);

    var minutes = time.substring(colon_loc + 1,colon_loc + 3);
    if (debug) console.log("function parseTime2, minutes = ",minutes);

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

    if (hourInt >= 12){
        if (hourInt > 12) hourInt = hourInt - 12;
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
            <title>TASSCC Virtual Assistant</title>\
            <link href=\"table.css\" rel=\"stylesheet\" type=\"text/css\">\
        </head>\
        <body>\
            <div id=\"headerdiv\">\
                <img id=\"topimage\" src=\"https://imageserver.n8eu78rs3sm.us-south.codeengine.appdomain.cloud/img/tasscc/july-conference-banner.jpg\"/>\
                <h1 id=\"tabletitle\">" + sessionInfoTitle+ "</h1>\
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
        var sessionLocationString = sessionInfo[i]['Location'];
        if (sessionLocationString == null) {
            sessionLocationString = "";
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
        <td class=\"location_cell\">" + sessionLocationString + "</td>\
        </tr>";
    }

    html = html + "\
                </table>\
            </div>\
        </body>\
    </html>\
    ";

    return html;
} // --------- end build_html function --------------------

// --------- begin build_html function --------------------
function build_html_body (){

/*
            <div id=\"headerdiv\">\
                <img id=\"topimage\" src=\"https://imageserver.n8eu78rs3sm.us-south.codeengine.appdomain.cloud/img/tasscc/july-conference-banner.jpg\"/>\
                <h1 id=\"tabletitle\">" + sessionInfoTitle+ "</h1>\
            </div>\
*/

    var html = "\
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
        var sessionLocationString = sessionInfo[i]['Location'];
        if (sessionLocationString == null) {
            sessionLocationString = "";
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
        <td class=\"location_cell\">" + sessionLocationString + "</td>\
        </tr>";
    }

    html = html + "\
                </table>\
            </div>\
    ";

    console.log("html string: ");
    console.log(html);
    return html;
} // --------- end build_html_body function --------------------



/*
The code below is for the dynamic web page that displays a list of flights
*/
// --------- begin getFlightInfoHTML function --------------------
async function getFlightInfoHTML(params){
    var html;
    try {
        html = build_flight_html();
    }
    catch (err){
        console.log("error: ",err);
    }
    return html;
} // --------- end getFlightInfoHTML function --------------------

// --------- begin build_html function --------------------
function build_flight_html (){

    var html = "<!DOCTYPE html>\
    <html>\
        <head>\
            <title>BWI Virtual Assistant</title>\
            <link href=\"table.css\" rel=\"stylesheet\" type=\"text/css\">\
        </head>\
        <body>\
            <div id=\"headerdiv\">\
                <img id=\"topimage\" src=\"https://imageserver.n8eu78rs3sm.us-south.codeengine.appdomain.cloud/img/bwi/bwi-logo1.png\"/>\
                <h1 id=\"tabletitle\">" + flightInfoTitle+ "</h1>\
            </div>\
            <div id=\"tablediv\">\
                <table>\
                    <tr>\
                        <th>Flight number</th>\
                        <th class=\"titlecell\">Airline</th>\
                        <th>Departs</th>\
                        <th>Gate</th>\
                        <th>Destination</th>\
                        <th class=\"location_cell\">Status</th>\
                    </tr>";
    
    for (i in flightInfo){
        //console.log("Session: ",flightInfo[i]['Session ID']);
        console.log("Flight: ",flightInfo[i]);
        var flight_time = new Date(flightInfo[i].departure.scheduled);
        //console.log("departure time: ",flight_time.toISOString())
        flight_time.setTime(flight_time.getTime() + (4*60*60*1000));
        departing_flight_time = flight_time.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true });                   
             
        html = html + "\
        <tr>\
        <td>" + flightInfo[i].flight.iata + "</td>\
        <td class=\"titlecell\">" + flightInfo[i].airline.name + "</td>\
        <td>" + departing_flight_time + "</td>\
        <td>" + flightInfo[i].departure.gate + "</td>\
        <td>" + flightInfo[i].arrival.airport + "</td>\
        <td class=\"location_cell\">" + flightInfo[i].flight_status + "</td>\
        </tr>";
    }

    html = html + "\
                </table>\
            </div>\
        </body>\
    </html>\
    ";

    return html;
} // --------- end build_html function --------------------

//=================================================================================
//======================= Start TASSCC functions ==================================
//=================================================================================


/* The when_is_speaker_session_tasscc sub-function returns the session record for a given speaker.
    @params.speaker = the speaker name used as the lookup key
*/
async function when_is_speaker_session_tasscc (params){
    console.log("entering when_is_speaker_session_tasscc function");
  
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
        for (i in session_json.Sessions) {
            console.log("Session: ",session_json.Sessions[i]['Session ID']);
            if (session_json.Sessions[i]['Last Name'] != null) {
                if (params.speaker.includes(session_json.Sessions[i]['Last Name']))
                {
                    if (debug) console.log("Found Last Name.");
                    if (params.speaker.includes(session_json.Sessions[i]['First Name'])){
                        if (debug) console.log("Found First Name.");
                        // this is the speaker and the session record
                        session_array.push(session_json.Sessions[i]);
                        break;
                    }
                }
            }
        }
        
        returnobj.sessions = session_array;
        returnobj.title = params.speaker + " Conference Sessions";
        returnobj.session_list = session_array;

    }
    catch (error) {
        console.error(`An error occurred during when_is_speaker_session_tasscc processing: ${error}`);
    }
  
    return returnobj;
} // --------- end when_is_speaker_session_tasscc function --------------------
  
 /* The what_sessions_are_now_tasscc sub-function returns information about the currently underway sessions.
    "now" is based on the current time. However, the function does accept test input if params.use_params is true.
    @params.use_params = tells the function whether to use the current date/time or else use passed in test data.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function what_sessions_are_now_tasscc (params){
    console.log("entering what_sessions_are_now_tasscc function");

    if (params.use_params == "true") {
        //console.log("Use passed in params.");
        //console.log(JSON.stringify(params));
        return what_sessions_are_scheduled_for_tasscc(params);
    }
    else {
        params.use_params = "true";
        var target_session_time = new Date(Date.now());
        var monthString = ("0" + (target_session_time.getMonth() + 1)).slice(-2);
        var dayString = ("0" + target_session_time.getDate()).slice(-2);
        params.day = target_session_time.getFullYear() + "-" + monthString + "-" + dayString;
        params.time = target_session_time.getHours() + ":" + target_session_time.getMinutes();

        return what_sessions_are_scheduled_for_tasscc(params);
    }
  } // --------- end what_sessions_are_now_tasscc function --------------------
 
/* The what_sessions_are_next_tasscc sub-function returns information about the next sessions in the conference schedule.
    "now" is based on the current time. However, the function does accept test input if params.use_params is true.
    @params.use_params = tells the function whether to use the current date/time or else use passed in test data.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function what_sessions_are_next_tasscc (params){
    console.log("entering what_sessions_are_next_tasscc function");
  
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
            if (debug) console.log("now time is: ",JSON.stringify(paramTime));
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
            if (typeof Sessions[i]['Session ID'] != 'undefined') {           
                console.log("checking session: ",Sessions[i]['Session ID']);
            }

            if (typeof Sessions[i]['Start Time'] != 'undefined') {

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
        }

        // format the response back for the assistant to say
        var session_id, session_title, session_location;
        var formatted_response = "";
        if (session_array.length > 0) {
            if (session_array.length == 1){
                formatted_response = "There is " + session_array.length + " session coming up next. ";
            }
            else
            var formatted_response = "There are " + session_array.length + " sessions coming up next. ";
        }
        else {
            formatted_response = "There are no more upcoming sessions today."
        }
     
        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;
        var start_time_json = formatTime(paramTime.hour + ":" + paramTime.minutes);
        var formatted_start_time = start_time_json.hour + ":" + start_time_json.minutes + " " + start_time_json.am_pm;
        
        sessionInfoTitle= "Conference Sessions coming up after \
         " +  formatted_start_time + " today";

        returnobj.fields.session_count = session_array.length;
        returnobj.raw = session_array;
        returnobj.formatted = formatted_response;
        returnobj.title = sessionInfoTitle;
        returnobj.session_list = session_array;
    }
    catch (error) {
        console.error(`An error occurred during what_sessions_are_next_tasscc processing: ${error}`);
    }
  
    
    return returnobj;
} // --------- end what_sessions_are_next_tasscc function --------------------

/* The list_session_by_type_tasscc sub-function returns information about the conference thought leadership sessions.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function list_session_by_type_tasscc (params){
    console.log("entering list_session_by_type_tasscc function");
  
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
            if (typeof Sessions[i]['Session Type'] != 'undefined') {

            var thisSessionType = Sessions[i]['Session Type'];
            if (thisSessionType != null) {

                // check if the session type matches param passed in
                if (thisSessionType == params.session_type)
                {
                    if (debug) {
                        console.log("Found a session matching the requested type.");
                        console.log(JSON.stringify(Sessions[i]));
                    }

                    // push this session in the list
                    session_array.push(Sessions[i]);
                }
                else if (thisSessionType.includes(params.session_type)){
                     // push this session in the list
                    session_array.push(Sessions[i]);
                }
                else {
                    //console.log("Ignoring session dated: ",session_day);
                }     
            }
            }
        }

        // format the response back for the assistant to say
        var session_id, session_title, session_location,formatted_response;

        if (session_array.length > 0) {
            if (session_array.length == 1){
                formatted_response = "There is " + session_array.length + " session of that type. ";
            }
            else
            formatted_response = "There are " + session_array.length + " sessions of that type. ";
        }
        else {
            formatted_response = "I could not find any sessions of that type. Is there another session type that I can search for?"
        }
        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;
        sessionInfoTitle= params.session_type + " Conference Sessions";

        returnobj.fields.session_count = session_array.length;
        returnobj.formatted = formatted_response;
        returnobj.title = sessionInfoTitle;
        returnobj.session_list = session_array;
    }
    catch (error) {
        console.error(`An error occurred during list_session_by_type_tasscc processing: ${error}`);
    }
    
    return returnobj;
  } // --------- end list_session_by_type_tasscc function --------------------


/* The list_session_by_track_tasscc sub-function returns the list of sessions for a specific conference track.
@params.track = track name to be used as the key for building the list.
*/
async function list_session_by_track_tasscc (params){
console.log("entering list_session_by_track_tasscc function");

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
        if (typeof Sessions[i]['Session Type'] != 'undefined') {

            // check if the session track matches param passed in
            if (Sessions[i]['Session Type'] == params.track)
            {
                if (debug) {
                    console.log("Found a session matching the requested track.");
                    console.log(JSON.stringify(Sessions[i]));
                }

                // push this session in the list
                session_array.push(Sessions[i]);
            }    
        }        
    }

    // format the response back for the assistant to say
    var formatted_response;

    if (session_array.length > 0) {
        if (session_array.length == 1){
            formatted_response = "There is " + session_array.length + " session in that track. ";
        }
        else
        formatted_response = "There are " + session_array.length + " sessions in that track. ";
    }
    else {
        formatted_response = "I could not find any sessions for that track. Is there another conference track that I can search for?"
    }
    // stash the session list so that it can be displayed in the browser link
    sessionInfo = session_array;
    sessionInfoTitle= params.track + " Conference Sessions";

    returnobj.fields.session_count = session_array.length;
    returnobj.formatted = formatted_response;
    returnobj.title = sessionInfoTitle;
    returnobj.session_list = session_array;
}
catch (error) {
    console.error(`An error occurred during list_session_by_track_tasscc processing: ${error}`);
}

return returnobj;
} // --------- end list_session_by_track_tasscc function --------------------



/* The get_session_info_tasscc sub-function returns information about a specific session based on its session ID.
    @params.key_type = required parameter to tell the function which field in the session data to search.
    @params.session_id = used to look up the specific session record
*/
async function get_session_info_tasscc (params){
    console.log("entering get_session_info_tasscc function");
  
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
        var Speakers = speaker_json.Sessions;    
        var session_array = [];
        var sessions_found = false;
        var theSpeaker = {};
        var theSpeakerSession = {};
        var theSpeakerSessionID = null;
        var formatted_response = "";

        if (params.key_type == "speaker_name"){
            for (i in Speakers){
                if (Speakers[i]['First Name'] != null){
                    if (params.speaker_name.includes(Speakers[i]['First Name'])) {
                        if (params.speaker_name.includes(Speakers[i]['Last Name']))
                        {
                        if (debug) console.log("Found the speaker ", params.speaker_name);
                        theSpeaker = Speakers[i];    
                        theSpeakerSessionID = Speakers[i]['Session ID'];     
                        if (debug) console.log("Speaker session: ", theSpeakerSessionID);               
                        }
                    }
                }
            }
        }

        // go through list of sessions
        var Sessions = session_json.Sessions;
        for (i in Sessions) {
            if (typeof Sessions[i]['Session ID'] != 'undefined') {
            
                console.log(Sessions[i]['Session ID']);
               
                if (params.key_type == "speaker_name"){
                    if (((Sessions[i]['Session ID'] == theSpeakerSessionID)) && (Sessions[i]['Start Time'] != null)) {
                        if (debug) console.log("Got full session info:", JSON.stringify(Sessions[i]));
                        session_array.push(Sessions[i]);
                        sessions_found = true;
                        break;
                    }
                } 
                else if (params.key_type == "session_id") { // check session ID
                    if (Sessions[i]['Session ID'] == params.session_id) {
                        if (debug) console.log("Found a session: ", JSON.stringify(Sessions[i]));
                        sessions_found = true;
                        session_array.push(Sessions[i]);
                        break;
                    }              
                }
                else if (params.key_type == "session_title"){
                    if (typeof Sessions[i]['Title'] != 'undefined') {
                        var thisTitle = Sessions[i]['Title'];
                        if (thisTitle.includes(params.title)){
                            if (debug) console.log("Found a session: ", JSON.stringify(Sessions[i]));
                            sessions_found = true;
                            session_array.push(Sessions[i]);
                            break;
                        }
                    }
                }
                else if (params.key_type == "session_sponsor"){
                    if (typeof Sessions[i]['Sponsor'] != 'undefined') {
                        var thisSponsor = Sessions[i]['Sponsor'];
                        if (thisSponsor.includes(params.sponsor)){
                            if (debug) console.log("Found a session: ", JSON.stringify(Sessions[i]));
                            sessions_found = true;
                            session_array.push(Sessions[i]);
                            //break; (don't break out when searching for session sponsors - there could be more than one session!)
                        }
                    }
                }
            }   
        }    

        if (sessions_found) { // format response for verbal reply
            if (session_array.length == 1) {
                console.log("Just one session found.");
                var theSession = session_array[0];
                var sessionTimeJson = formatTime(theSession['Start Time']);
                var sessionTimeString = sessionTimeJson.hour;
                var minuteInt = parseInt(sessionTimeJson.minutes,10);
                if (minuteInt > 0){
                    sessionTimeString = sessionTimeString + ":" + sessionTimeJson.minutes;
                }
                sessionTimeString = sessionTimeString + " " + sessionTimeJson.am_pm;
                 // the replace function below was used for the TASA conference because the audio playback couldn't deal with locations with dashes
                //var sessionLocationString = theSession.Location.replace(/-/g,',');
                if (debug) console.log("location: ",theSession.Location);
                var sessionLocationString = theSession.Location;
                if (typeof theSession.Location == 'undefined')
                {
                    sessionLocationString = null;
                }
                if (debug)console.log("sessionLocationString: ",sessionLocationString);
                
                if (params.key_type == "session_id") {
                    sessionInfoTitle= "Session: " + theSession['Session ID'];
                    formatted_response = "Session " + theSession['Session ID'] + " ";
                    if (theSession.Cancelled == "yes"){
                        sessionInfoTitle= sessionInfoTitle+ " NOW CANCELLED";
                        formatted_response = formatted_response + " is now cancelled."
                    }
                    else {
                        formatted_response = formatted_response + "is titled " + theSession.Title;
                        formatted_response = formatted_response + " and is scheduled for " + sessionTimeString;
                        formatted_response = formatted_response + " on " + theSession.Date + ".";
                        if (sessionLocationString !== null){
                            formatted_response = formatted_response + " And is located at " + sessionLocationString + ".";
                        }
                    }
                    if (debug) console.log("formatted response: ",formatted_response);
                }
                else if (params.key_type == "session_title"){
                    sessionInfoTitle = "Session: " + theSession.Title;
                    if (theSession.Cancelled == "yes"){
                        sessionInfoTitle= sessionInfoTitle+ " NOW CANCELLED";
                    }
                    formatted_response = "The session titled " + theSession.Title;
                   // formatted_response = formatted_response + " is session number " + theSession['Session ID'];
                    formatted_response = formatted_response + " is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ". ";
                    if (sessionLocationString !== null){
                        formatted_response = formatted_response + "And is located at " + sessionLocationString + ".";
                    }
                }
                else if (params.key_type == "speaker_name"){
                    sessionInfoTitle= "Sessions for speaker " + theSpeaker['First Name'] + " " + theSpeaker['Last Name'];
                    formatted_response = "Speaker " + params.speaker_name + ", " + theSpeaker['Role'] + ", ";
                    if (theSpeaker['Suffix'] != null){
                        formatted_response = formatted_response + theSpeaker['Suffix'] + ", ";
                    }
                    formatted_response = formatted_response + theSpeaker['Organization'];
                    
                    var speaker_role = theSpeaker['Role'];
                    if (speaker_role == "Moderator"){
                        formatted_response = formatted_response  + ", will be the Moderator for ";
                    }
                    else if (speaker_role == "Interviewer"){
                        formatted_response = formatted_response  + ", will be the Interviewer for ";
                    }
                    else if (speaker_role == "Keynote"){
                        formatted_response = formatted_response  + ", will be the Keynote speaker for ";
                    }
                    else if (speaker_role == "Introducer"){
                        formatted_response = formatted_response  + ", will be introducing ";
                    }
                    else if (speaker_role == "Government Co-Chair"){
                        formatted_response = formatted_response  + ", will be the Government Co-Chair for ";
                    }
                    else if (speaker_role == "Moderator & Industry Co-Chair"){
                        formatted_response = formatted_response  + ", will be the moderator and industry Co-Chair for ";
                    }
                    else if (speaker_role == "Interviewer & Industry Co-Chair"){
                        formatted_response = formatted_response  + ", will be the interviewer and industry Co-Chair for ";
                    }
                    else if (speaker_role == "Panelist"){
                        formatted_response = formatted_response  + ", will be a panelist in ";
                    }
                    else {
                        formatted_response = formatted_response  + ", will be speaking in ";
                    }
                    
                    //formatted_response = formatted_response + "session number " + theSession['Session ID'];
                    formatted_response = formatted_response + "the session titled " + theSession.Title + ".";
                    formatted_response = formatted_response + " That session is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ". ";
                    if (sessionLocationString !== null){
                        formatted_response = formatted_response + "And is located at " + sessionLocationString + ".";
                    }
                }
                else if (params.key_type == "session_sponsor"){
                    sessionInfoTitle = "Session sponsored by " + params.sponsor;
                    formatted_response = params.sponsor + " is sponsoring one session. ";
                    formatted_response = formatted_response + "That session is titled " + theSession.Title;
                    formatted_response = formatted_response + " and is scheduled for " + sessionTimeString;
                    formatted_response = formatted_response + " on " + theSession.Date + ". ";
                    if (sessionLocationString !== null){
                        if (sessionLocationString == "Online Only"){
                            formatted_response = formatted_response + "And is " + sessionLocationString + ".";
                        }
                        else 
                        formatted_response = formatted_response + "And is located at " + sessionLocationString + ".";
                    }
                }
            }
            else { // more than 1 session and keytype could be either speaker_name or session_sponsor
                if (params.key_type == "session_sponsor"){
                    sessionInfoTitle= "Sessions sponsored by " + params.sponsor;
                    formatted_response = params.sponsor + " is sponsoring " + session_array.length + " sessions.";
                }
                else if (params.key_type == "speaker_name"){
                    sessionInfoTitle= "Sessions for speaker " + theSpeaker['First Name'] + " " + theSpeaker['Last Name'];
                    formatted_response = "Speaker " + params.speaker_name + ", " + theSpeaker['Title'] + ", ";
                    formatted_response = formatted_response + theSpeaker['Company Name'] + ", is scheduled to speak in ";
                    formatted_response = formatted_response + session_array.length + " sessions."
                }

            }
                            
            returnobj.formatted = formatted_response;          
        }  
    }
    catch (error) {
        console.error(`An error occurred during get_session_info_tasscc processing: ${error}`);
    }
    
    sessionInfo = session_array; // stash session data for dynamic web page display
    returnobj.raw = session_array;
    returnobj.fields.session_count = session_array.length;
    if (session_array.length > 0){
        returnobj.fields.session_description = session_array[0].Description;
    }
    returnobj.title = sessionInfoTitle;
    returnobj.session_list = session_array;
    return returnobj;
  } // --------- end get_session_info_tasscc function --------------------
 


/* The what_sessions_are_scheduled_for_tasscc sub-function returns information about the sessions scheduled for a specific date & time.
    @params.day = date to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
    @params.time = time to be used for the current date/time ("now"). Only used if use_params is true, ignored otherwise.
*/
async function what_sessions_are_scheduled_for_tasscc (params){
    console.log("entering what_sessions_are_scheduled_for_tasscc function");
  
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
            if (debug) console.log("no params.day passed in");
            target_session_time = new Date(Date.now());
            var monthInt = parseInt(target_session_time.getMonth(),10) + 1;  
            parsedDate.month = monthInt.toString();;
            parsedDate.year = target_session_time.getFullYear();
            parsedDate.day = target_session_time.getDate();
        }
        else { // set target date to passed in value & get json parsed equivalent
            if (debug) console.log("date passed in: ",params.day);
            target_session_time = new Date(params.day + "T13:24:00");
            parsedDate = parseDate(params.day);
        } 

        if ((params.time == null) || (params.time == '')) {
            // if no time passed in, then make it all day
            if (debug) console.log("no params.time passed in");
            allDay = true;
            paramTime.hour = target_session_time.getHours();
            paramTime.minutes = target_session_time.getMinutes();
        }
        else { // use passed in time
            if (debug) console.log("time passed in: ",params.time);
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
            if ((session_day.getDay() == target_session_time.getDay()) && (Sessions[i]['Start Time'] != null))
            {
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
            if (session_array.length == 1){
                formatted_response = "There is " + session_array.length + " session scheduled during that time. ";
            }
            else {
                formatted_response = "There are " + session_array.length + " sessions scheduled during that time. ";
            }
        }
        else {
            formatted_response = "I could not find any sessions scheduled for that day and time. Is there another time that I can search for?"
        }

        // stash the session list so that it can be displayed in the browser link
        sessionInfo = session_array;

        // format the Titleof the dynamic html page
        var start_time_json = formatTime(paramTime.hour + ":" + paramTime.minutes);
        var formatted_start_time = start_time_json.hour + ":" + start_time_json.minutes + " " + start_time_json.am_pm;
        var date_string = parsedDate.month + "/" + parsedDate.day + "/" + parsedDate.year;
        if (debug) {
            console.log("date for web page display:", date_string);
            console.log("made from: ",parsedDate);
        }
        sessionInfoTitle= "Conference Sessions going on";
        if (allDay) {
            sessionInfoTitle= sessionInfoTitle+ " all day ";
        }
        else {
            sessionInfoTitle=  sessionInfoTitle+ " at " + formatted_start_time;
        }
        sessionInfoTitle= sessionInfoTitle+ " on " + date_string;
        
        returnobj.fields.session_count = session_array.length;
        returnobj.formatted = formatted_response;
        returnobj.title = sessionInfoTitle;
        returnobj.session_list = session_array;
    }
    catch (error) {
        console.error(`An error occurred during what_sessions_are_scheduled_for_tasscc processing: ${error}`);
    }
    //returnobj.html_string = build_html_body();
    return returnobj;
  } // --------- end what_sessions_are_scheduled_for_tasscc function --------------------
 