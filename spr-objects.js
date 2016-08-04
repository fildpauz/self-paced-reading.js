/* 
 * Title: spr-objects.js
 * Author: Ralph L. ROSE
 * E-mail address: rose@waseda.jp
 * Description: This javascript library defines prototypes that may be used
 * to support the execution of a self-paced-reading experiment. It is designed
 * to be used by self-paced-reading.js 
 */

"use strict";

//var exptFixationchar;
//var exptMaskchar;

/*
 * The Region object defines a region of text to be displayed in
 * a self-paced-reading experiment.
 * @param id - The ID for this region
 * @param text - The string to be displayed at this region
 * @param index - The ordered index of this region within a sequence of regions
 * @param location - The location of this region relative to the region of interest
 * @param item - The experimental item that this region is a member of
 */
function Region(id, text, index, location, item){
    this.id = id;
    this.text = text;
    this.index = index;
    this.location = location;
    this.item = item;
    this.html = this.createHtml();
}

/*
 * Changes the currently displayed text content to masked text of equal length
 */
Region.prototype.mask = function(){
    var maskChar = exptMaskchar === 'undefined' ? "_" : exptMaskchar;
    this.html.textContent = text.replace(/./g, maskChar);
    return this;
};

/*
 * Changes the currently displayed masked text content to the region's predefined text
 */
Region.prototype.unmask = function(){
    this.html.textContent = this.text;
    return this;
};

/*
 * For the given region, a <span> object is created with the given ID and
 * index, and with text of length equal to the original text.
 * @param id - The ID for this region
 * @param text - The string to be displayed at this region
 * @param index - The ordered index of this region within a sequence of regions
 * @returns A <span> object with the associated mark-up
 */
Region.prototype.createHtml = function(){
    var s = document.createElement("span");
    s.id = this.id.concat(this.index);
    s.className = "region";
    s.textContent = this.text;
    return s;
};

/*
 * The Item object represents one experimental item containing a stimulus
 * (a set of self-paced-reading regions) and optionally a follow-up question
 * with response options and feedback
 * @param id - The ID for this item
 * @param text - The text string for this item where regions are delimited
 * with the vertical bar '|' and the region of interest (ROI) is surrounded
 * by curly braces: {}
 * @param isHorizontal - An optional parameter to indicate whether the regions
 * are presented horizontally (i.e., one-sentence stimuli) or vertically (i.e.,
 * multi-sentence stimuli). [default=true]
 */
function Item(id, text, isHorizontal){
    if (isHorizontal === 'undefined') { isHorizontal = true; }
    this.id = id;
    this.text = text; // Is it useful to store this as plain text: .replace(/\|/g, ' ') ?
    this.regions = this.parseRegions();
    this.curRegionIndex = 'undefined';   // The index of the current SPR region being displayed
    this.prompt = 'undefined';  // The prompt and options variables need to be
    this.options = 'undefined'; // explicitly set
    this.optionOrder = "fixed";
    this.condition = []; // An array of values representing the experimental conditions
    this.html = this.createHtml();
}

Item.prototype.show = function(frame){
    this.frame = frame;
    this.frame.appendChild(this.html); // add to DOM
    this.html.style.display = "block"; // show it
    this.curRegionIndex = -1; // represents the fixation mark
};

Item.prototype.hide = function(){
    this.html.style.display = "none";  // hide it
    this.frame.removeChild(this.html); // remove from DOM
};

Item.prototype.processKeypress = function(keyCode, elapsedTime){
    var result = "continue";
    switch (keyCode){
        case 32: // space bar
            if (this.curRegionIndex === -1){ // fixation mark is showing

            } else if (this.curRegionIndex < this.regions.length){ // non-final SPR region is showing

            } else if (this.curRegionIndex === this.regions.length){ // final SPR region is showing
                this.hide();
                result = "end of screen";
            } else { // prompt is showing, but other key pressed -- ignore
            }
            break;
        case 48: // digit 0
            this.hide();
            result = "end of screen";
            break;
        case 49: // digit 1
            this.hide();
            result = "end of screen";
            break;
        default:
            // Pressed other key -- do nothing
    }
    return result;
};

/*
 * 
 * @param item - The Item object from which the html object should be created
 * @returns A <div> object with the associated mark-up
 */
Item.prototype.createHtml = function(){
    var itemDiv = document.createElement("div");
    itemDiv.className = "item";
    itemDiv.id = this.id;
    var fixationP = document.createElement("p");
    fixationP.id = this.id.concat("-fixation");
    fixationP.className = "fixation";
    fixationP.textContent = exptFixationchar;
    itemDiv.appendChild(fixationP);
    if (this.isHorizontal){ // single-line SPR type
        // split string into regions
        var itemP = document.createElement("p"); // create p container for regions
        itemP.id = this.id.concat("-stimulus");
        itemP.className = "stimulus";
        // for each region
        for (var i=0; i<this.regions.length; i++){
            // add span to div
            if (i>0){
                var space = document.createTextNode(" ");
                itemP.appendChild(space);
            }
            itemP.appendChild(regions[i].mask().html);
        }
        itemDiv.appendChild(itemP);
    } else { // multi-line SPR type
        // TODO: create a multi-line version
    }
    // TODO: Create and append the prompt <div>, if any
    return itemDiv;
};

/*
 * Parses a region-delimited text (with '|'), creates Region objects for each
 * and returns an array of these objects.
 * @param id - The Item ID; will be used to create sub-IDs for Regions
 * @param text - The delimited text string to be parsed
 * @returns An array containing the Region objects
 */
Item.prototype.parseRegions = function(){
    var regionArr = [];
    var regions = this.text.split("|");
    var roiIndex = this.getRoi(regions);
    if (roiIndex != -1){
        regions[roiIndex] = regions[roiIndex].replace('{','').replace('}','');
    }
    for (var i=0; i<regions.length; i++){
        var region = new Region(this.id, regions[i], i+1, roiIndex, this);
        regionArr.push(region);
    }
    return regionArr;
};

/*
 * A helper function to find the region marked as the region of interest
 * @param regions - An array of texts representing the experimental regions
 * @returns An integer representing the 0-indexed region of the array marked
 * as the region of interest (with curly braces {}), or -1 if not found
 */
Item.prototype.getRoi = function(regions){
    var result = -1;
    for (var i=0; i<regions.length; i++){
        var r = regions[i].trim();
        if (r.charAt(0) === '{' && r.charAt(r.length-1) === '}'){
            result = i;
            break;
        }
    }
    return result;
};

/*
 * The Title object merely defines the parameters related to a title screen
 * @param text - The text of the title of the experiment
 * @param primaryInvestigators - An array of names of the primary investigators
 * @param otherInvestigators - An array of names of other investigators
 */
function Title(text, primaryInvestigators, otherInvestigators){
    this.text = text;
    this.primaryInvestigators = primaryInvestigators;
    this.otherInvestigators = otherInvestigators;
    this.html = this.createHtml();
    this.frame = 'undefined';
}

Title.prototype.show = function(frame){
    this.frame = frame;
    this.frame.appendChild(this.html); // add to DOM
    this.html.style.display = "block"; // show it
};

Title.prototype.hide = function(){
    this.html.style.display = "none";  // hide it
    this.frame.removeChild(this.html); // remove from DOM
};

Title.prototype.processKeypress = function(keyCode, elapsedTime){
    var result = "continue";
    switch (keyCode){
        case 32: // space bar
            this.hide();
            result = "end of screen";
            break;
        default:
            // Pressed other key -- do nothing
    }
    return result;
};

/*
 * Creates a <div> object to show the experiment title and investigators' names
 * @returns a <div> object containing the opening screen info
 */
Title.prototye.createHtml = function(){
    // create the title div
    var titleDiv = document.createElement("div");
    titleDiv.className = "title";
    // create and add the title
    var t = document.createElement("h1");
    t.textContent = this.text;
    titleDiv.appendChild(t);
    // create and add investigator info
    var investigators = document.createElement("p");
    investigators.className = "investigators";
    var pi = ""; // primary investigator list
    var oi = ""; // other investigator list
    for (var i=0; i<this.primaryInvestigators.length; i++){
        if (pi.length > 0) { pi = pi.concat(", "); }
        pi = pi.concat(this.primaryInvestigators[i]);
    }
    var primary = document.createElement("span");
    primary.className = "primary-investigators";
    primary.textContent = pi;
    for (var i=0; i<this.otherInvestigators.length; i++){
        if (oi.length > 0) { pi = pi.concat(", "); }
        oi = oi.concat(this.otherInvestigators[i]);
    }
    var other = document.createElement("span");
    other.className = "other-investigators";
    other.textContent = oi;
    investigators.appendChild(primary);
    var space = document.createTextNode(" ");
    investigators.appendChild(space);
    investigators.appendChild(other);
    titleDiv.appendChild(investigators);
    return titleDiv;
};

/*
 * The Instructions object merely defines the parameters related to an instructions screen
 * @param text - The instructions text (with html allowed)
 */
function Instructions(text){
    this.text = text;
    this.html = createHtml();
    this.frame = 'undefined';
}

/*
 * Shows the Instructions element
 * @param {type} frame - the DOM element inside which the Instructions will be shown
 */
Instructions.prototype.show = function(frame){
    this.frame = frame;
    this.frame.appendChild(this.html); // add to DOM
    this.html.style.display = "block"; // show it
};

/*
 * Hides the Instructions element and removes it from DOM.
 */
Instructions.prototype.hide = function(){
    this.html.style.display = "none";  // hide it
    this.frame.removeChild(this.html); // remove from DOM
};

Instructions.prototype.processKeypress = function(keyCode, elapsedTime){
    var result = "continue";
    switch (keyCode){
        case 32: // space bar
            this.hide();
            result = "end of screen";
            break;
        default:
            // Pressed other key -- do nothing
    }
    return result;
};

/*
 * Creates a <div> object to show the instructions
 * @returns a <div> object containing the instructions screen info
 */
Instructions.prototype.createHtml = function(){
    var instructionsDiv = document.createElement("div");
    instructionsDiv.className = "instructions";
    instructionsDiv.textContent = this.text;
    return instructionsDiv;
};

/*
 * The Screen object corresponds to one screen in the experimental process,
 * including a title screen, an instructions screen or a stimulus item screen.
 * Screen objects constitute the basic sequence of the experiment.
 * @param type - The type of screen: Title, Instructions, or Item
 * @param object - The object with information related to the screen
 * @param next - The next screen object in the experimental sequence
 */
function Screen(type, object, nextScreen){
    this.type = type; // possible values: title, instructions, item
    this.object = object;
    this.nextScreen = nextScreen; // Not sure this is needed
}

Screen.prototype.processKeypress = function(keyCode, elapsedTime){
    return this.object.processKepress(keyCode, elapsedTime);
};

/*
 * The Experiment object corresponds to the whole experiment and contains all
 * the parameters, settings and stimuli of the experiment. It is the top-level
 * object in the SPR architecture.
 * @param design - A json-formatted object containing the experimental design
 * @param form - the html <form> object that will handle the data values on submit
 */
function Experiment(design, form){
    // General experiment settings and parameters
    this.title = design["title"] !== 'undefined' ? design["title"].trim() : "A Self-paced Reading Experiment";
    this.fontname = design["font-name"] !== 'undefined' ? design["font-name"].trim() : "Courier new";
    this.fontsize = design["font-size"] !== 'undefined' ? design["font-size"].trim() : "12";
    // Following colors must be HTML supported color names; e.g., http://www.w3schools.com/colors/colors_names.asp
    this.textcolor = design["text-color"] !== 'undefined' ? design["text-color"].trim() : "black";
    this.textcolor = validTextColour(this.textcolor) ? this.textcolor : "black";
    this.backgroundcolor = design["background-color"] !== 'undefined' ? design["background-color"].trim() : "white";
    this.backgroundcolor = validTextColour(this.backgroundcolor) ? this.backgroundcolor : "white";
    this.display = design["display"] !== 'undefined' ? design["display"].trim() : "Moving window";
    // Following must be only one character in length
    this.fixationchar = design["fixation-character"] !== 'undefined' ? design["fixation-character"].trim().substr(0,1) : "+";
    this.maskchar = design["masking-character"] !== 'undefined' ? design["masking-character"].trim().substr(0,1) : "_";
    
    // Info about json object containing experimental design
    this.design = design; // json object containing the design, stimuli, etc.
    this.designValidated = false;    // Boolean to indicate whether design file has been validated

    // variables for experiment flow and execution
    this.form = form;
    this.frame = createFrame();
    this.screens = [];  // List of all screen divs in the experiment: title, instructions, stimulus items
    this.curScreenIndex;   // The index of the current screen in screenInfo array being displayed.
    this.startTime;     // The start time of the experiment. Timing results are relative to this.
}

Experiment.prototype.startExperiment = function(){
    this.startTime = Date.now();
    document.body.addEventListener("keypress", this.processKeypress);
    window.focus();  // to make sure the window is listening for keypress events
    this.curScreenIndex = 0;
    this.screens[curScreenIndex].object.show();
};

Experiment.prototype.processKeypress = function(e){
    var elapsedTime = Date.now() - this.startTime;
    var keyCode = e.keyCode;
    var result = this.screens[curScreenIndex].processKeypress(keyCode, elapsedTime);
    if (result == "end of screen"){
        this.curScreenIndex++;
    }
    if (curScreenIndex < screens.length){
        this.screens[curScreenIndex].show(this.frame);
    } else {
        this.endExperiment();
    }
};

Experiment.prototype.endExperiment = function(){
    document.body.removeEventListener("keypress", processKeypress);
    this.frame.style.display = "none";
    this.form.removeChild(this.frame);
    // TODO: Optional data export to screen (so experimenter can copy-and-paste)?
    // TODO: Optional data export of experiment log?
};

Experiment.prototype.loadStimuli = function(){
    // TODO!
};

/*
 * 
 * @returns A <div> object representing the main experiment frame
 */
Experiment.prototype.createFrame = function(){
  var frame = document.createElement("div");
  frame.className = "experiment-frame";
  document.body.appendChild(frame);
  return frame;
};

// Helper functions for validating design
Experiment.prototype.validateDesign = function(){
    sprLog("Validating design");
    var result = true;
    // Check structure of pre-practice instructions
    sprLog("Checking pre-practice instruction screens");
    if (this.design["instruction-screens"]){
        if (!this.isValidInstructionScreen(this.design["instruction-screens"])){
            result = false;
        }
    } else {
        sprLog("No pre-practice instruction screens");
    }
    // Check structure of practice items
    sprLog("Checking practice stimuli");
    if (this.design["practice-stimuli"]){
        if (!this.isValidGroup(this.design["practice-stimuli"])){
            result = false;
        }
    } else {
        sprLog("No practice stimuli");
    }
    // Check structure of post-practice instructions
    sprLog("Checking post-practice instruction screens");
    if (this.design["post-practice-instruction-screens"]){
        if (!this.isValidInstructionScreen(this.design["post-practice-instruction-screens"])){
            result = false;
        }
    } else {
        sprLog("No post-practice instruction screens");
    }
    // Check structure of experimental stimuli
    sprLog("Checking experimental-stimuli");
    if (this.design["experiment-stimuli"]){
        if (!this.isValidExptStimuli(this.design["experiment-stimuli"])){
            result = false;
        }
    } else {
        displayErrorMessage("No experimental stimuli section was found in the json object");
        sprLog("No experimental stimuli section was found in the json object");
        result = false;
    }
    return result;
};

Experiment.prototype.isValidExptStimuli = function(stimuli){
    var result = true;
    if (!stimuli["stimuli-sets"]){
        displayErrorMessage("No 'stimuli-sets' name-value pair in experimental stimuli section");
        sprLog("No 'stimuli-sets' name-value pair in experimental stimuli section");
        result = false;
    } else if (stimuli["stimuli-sets"].length < 1){
        displayErrorMessage("No 'stimuli-set' found in experimental stimuli sets section");
        sprLog("No 'stimuli-set' found in experimental stimuli sets section");
        result = false;
    } else {
        for (var i=0; i<stimuli["stimuli-sets"].length; i++){
            if (typeof(stimuli["stimuli-sets"][i]["stimuli-set"]) === 'undefined') {
                displayErrorMessage("Unknown name in stimuli: expected 'stimuli-set'");
                sprLog("Unknown name in stimuli: expected 'stimuli-set'");
                result = false;
            } else if (!isValidStimuliSet(stimuli["stimuli-sets"][i]["stimuli-set"])){
                result = false;
            }
        }
    }
    return result;
};

Experiment.prototype.isValidStimuliSet = function(stimuliSet){
    var result = true;
    if (!stimuliSet["groups"]){
        displayErrorMessage("No 'group' name-value pair in experimental stimuli section");
        sprLog("No 'group' name-value pair in experimental stimuli section");
        result = false;
    } else if (stimuliSet["groups"].length < 1){
        displayErrorMessage("No stimuli 'group' found in experimental stimuli section");
        sprLog("No stimuli 'group' found in experimental stimuli section");
        result = false;
    } else {
        for (var i=0; i<stimuliSet["groups"].length; i++){
            if (typeof(stimuliSet["groups"][i]["group"]) === 'undefined') {
                displayErrorMessage("Unknown name in stimuli: expected 'group'");
                sprLog("Unknown name in stimuli: expected 'group'");
                result = false;
            } else if (!isValidGroup(stimuliSet["groups"][i]["group"])){
                result = false;
            }
        }
    }
    return result;
};

Experiment.prototype.isValidInstructionScreen = function(instructions){
    var result = true;
    for (var i=0; i<instructions.length; i++){
        if (typeof(instructions[i]["instruction-screen"]) === 'undefined'){
            displayErrorMessage("Unknown name in instructions: expected 'instruction-screen'");
            sprLog("Unknown name in instructions: expected 'instruction-screen'");
            result = false;
        } else if (instructions[i].length < 1){ // Will this allow an array?
            displayErrorMessage("Empty string in instructions");
            sprLog("Empty string in instructions");
            result = false;
        }
    }
    return result;
};

Experiment.prototype.isValidGroup = function(group){
    var result = true;
    if (!group["items"]){
        displayErrorMessage("No 'items' name-value pair in stimuli");
        sprLog("No 'items' name-value pair in stimuli");
        result = false;
    } else if (group["items"].length < 1){
        displayErrorMessage("No 'item' found in items list");
        sprLog("No 'item' found in items list");
        result = false;
    } else {
        for (var i=0; i<group["items"].length; i++){
            if (typeof(group["items"][i]["item"]) === 'undefined'){
                displayErrorMessage("Unknown name in items: expected 'item'");
                sprLog("Unknown name in items: expected 'item'");
                result = false;
            } else if (!isValidItem(group["items"][i]["item"])){
                result = false;
            }
        }
    }
    return result;
};

Experiment.prototype.isValidItem = function(item){
    var result = true;
    if (!item["id"]){
        displayErrorMessage("Stimulus item has no id");
        sprLog("Stimulus item has no id");
        result = false;
    } else {
        sprLog("Checking item: " + item["id"]);
        if (!item["strings"]){
            if (!item["string"]){
                displayErrorMessage("Item has no string(s)!");
                sprLog("Item has no string(s)!");
                result = false;
            } else if (item["string"].length < 1){
                displayErrorMessage("Empty string found!");
                sprLog("Empty string found!");
                result = false;
            }
        } else {
            for (i=0; i<item["strings"].length; i++){
                if (typeof(item["strings"][i]["string"]) === 'undefined'){
                    displayErrorMessage("Unknown name in strings: expected 'string'");
                    sprLog("Unknown name in strings: expected 'string'");
                    result = false;
                } else if (item["strings"][i]["string"].length < 1) {
                    displayErrorMessage("Empty string found!");
                    sprLog("Empty string found!");
                    result = false;
                }
            }
        }
    }
    return result;
};

//// Logging and error reporting

/*
 * Log administrative messages about experiment operation
 */
function sprLog(message){
    console.log(Date() + ": " + message);
    // TODO: Store the messages in a variable and submit together with expt data
}

/*
 * Display an error box with an error message
 */
function displayErrorMessage(message){
    alert(message);
}

//// General Helper Functions

/*
 * Check that the color name provided is one of the 147 HTML valid color names
 * (e.g., http://www.w3schools.com/colors/colors_hex.asp).
 * Credit: http://stackoverflow.com/questions/6386090/validating-css-color-names
 * @param stringToTest - the string to be tested for validity (e.g., black, red)
 * @returns true if string is a valid color name; false otherwise
 */
function validTextColour(stringToTest) {
    //Alter the following conditions according to your need.
    if (stringToTest === "") { return false; }
    if (stringToTest === "inherit") { return false; }
    if (stringToTest === "transparent") { return false; }

    var image = document.createElement("img");
    image.style.color = "rgb(0, 0, 0)";
    image.style.color = stringToTest;
    if (image.style.color !== "rgb(0, 0, 0)") { return true; }
    image.style.color = "rgb(255, 255, 255)";
    image.style.color = stringToTest;
    return image.style.color !== "rgb(255, 255, 255)";
}

/*
 * Shuffles an array object in place and returns the object
 * Credit: https://github.com/coolaj86/knuth-shuffle
 * @param an array
 * @return the shuffled array
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}