/*

Looks at the past <lookbackCount> runs and counts how many before a gap of <inactivePeriod>
 occurs between two consecutive runs date_played_est_2 times. Reads the 100k sheet to do so

Run times (date_played_est_2) is in column CJ
Run number (run_id) is in column CO

*/
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var sheetsKey = urlParams.get("key")
const spreadsheetID = "1Tyw9fwdZgsHJoHzlE-0LPSEDOduRkZwL2UUNA-_4Xo4"

var totalElement = document.getElementById("total")
var todayElement = document.getElementById("today")


var inactivePeriod = urlParams.get("inactivity_period") == null ? 8 : parseInt(urlParams.get("inactivity_period"))
var lookbackCount = urlParams.get("lookback_count") == null ? 40 : parseInt(urlParams.get("lookback_count"))

var inactivePeriodMs = inactivePeriod * 60 * 60 * 1000
var totalRunId = ""

// Opens http request
function httpGet(url){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url + "?key=" + sheetsKey, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

/**
 * @param {string} sheet        Name of sheet within spreadsheet
 * @param {string} cellRange    Cell range formated as Google Sheets range
 * 
 * @returns {Array<Array<string>>} Returns 2D array of rows and columns
 */
function getSheetData(sheet, cellRange){
    var rawData = httpGet("https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetID + "/values/" + sheet + "!" + cellRange)
    var data = JSON.parse(rawData)
    return data.values
}

/**
 * @param {number} count        How many date_played_est_2 to return as an int 
 * @returns 2D array of length 'count' with the column date_played_est_2
 */
function getRunTimes(count){
    return getSheetData("Raw Data", "CJ4:CJ" + (4 + count - 1).toString())
}

/**
 * @returns {number} An integer of current run number
 */
function getTotalRunID(){
    var response = getSheetData("Raw Data", "CO4:CO4")
    return parseInt(response[0][0].replaceAll(",",""))
}

/**
 * @returns The most recent runs date_played_est_2 
 */
function getLastRunTime(){
    return JSON.parse(getRunTimes(1))["values"][0][0]
}

/**
 * @returns The number of runs completed within lookbackCount runs without a gap of inactivePeriod hours
 */
function getTodaysRuns(){
    var lookbackRuns = getRunTimes(lookbackCount)

    if(new Date() - lookbackRuns[0][0] > inactivePeriodMs){
        return 0
    }

    var runsToday = 1

    for(var i = 0; i < lookbackRuns.length - 1; i++){
        if(new Date(lookbackRuns[i][0]) - new Date(lookbackRuns[i+1][0]) > inactivePeriodMs){
            break
        }
        runsToday++
    }
    return runsToday
}

/**
 * Updates the total and today elements
 */
function updateCounter(){
    var newestTotalRunId = getTotalRunID()
    if (totalRunId != newestTotalRunId) {
        totalElement.innerHTML = "Total: " + newestTotalRunId.toString()
        todayElement.innerHTML = "Today: " + getTodaysRuns().toString()
        totalRunId = newestTotalRunId
    }
}

//Runs counter update on load
updateCounter()

//Checks ever 10 seconds if a new run is on the sheet. Updates counter if so
window.setInterval(function(){
    updateCounter()
}, 10000)
