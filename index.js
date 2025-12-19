/*

Pulls data from google sheets and formats onto a browser page 

*/
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

var sheetsKey = urlParams.get("key")
const spreadsheetID = "1Tyw9fwdZgsHJoHzlE-0LPSEDOduRkZwL2UUNA-_4Xo4"

var totalElement = document.getElementById("total")
var todayElement = document.getElementById("today")

var updateRate = urlParams.get("update_rate") == null ? 10 : parseInt(urlParams.get("update_rate"))

var totalRunId = ""

// Opens http request
function httpGet(url){
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open("GET", url + "?key=" + sheetsKey, false)
    xmlHttp.send(null)
    return xmlHttp.responseText
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
 * @returns {number} An integer of current run number
 */
function getTotalRunID(){
    var response = getSheetData("100k Stats", "B5:B5")
    return parseInt(response[0][0].replaceAll(",",""))
}

/**
 * @returns The number of runs completed from the 100k sheet
 */
function getTodaysRuns(){
    return getSheetData("100k Stats", "E6:E6") 
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
}, updateRate * 1000)
