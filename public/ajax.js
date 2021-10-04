console.log("ajax.js OK");

var urlap = document.getElementById("urlap");
var naptar = document.getElementById("naptar");
var uzenet = document.getElementById("uzenet");

var selectTemplate = `
<form action="" onsubmit="return false" id="foglalo">
    <label for="vendegneve">Vendég neve: </label>
    <input type="text" name="vendegneve" id="vendegneve" placeholder="Az Ön teljes neve"><br>
    <label for="select">Válasszon fodrászt: </label>
    <select name="select" id="select"><option value=""></option></select><br>
    <label for="datum">Dátum: </label>
    <input type="date" name="datum" id="datum"><br>
    <label for="szabad">Időpontok: </label>
    <select name="szabad" id="szabad"></select><br>
    <button id="lefoglal">Lefoglalom</button>
</form>
`;

function request(method, url, cbfn){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){
            cbfn(this.responseText);
        }
    }
    xhttp.open(method, url);
    xhttp.send();
}

function renderForm(ido) {
    urlap.innerHTML = "";
    naptar.innerHTML = "";
    urlap.innerHTML += selectTemplate;
    var select = document.getElementById("select");
    for (let i = 0; i < ido.length; i++) {
        select.innerHTML += `<option value="${i}">${ido[i].nev}</option>`;
    }
    document.getElementById("select").onchange = function() {
        if (document.getElementById("select").value != "") {
            var selected = document.getElementById("select").value;
            var nyitvaTartas = ido[selected].nyitvatartas;
            var fodraszNev = ido[selected].nev;
            var fodraszKep = ido[selected].img;
            document.getElementById("datum").value = "";
            document.getElementById("szabad").innerHTML = "";
            renderNaptar(nyitvaTartas, fodraszNev, fodraszKep);
        } else {
            naptar.innerHTML = "";
            document.getElementById("datum").value = "";
            document.getElementById("szabad").innerHTML = "";
        }
    }
    document.getElementById("datum").onchange = function() {
        var nap = document.getElementById("datum").value;
        var szabadSelect = document.getElementById("szabad");
        var aznap = new Date(nap).getDay();
        var table = ido[document.getElementById("select").value].nyitvatartas;
        var foglalt = ido[document.getElementById("select").value].idopontfoglalas;
        var idopontok = table.filter(elem => {
            return elem.napindex == aznap;
        });
        if (idopontok.length < 1) {
            szabadSelect.innerHTML = "";
            szabadSelect.innerHTML += `<option value="foglalt">Nincs időpont</option>`;
        } else {
            var tol = parseInt(idopontok[0].tol);
            var ig = parseInt(idopontok[0].ig);
            var foglaltTomb = [];
            for (var i = tol; i < ig; i++) {
                for (var j = 0; j < foglalt.length; j++) {
                    if (i == parseInt(foglalt[j].ora) && nap == foglalt[j].datum) {
                        foglaltTomb.push(parseInt(foglalt[j].ora));
                    } 
                }
            } 
            szabadSelect.innerHTML = "";
            for (var k = tol; k < ig; k++) {
                if (foglaltTomb.includes(k)) {
                    szabadSelect.innerHTML += `<option class="red" value="foglalt" disabled>${k} óra - már foglalt</option>`;
                } else {
                    szabadSelect.innerHTML += `<option value="${k}">${k} óra</option>`;
                }
            }
        }
    }
    document.getElementById("lefoglal").onclick = function() {
        if (document.getElementById("szabad").value === "foglalt" || document.getElementById("szabad").innerHTML === "") {
            naptar.innerHTML = `<p class="fontos">Kérjük, töltse ki megfelelően az űrlapot!</p>`;
        } else if (document.getElementById("vendegneve").value === "") {
            naptar.innerHTML = `<p class="fontos">Kérjük, adja meg a nevét!</p>`;
        } else {
            var fodraszNeve = ido[document.getElementById("select").value].nev;
            var vendegNeve = document.getElementById("vendegneve").value;
            var vendegNap = document.getElementById("datum").value;
            var vendegOra = document.getElementById("szabad").value;
            idopontKuldes(fodraszNeve, vendegNeve, vendegNap, vendegOra);
        }
    }
}

function renderNaptar(nyitva, fodrasz, kep) {
    naptar.innerHTML = "";
    naptar.innerHTML += `<div id="valaszok">
    <h3>Üdvözlöm, ${fodrasz} vagyok.</h3>
    <img class="arc" src="/img/${kep}">
    <span>Szeretettel várom az alábbi nyitvatartással:</span>`;
    var valaszok = document.getElementById("valaszok");
    for (let i = 0; i < nyitva.length; i++) {
        valaszok.innerHTML += `<span>${nyitva[i].nap}: ${nyitva[i].tol}-${nyitva[i].ig} óráig.</span>`;
    }
}

function idopontKuldes(fodrasz, nev, nap, ora) {
    urlap.innerHTML = "";
    naptar.innerHTML = "";
    uzenet.innerHTML += `<p class="fontos">Sikeres foglalás!</p>
    <ul class="nagy">
        <li>Név: ${nev}</li>
        <li>Fodrász: ${fodrasz}</li>
        <li>Dátum: ${nap.replace(/-/g, ". ")}.</li>
        <li>Idő: ${ora} óra</li>
    </ul>
    <a class="refresh" onClick="window.location.reload()">Újabbat foglalok</a>`;
    fetch("/ujido", {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            fodrasz: fodrasz,
            vendeg: nev,
            datum: nap,
            ora: ora
        })
    }).
    then(res => res.json()).
    then(data => {
        console.log(data);
    })
}

window.onload = function(){
    request("GET", "/idopont", function(res){
        idoPont = JSON.parse(res);
        renderForm(idoPont);
    });
}