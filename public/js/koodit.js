function vahvistaArkistoon() {
    return confirm("Arkistoidaanko työnhaku?");
}

function vahvistaPoisto() {
    return confirm("Haluatko varmasti poistaa tiedot?");
}

function vahvistaMuokkaus() {
    return confirm("Tallennetaanko muokatut tiedot?");
}

function vahvistaUusiMuistiinpano() {
    return confirm("Lisätäänkö uusi muistiinpano?");
}

function vahvistaPoistoMuistiinpano() {
    return confirm("Poistetaanko tämä muistiinpano?");
}

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});
