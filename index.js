/*

Pulls data from google sheets and formats onto a browser page 

*/
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

var sheetsKey = urlParams.get("key")
const spreadsheetID = "1Tyw9fwdZgsHJoHzlE-0LPSEDOduRkZwL2UUNA-_4Xo4"

var totalElement = document.getElementById("total")
var todayElement = document.getElementById("today")

var updateRate = urlParams.get("update_rate") == null ? 30 : parseInt(urlParams.get("update_rate"))

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
 * @returns Dictionary with two string int pairs correlating to total and todays run counts
 */
function getRunTotals(){
    var data = getSheetData("100k Stats", "B5:E6")
    return {
        "total": parseInt(data[0][0].replaceAll(",","")),
        "today": parseInt(data[1][3])
    }
}

/**
 * Updates the total and today elements
 */
function updateCounter(){
    var runCounts = getRunTotals()
    totalElement.innerHTML = "Total: " + runCounts["total"].toString()
    todayElement.innerHTML = "Today: " + runCounts["today"].toString()
}

//Runs counter update on load
updateCounter()

//Checks ever 10 seconds if a new run is on the sheet. Updates counter if so
window.setInterval(function(){
    updateCounter()
}, updateRate * 1000)
