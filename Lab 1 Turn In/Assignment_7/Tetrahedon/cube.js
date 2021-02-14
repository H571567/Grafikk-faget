"use strict";

// connects HTML and JavaScript

// Get buttons from the DOM
let rotateXButton = document.getElementById("rotateX")
let rotateYButton = document.getElementById("rotateY")
let rotateZButton = document.getElementById("rotateZ")

// Create a controller for the cube app
let controller = new CubeController();

// listener functions
// needed because a callback of a method don't work
function xButton() {
    controller.xButtonClicked()
}

function yButton() {
    controller.yButtonClicked()
}

function zButton() {
    controller.zButtonClicked()
}

// Add listeners to events and let the controller take actions
rotateXButton.addEventListener("click", xButton)
rotateYButton.addEventListener("click", yButton)
rotateZButton.addEventListener("click", zButton)
