let classicsHTML = [];
let classicsClean = [];
let startPoint = "103a"; //defaults to first data-start attribute of the first dialogue option
let endPoint = "";
let work = "";
stephanus = "103a";
isNextChosen = false; 

function updateCurrentStephanus () {
    $("#current-stephanus").text(stephanus);
}

function createCleanJSONObject (author, authorID, work, workID, passage, passageURN, text) {
    let json = {
        author,
        authorID,
        work,
        workID,
        passage,
        passageURN,
        text
    };

    //thanks to https://codepen.io/adrianparr/pen/VeyeVP for JSON formatting
    let formattedJSON = JSON.stringify(json, undefined, 4);
    $("#json").text(formattedJSON)

}

function xmlToGreek () {

classicsHTML = [];
classicsClean = [];

    //determines stephanus number: either user's choice, or the default for a certain dialogue, or the result of the "next" button
    if (isNextChosen === false) {
        if (document.getElementById("stephanus").value === "") {
            stephanus = startPoint
        } else {
            stephanus = document.getElementById("stephanus").value
        }
        updateCurrentStephanus();
    } 

    //building the queryURL that the AJAX call will use
        let dialogues = document.getElementById("dialogues");
        //adds the dialogue-specific identifier (tlg001-tlg035) to the call for a greek text 
        let endOfURN = dialogues.options[dialogues.selectedIndex].value + ".perseus-grc1:" + stephanus; 
        //plato's author number is tlg0059, and it must come first in the URN
        let queryURL = "http://www.perseus.tufts.edu/hopper/CTS?request=GetPassage&urn=" + "urn:cts:greekLit:tlg0059." + endOfURN;

    //links html to the xml file
    $("a#xml").attr("href", queryURL);
        
    $.ajax(
        {url: queryURL,
            method: "GET"})
            .then(function(response) {
            
        // changes XML response from Perseus Project API to JSON object; function credit to https://davidwalsh.name/convert-xml-json
        function xmlToJson(xml) {
            
            // create the return object
            var obj = {};
            
            if (xml.nodeType == 1) { // element
                // do attributes
                if (xml.attributes.length > 0) {
                    obj["@attributes"] = {};
                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            } else if (xml.nodeType == 3) { // text
                obj = xml.nodeValue;
            }
            
                //do children
                if (xml.hasChildNodes()) {
                    for(var i = 0; i < xml.childNodes.length; i++) {
                        var item = xml.childNodes.item(i);
                        var nodeName = item.nodeName;
                        if (typeof(obj[nodeName]) == "undefined") {
                            obj[nodeName] = xmlToJson(item);
                        } else {
                            if (typeof(obj[nodeName].push) == "undefined") {
                                var old = obj[nodeName];
                                obj[nodeName] = [];
                                obj[nodeName].push(old);
                            }
                            obj[nodeName].push(xmlToJson(item));
                        }
                    }
                }

                //prints pre-cleaned JSON to screen
                let formattedJSON = JSON.stringify(obj, undefined, 4);
                $("#old-json").text(formattedJSON)
               
                return obj;
        };

        //stores converted JSON object to variable
        let newJSON = xmlToJson(response);

        //searches JSON object for greek text; heavily modified from https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-object
        function findGreekIn(convertedJSON) {

            //uses special kind of loop that iterates over all enumerable properties of an object (or array?) in arbitrary order
            for(var prop in convertedJSON) {
            
                //identifies which object keys are strings
                if(typeof convertedJSON[prop] === "string") { //this check must be present because the .includes method only works on strings

                    //searches each object-key-string for greek vowels
                    if(convertedJSON[prop].includes("α") || convertedJSON[prop].includes("ε") || convertedJSON[prop].includes("η") || convertedJSON[prop].includes("ι") || convertedJSON[prop].includes("ο") || convertedJSON[prop].includes("υ") || convertedJSON[prop].includes("ω")) {
                        classicsHTML.push(convertedJSON[prop] + "<br><br>");
                        classicsClean.push(convertedJSON[prop]);
                        $(".text").html(classicsHTML);
                    }
                } 

                    //function calls itself if no match was found, to search all the enumerable properties in the next level of the object or array
                    else if (convertedJSON[prop] instanceof Object || convertedJSON[prop] instanceof Array) {
                        findGreekIn(convertedJSON[prop]);
                    }
                }
            }
        findGreekIn(newJSON)
        isNextChosen = false;

        //pass all information to the clean JSON object creator
        //these commmands 
        let author = "Plato"
        let authorID = "tlg0059";
        let workID = dialogues.options[dialogues.selectedIndex].value;
        let passage = stephanus;
        let passageURN = queryURL;
        let text = classicsClean;
        createCleanJSONObject(author, authorID, work, workID, passage, passageURN, text)
    })
};

//event listeners
$("select").change(function() {
    work = $(this).find(":selected").data("work");
    startPoint = $(this).find(":selected").data("start");
    stephanus = startPoint;
    endPoint = $(this).find(":selected").data("end");
    document.getElementById("stephanus").value = "";
});

//custom function to increment stephanus number
$("#next").on("click", function () {
    isNextChosen = true;
    let stephanusLetter = stephanus.charAt((stephanus.length - 1));
    let stephanusPage = stephanus.slice(0, -1);
    switch(stephanusLetter) {
        case "a":
            stephanusLetter = "b";
            break;
        case "b":
            stephanusLetter = "c";
            break;
        case "c":
            stephanusLetter = "d";
            break;
        case "d":
            stephanusLetter = "e";
            break;
        case "e":
            stephanusLetter = "a";
            stephanusPage = parseInt(stephanusPage);
            stephanusPage++  
            break;
        }
        newStephanusNumber = stephanusPage + stephanusLetter;
        stephanus = newStephanusNumber;
        updateCurrentStephanus();
        xmlToGreek();
});

//custom function to decrement stephanus number
$("#previous").on("click", function () {
    isNextChosen = true;
    let stephanusLetter = stephanus.charAt((stephanus.length - 1));
    let stephanusPage = stephanus.slice(0, -1);
    switch(stephanusLetter) {
        case "a":
            stephanusLetter = "e";
            stephanusPage = parseInt(stephanusPage);
            stephanusPage-- 
            break;
        case "b":
            stephanusLetter = "a";
            break;
        case "c":
            stephanusLetter = "b";
            break;
        case "d":
            stephanusLetter = "c";
            break;
        case "e":
            stephanusLetter = "d"; 
            break;
        }
        newStephanusNumber = stephanusPage + stephanusLetter;
        stephanus = newStephanusNumber;
        updateCurrentStephanus();
        xmlToGreek();
});

// thanks to https://stackoverflow.com/questions/37658524/copying-text-of-textarea-in-clipboard-when-button-is-clicked
$(".copy").click(function(){
    $("textarea").select();
    document.execCommand('copy');
});

$("#retrieve").on("click", function () {
    xmlToGreek();    
})

// search for entire alphabet: if(convertedJSON[prop].includes("α" || "β" || "γ" || "δ" || "ε" || "ζ" || "η" || "θ" || "ι" || "κ" || "λ" || "μ" || "ν" || "ξ" || "ο" || "π" || "ρ" || "σ" || "ς" || "τ" || "υ" || "φ" || "χ" || "ψ" || "ω" || "Α" || "Β" || "Γ" || "Δ" || "Ε" || "Ζ" || "Η" || "Θ" || "Ι" || "Κ" || "Λ" || "Μ" || "Ν" || "Ξ" || "Ο" || "Π" || "Ρ" || "Σ" || "Τ" || "Υ" || "Φ" || "Χ" || "Ψ" || "Ω" || "ά" || "ὰ" || "ᾶ" || "ᾳ" || "έ" || "ὲ" || "ή" || "ὴ" || "ῆ" || "ῃ" || "ί" || "ὶ" || "ῖ" || "ό" || "ὸ" || "ώ" || "ὼ" || "ῶ" || "ῳ" || "ὦ" || "εῖ" || "οῦ" || "αῦ" || "αῖ" || "εῦ" || "οῖ" || "υῖ" || "ηῦ"))