console.log("main.js OK");

const fs = require("fs");
const path = require("path");
const mongodb = require("mongodb");
const express = require("express");

const MongoClient = mongodb.MongoClient;

const uri = "mongodb+srv://Giraffe1337:Giraffe1337@cluster0.r1adj.mongodb.net/Vizsga?retryWrites=true&w=majority";

function dbAction(dbName, collectionName, handler) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        const dbo = client.db(dbName);
        const collection = dbo.collection(collectionName);
        handler(client, dbo, collection);
    });
}

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(express.json());

app.get("/", (req, res) => {
    var indexPath = path.join(__dirname, "public", "index.html");
        fs.readFile(indexPath, (err, file) => {
        res.write(file);
        res.end();
    });
});

app.get("/idopont", (req, res) => {
    dbAction("Vizsga", "fodraszat", (cli, db, coll) => {
        coll.find().toArray((err, resp) => {
            res.json(resp);
            cli.close();
        });
    });
});

app.get("/login", (req, res) => {
    dbAction("Vizsga", "fodraszatusers", (cli, db, coll) => {
        coll.find().toArray((err, resp) => {
            res.json(resp);
            cli.close();
        });
    });
});

app.post("/ujido", (req, res) => {
    var newData = req.body;
    var fodrasz = newData.fodrasz;
    var objektum = {
        vendeg: newData.vendeg,
        datum: newData.datum,
        ora: newData.ora,
        azonosito: new Date().getTime() + "-" + Math.floor(Math.random() * 10000000)
    };
    console.log(fodrasz);
    console.log(objektum);
    dbAction("Vizsga", "fodraszat", (cli, db, coll) => {
        coll.updateOne({nev: fodrasz}, {$push: {idopontfoglalas: objektum}}, (err, resp) => {
            res.json({message: "Updated OK"});
            cli.close();
        });
    });
});

app.post("/torles", (req, res) => {
    var deleteData = req.body;
    var fodrasz = deleteData.fodrasz;
    var azonosito = deleteData.azonosito;
        dbAction("Vizsga", "fodraszat", (cli, db, coll) => {
        coll.updateOne({nev: fodrasz}, {$pull: {idopontfoglalas: {azonosito: azonosito}}}, (err, resp) => {
            res.json({message: "Delete OK"});
            cli.close();
        });
    });
});

app.listen("3000");