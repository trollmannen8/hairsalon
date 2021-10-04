var table = document.getElementById("table");
var adminSelect = document.getElementById("adminselect");
var content = document.getElementById("content");
var login = document.getElementById("login");
var uzenet = document.getElementById("uzenet");
var visszaigazolas = document.getElementById("visszaigazolas");

var tableTemplate = `
<table>
    <thead>
        <tr>
            <th>Név</th>
            <th>Dátum</th>
            <th>Időpont</th>
            <th>Azonosító</th>
            <th></th>
        </tr>
    </thead>
    <tbody id="adatok">
    </tbody>
</table>
`;

var loginTemplate = `
<div id="loginkeret">
    <form action="" id="loginform">
        <label for="username">Felhasználónév:</label><br>
        <input type="text" name="username" id="username"><br>
        <label for="password">Jelszó:</label><br>
        <input type="password" name="userpass" id="userpass"><br>
        <button type="submit" id="bejelentkezes">Bejelentkezés</button>
    </form>
</div>
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

function renderLogin(users) {
    login.innerHTML = loginTemplate;
    var bejelentkezes = document.getElementById("loginform");
    bejelentkezes.addEventListener("submit", function(e) {
        e.preventDefault();
        var userName = document.getElementById("username").value;
        var userPass = document.getElementById("userpass").value;
        var sikeres = false;
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === userName && users[i].password === userPass) {
                sikeres = true;
            }
        }
        if (sikeres) {
            content.innerHTML = "";
            request("GET", "/idopont", function(res){
                idopont = JSON.parse(res);
                renderTable(idopont);
            });
        } else {
            uzenet.innerHTML = `<p>Sikertelen belejentkezés</p>`;
        }
    });
}

function renderTable(ido) {
    visszaigazolas.innerHTML = "";
    adminSelect.innerHTML = "";
    adminSelect.innerHTML = `<label for="fodraszok">Fodrászok:</label><select id="fodraszok"></select><button id="valaszt">Kiválasztom</button>`;
    var fodraszok = document.getElementById("fodraszok");
    for (let i = 0; i < ido.length; i++) {
        fodraszok.innerHTML += `<option value="${i}">${ido[i].nev}</option>`;
    }
    document.getElementById("valaszt").onclick = function() {
        var selected = document.getElementById("fodraszok").value;
        var foglalasok = ido[selected].idopontfoglalas;
        var fodraszNev = ido[selected].nev;
        table.innerHTML = "";
        table.innerHTML += `<h3>${fodraszNev} időpontjai</h3>`;
        if (foglalasok.length < 1) {
            table.innerHTML += `<p>Nincs időpont.</p>`;
        } else {
            var rendezett = foglalasok.sort(function(a, b) {
                return parseInt(a.datum.replace(/-/g, "") + a.ora) - parseInt(b.datum.replace(/-/g, "") + b.ora);
            });
            table.innerHTML += tableTemplate;
            var adatok = document.getElementById("adatok");
            for (let j = 0; j < rendezett.length; j++) {
                adatok.innerHTML += `<tr>
                <td>${rendezett[j].vendeg}</td>
                <td>${rendezett[j].datum}</td>
                <td>${rendezett[j].ora}</td>
                <td>${rendezett[j].azonosito}</td>
                <td><button class="del" data-id="${rendezett[j].azonosito}">Törlés</button>
                </tr>`;
            }
        }
        var deleteButton = document.querySelectorAll(".del");
        deleteButton.forEach(function(button) {
            button.onclick = function() {
                idopontTorles(fodraszNev, button.dataset.id);
            }
        })
    }
}

function idopontTorles(fodrasz, id) {
    fetch("/torles", {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            fodrasz: fodrasz,
            azonosito: id
        })
    }).
    then(res => res.json()).
    then(data => {
        console.log(data);
    })
    table.innerHTML = "";
    adminSelect.innerHTML = "";
    visszaigazolas.innerHTML += `<p>Foglalás törölve</p><button id="vissza">Vissza</button>`;
    document.getElementById("vissza").onclick = function() {
        content.innerHTML = "";
        request("GET", "/idopont", function(res){
            idopont = JSON.parse(res);
            renderTable(idopont);
        });
    }
}

window.onload = function() {
    request("GET", "/login", function(res){
        usersData = JSON.parse(res);
        renderLogin(usersData);
    });
}