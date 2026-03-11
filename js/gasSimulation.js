const CANVAS = document.getElementById("gas-meter-canvas");
const CONTEXT = CANVAS.getContext("2d");

const CANVAS_HEIGHT = 150;
const CANVAS_WIDTH = 304;

const dollarPerGallon = document.getElementById("user-input");
const totalCost = document.getElementById("total-amount");
const gasAmount = document.getElementById("gas-amount");
const errorMessage = document.getElementById("error");
const stopRestartBtn = document.getElementById("stop-restart");
const fillBtn = document.getElementById("fill");

let maxGallons = CANVAS_HEIGHT;
let gasRate = 0;
let currentTotal = 0;
let price = 0;
let oldPrice = 0;

let currentMeterAmount = 0;
let runningInterval = null; // stores a reference to the current interval
let canFill = true;
let isStopped = false;
let finishedFill = false;

// meter background
CONTEXT.fillStyle = "gray";
CONTEXT.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

// let meter = {
//     x: 0,
//     y: 0,
//     width: CANVAS_WIDTH, 
//     height: currentMeterAmount
// }

let meter = {
    x: 0,
    y: CANVAS_HEIGHT,
    width: CANVAS_WIDTH, 
    height: currentMeterAmount
}

// switch the text to Continue or fill depending on the text
function switchText(fuelDoneStatus) {
    if (fuelDoneStatus === true) {
        fillBtn.innerHTML = "Refill";
    } else {
        if (validateGasChange() === true && gasRate > 0) {
            fillBtn.innerHTML = "Continue";
        }
    }
}

// validate if the old price is equal to the new price
function validateGasChange() {
    // a change has or has not happened
    return (Number(price) === Number(oldPrice));
}

// when the user hits fill, we want to take the given dollar amount find the proper rate of gas for every cent
function calculateGasRate() {
    oldPrice = price;
    price = dollarPerGallon.value;

    if (isNaN(price)) {
        errorMessage.innerHTML = "The value must be a number ...";
        return false;
    } else if (price === "" || price == 0) {
        errorMessage.innerHTML = "The value cannot be empty (or zero) ...";
        return false;
    } else {
        errorMessage.innerHTML = "";
    }

    if (validateGasChange() == false && gasRate > 0) {
        console.log("clearing");
        clearScreen();
    }

    let priceInCents = price * 100;
    gasRate = 1 / priceInCents;
}

// start the gas-filling process
function fill() {
    if (calculateGasRate() === false) {
        return;
    }

    if (canFill === true || finishedFill === true) {
        if (finishedFill === true) {
            currentTotal = 0;
            totalCost.value = currentTotal;
            finishedFill = false;
        }

        canFill = false;
        runningInterval = setInterval(function() {
            // clear the canvas
            CONTEXT.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // meter background
            CONTEXT.fillStyle = "gray";
            CONTEXT.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // meter
            CONTEXT.fillStyle = "black";
            CONTEXT.fillRect(0, CANVAS_HEIGHT - currentMeterAmount, CANVAS_WIDTH, currentMeterAmount);

            // scale factor for our visual representation
            let scaleFactor = Number((maxGallons / 12).toFixed(2));

            currentMeterAmount += gasRate * scaleFactor;
            currentTotal += 0.01;
            totalCost.value = Number(currentTotal.toFixed(2));         // cost increases by one cent
            
            // remove the scale factor to represent the actual value again before we display it
            gasAmount.value = Number((currentMeterAmount / scaleFactor).toFixed(4));

            // check if our gas level is greater than the maxGallon capacity
            if (currentMeterAmount >= maxGallons) {
                currentMeterAmount = 0;
                gasRate = 0;
                finishedFill = true;

                fillBtn.innerText = "Refill";
                clearInterval(runningInterval);
                return;
            } else {
                fillBtn.innerText = "Fill";
            }
        }, 1000/60);
    }
}

// stop the gas-filling process
function stop() {
    // validateGasChange();
    
    //switchText(finishedFill);
    if (finishedFill === true && currentMeterAmount >= maxGallons) {     // only give the ability to reset if we finished filling up gas
        // clear the canvas
        CONTEXT.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // meter background
        CONTEXT.fillStyle = "gray";
        CONTEXT.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        currentTotal = 0;
        gasRate = 0;
        totalCost.value = currentTotal;

        finishedFill = false;
    }
    canFill = true;

    clearInterval(runningInterval);
}

// clear everything (make a blank slate)
function clearScreen() {
    // clear the canvas
    CONTEXT.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // meter background
    CONTEXT.fillStyle = "gray";
    CONTEXT.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    finishedFill = false;
    canFill = true;

    // price = 0;
    gasRate = 0;
    currentMeterAmount = 0;
    currentTotal = 0;

    gasAmount.value = 0.0000;
    totalCost.value = 0.00;
    // dollarPerGallon.value = 0.00;

    errorMessage.innerHTML = "";

    if (runningInterval != null) {
        clearInterval(runningInterval);
    }
}