$("#retrieve").on("click", function () {

    let dialogues = document.getElementById("dialogues");
    let stephanus = document.getElementById("stephanus").value
    let URN = dialogues.options[dialogues.selectedIndex].value + ".perseus-grc1:" + stephanus; 
    let queryURL = "http://www.perseus.tufts.edu/hopper/CTS?request=GetPassage&urn=" + "urn:cts:greekLit:tlg0059." + URN;

    console.log(queryURL)

    if (stephanus === "") {
        alert("Please enter a Stephanus number before submitting.")
    } else {$.ajax({url: queryURL,method: "GET"}).then(function(response) {

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
                    return obj;
                    console.log(obj);
            };

            //stores converted JSON object to variable
            let newJSON = xmlToJson(response);
            console.log(newJSON);

            //searches JSON object for greek text; heavily modified from https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-object
            function findGreekIn(convertedJSON) {
                var result = null

                //uses special kind of loop that iterates over all enumerable properties of an object in arbitrary order
                for(var prop in convertedJSON) {
                
                    //identifies which object keys are strings
                    if(typeof convertedJSON[prop] === "string") {

                        //searches each object-key-string for greek vowels
                        if(convertedJSON[prop].includes("α" || "ε" || "η" || "ι" || "ο" || "υ" || "ω")) {
                            $("#text").text(convertedJSON[prop]);
                            result = convertedJSON[prop];
                            console.log(result)
                
                        }
                    }

                    //searches for strings within arrays
                    if (convertedJSON[prop] instanceof Array) {

                        for (i=0; i < convertedJSON[prop].length; i++) {

                            //identifies which elements in the array are strings
                            if(typeof convertedJSON[prop][i] === "string") {

                                //searches each array-element-string for greek vowels
                                if(convertedJSON[prop][i].includes("α") || convertedJSON[prop][i].includes("ε") || convertedJSON[prop][i].includes("η") || convertedJSON[prop][i].includes("ι") || convertedJSON[prop][i].includes("ο") || convertedJSON[prop][i].includes("υ") || convertedJSON[prop][i].includes("ω")){
                                    $("#text").text(convertedJSON[prop][i]);
                                    result = convertedJSON[prop][i];
                                    console.log(result)
                                }
                            }
                        }
                    }
                }

                //function calls itself if no match was found, to search all the enumerable properties in the next level of the object
                if(convertedJSON[prop] instanceof Object) {
                    result = findGreekIn(convertedJSON[prop]);
                } 
            }
        findGreekIn(newJSON)
    });

    }
  
})

// search for entire alphabet: .includes("α" || "β" || "γ" || "δ" || "ε" || "ζ" || "η" || "θ" || "ι" || "κ" || "λ" || "μ" || "ν" || "ξ" || "ο" || "π" || "ρ" || "σ" || "ς" || "τ" || "υ" || "φ" || "χ" || "ψ" || "ω")
