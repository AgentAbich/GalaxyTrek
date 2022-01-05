// ==UserScript==
// @name        GT Abfang Zentrale
// @namespace   GT Abfang Zentrale
// @version     1.1
// @match       https://galaxytrek.com/*
// @run-at      document-end
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

   var aFlightIDs = []; // Array zum zwischenspeichern der Flüge, damit nur das erste auftreten verarbeitet wird und nicht jede übertragung

    (function(open){
        XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
            this.addEventListener("readystatechange", function() {
                var iStatus = this.readyState;
                var sResponseText = this.responseText;
                //aktion 6 --> Spionage
                //aktion 7 --> Handelsflug
                //aktion 1 --> Angriff
                //aktion 10 --> Saveflug
                if (sResponseText.includes('"event":"moves"') === true && sResponseText.includes('"aktion":1,') === true && iStatus == 4)
                {
                    _GT_AusgabeAbfangdaten(sResponseText);
                }
                if (sResponseText.includes('"event":"moves"') === true && sResponseText.includes('"aktion":6,') === true && iStatus == 4)
                {
                    _GT_FlotteHochhebenbeiSpio(sResponseText);
                }
            }, false);
            open.call(this, method, url, async, user, pass);
        };
    })(XMLHttpRequest.prototype.open);

    function _GT_AusgabeAbfangdaten(sResponseText)
    {
        var dd = new Date(0); //init als epoch

        // RegEx auf das Response und extrahieren der Zeiten
        var sTimeStampMoves = sResponseText.match(/timestamp":(\d+),/); //epoch mit milisekunden
        var sAttackerArrival = sResponseText.match(/arrival":([^,]+),[^,]+,[^,]+,[^,]+,"aktion":1,/); //epoch ohne milisekunden
        // Umwandeln von String auf Int
        var iEpochTimeStampMoves = parseInt((sTimeStampMoves[1]));
        var iEpochAttackerArrival = parseInt(sAttackerArrival[1]*1000);
        // Berechnen der Flugzeit und Startzeit
        var iAttackerFlightDuration = (iEpochAttackerArrival - iEpochTimeStampMoves);
        var iAttackerStart = iAttackerFlightDuration + iEpochAttackerArrival;

        dd.setUTCMilliseconds(iAttackerStart); // setzen der Sekunden

        console.log("TIMESTAMP der Flottenübertragung --> " + iEpochTimeStampMoves); // Zeitstempel der Flottenübertragung
        console.log("ANKUNFT der gegnerischen Flotte  --> " + iEpochAttackerArrival);
        console.log("ANGRREIFERFLUGZEIT  --> " + iAttackerFlightDuration);
        console.log("RUECKKEHR der Angreifenden Flotte epoch  --> " + parseInt(iAttackerStart/1000));
        console.log("RUECKKEHR der Angreifenden Flotte lesbar (aber ACHTUNG ist lokale ClientPC Zeit)--> " + dd.toLocaleString());
        //ANzeige der Flottenbewegung im NavHeader, unterhalb der Landesflaggen
        //document.getElementById('id_navheader').innerHTML = document.getElementById('id_navheader').innerHTML + 'Return: ' + dd.getHours() + ":" + dd.getMinutes()+ ":" + dd.getSeconds() + "\n" + parseInt(dd.getTime()/1000) + "\n";

        SoundAbspielen();

        aFlightIDs.push(aFlugdaten[1]); // FlightID ins Array aufnehmen, damit nicht doppelt verarbeitet wird

    };

    function _GT_FlotteHochhebenbeiSpio(sResponseText)
    {

        console.log('Spio entdeckt');
        var aFlugdaten = sResponseText.match(/"id":"(\d+)","\w+":\d+,"\w+":\d+,"\w+":\d+,"\w+":(\d+),"\w+":\d+,"\w+":\d+,"\w+":(\d+),"aktion":6/);

        if (aFlightIDs.indexOf(aFlugdaten[1]) <0) // <0 ID ist nicht im Array enthalten
        {
            //Flotte prüfen und zusammenstellen

            SoundAbspielen();
//--------------------------------------
                var dd = new Date(0); //init als epoch

    // RegEx auf das Response und extrahieren der Zeiten
    var sTimeStampMoves = sResponseText.match(/timestamp":(\d+),/); //epoch mit milisekunden
    var sAttackerArrival = sResponseText.match(/arrival":([^,]+),[^,]+,[^,]+,[^,]+,"aktion":6,/); //epoch ohne milisekunden
    // Umwandeln von String auf Int
    var iEpochTimeStampMoves = parseInt((sTimeStampMoves[1]));
    var iEpochAttackerArrival = parseInt(sAttackerArrival[1]*1000);
    // Berechnen der Flugzeit und Startzeit
    var iAttackerFlightDuration = (iEpochAttackerArrival - iEpochTimeStampMoves);
    var iAttackerStart = iAttackerFlightDuration + iEpochAttackerArrival;

    dd.setUTCMilliseconds(iAttackerStart); // setzen der Sekunden

    console.log("TIMESTAMP der Flottenübertragung --> " + iEpochTimeStampMoves); // Zeitstempel der Flottenübertragung
    console.log("ANKUNFT der gegnerischen Flotte  --> " + iEpochAttackerArrival);
    console.log("ANGRREIFERFLUGZEIT  --> " + iAttackerFlightDuration);
    console.log("RUECKKEHR der Angreifenden Flotte epoch  --> " + parseInt(iAttackerStart/1000));
    console.log("RUECKKEHR der Angreifenden Flotte lesbar (aber ACHTUNG ist lokale ClientPC Zeit)--> " + dd.toLocaleString());

// --------------------------------------

            //Flotte hocheben
            ICommands.vxSetSaveTime(parseInt(iEpochAttackerArrival+312111)); // Setzen der Savedauer abhängig von der Flugdauer des angreifers
            ICommands.vxStartSave();
            console.log("Save druchgeführt");
            //sys.SocketIO.request({"script":"commands","query":{"310":["1"],"page":["3"],"zpx":[user.planets.data[aFlugdaten[3]].ppx.toString()],"zpy":[user.planets.data[aFlugdaten[3]].ppy.toString()],"zpz":[user.planets.data[aFlugdaten[3]].ppz.toString()],"rplanet":[aFlugdaten[3]],"speed":["15"],"aktion":["10"],"pm":["(Metall)"],"pk":["(Kristall)"],"pt":["(Tritium)"],"gm":["(Metall)"],"gk":["(Kristall)"],"gt":["(Tritium)"],"abschicken":["1"],"PlanetID":aFlugdaten[3]}});
            //console.log(aFlugdaten);
            aFlightIDs.push(aFlugdaten[1]); // FlightID ins Array aufnehmen, damit nicht doppelt verarbeitet wird
        }



        //console.log(aFlightIDs)


    };


    //Soundausgabe bei Angriff -> http://www.freesfx.co.uk/rx2/mp3s/5/16926_1461333031.mp3
    //
    function SoundAbspielen() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        snd.play();
    };




})();
