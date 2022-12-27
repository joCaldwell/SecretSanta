const express = require('express');
const fs = require('fs')
const formidableMiddleware = require('express-formidable');
const path = require('path');
const css_file = "/css/style.css"
var cookieParser = require('cookie-parser');
const { render } = require('pug');


const app = express();
const port = 8000;
const domain = 'whogiftsashit.us';

const santa_loc = './santa.json';
var db = require(santa_loc);

app.use(formidableMiddleware());

app.use(express.static('public'));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views','./views');

function writeJson() {
    if (Object.keys(db) === 0) {
        return
    } else {
        fs.writeFile(santa_loc, JSON.stringify(db), function writeJSON(err) {
            if (err) return console.log(err);
            console.log(JSON.stringify(db));
            console.log('writing to ' + santa_loc);
        });
    }
}

app.get('/', (req,res) => {
    res.render('index', {
        css: css_file
    });
});
app.get('/create', (req,res) => {
    res.render('create', {
        css: css_file
    });
});
app.get('/join', (req,res) => {
    games = []
    Object.entries(db).forEach(([key, val]) => {
        games.push(key);
    });

    res.render('enter', {
        games: games,
        css: css_file
    })
});
app.get('/lobby/:lobby_name', (req,res) => {
    lobby = db[req.params.lobby_name]
    players = [];
    Object.entries(lobby.PLAYERS).forEach(([key, val]) => {
        players.push(key)
    });
    res.cookie('lobby', req.params.lobby_name);
    res.render('login', {
        game: req.params.lobby_name,
        players: players,
        css: css_file
    });
});

app.post('/login/:lobby/:player', (req,res) => {
    res.cookie('player', req.params.player);
    lobby = db[req.params.lobby];
    creator = lobby.CREATOR;
    players = [];
    Object.entries(lobby.PLAYERS).forEach(([key, val]) => {
        players.push(key)
    });
    if (lobby.STARTED == true) {
        var target = lobby.ASSIGNMENT[req.params.player]
    } else {
        var target = ""
    }
    player_code = lobby.PLAYERS[req.params.player];
    entered_code = req.fields.code;
    if (entered_code != player_code) {
        res.render('login', {
            game: req.params.lobby,
            players: players,
            css: css_file
        });
    }
    res.render('lobby', {
        css: css_file,
        player: req.params.player,
        creator: creator,
        lobby: req.params.lobby,
        started: lobby.STARTED,
        target: target
    })
});

app.post('/login/:lobby', (req,res) => {
    res.cookie('player', req.fields.name);
    var lobby = db[req.params.lobby];
    lobby.PLAYERS[req.fields.name] = req.fields.code;
    var creator = lobby.CREATOR;
    if (lobby.STARTED == true) {
        var target = lobby.ASSIGNMENT[req.fields.name]
    } else {
        var target = ""
    }
    writeJson();
    res.render('lobby', {
        css: css_file,
        player: req.fields.name,
        creator:  creator,
        lobby: req.params.lobby,
        started: lobby.STARTED,
        target: target
    });
});

function recAlgo(players, baseIndex, firstPlayer) {
    currentPlayer = players[baseIndex];
    players.splice(baseIndex, 1);
    numPlayers = players.length;
    nextIndex = Math.floor(Math.random() * numPlayers);
    lobby.ASSIGNMENT[currentPlayer] = players[nextIndex]
    if (numPlayers != 0) {
        recAlgo(players, nextIndex, firstPlayer)
    } else {
        lobby.ASSIGNMENT[currentPlayer] = firstPlayer
    };

};

app.post('/start/:lobby', (req,res) => {
    lobby = db[req.params.lobby];
    players = Object.keys(lobby.PLAYERS)
    // algo for making game start
    baseIndex = Math.floor(Math.random() * players.length) 
    recAlgo(players, baseIndex, players[baseIndex]);
    lobby.STARTED = true;
    writeJson();
    res.render('lobby', {
        css: css_file,
        player: req.cookies.player,
        creator:  lobby.CREATOR,
        lobby: req.params.lobby,
        started: lobby.STARTED,
        target: lobby.ASSIGNMENT[req.cookies.player]
    })
})

app.post('/create', (req,res) => {
    if (req.fields.lobby == "" ||
     req.fields.creator_name == "" || 
     req.fields.creator_code == "") {
        res.render('create', {
            css: css_file
        });
     }
    var lobby_name = req.fields.lobby;
    var creator_name = req.fields.creator_name;
    var creator_code = req.fields.creator_code;
    db[lobby_name] = {};
    db[lobby_name].PLAYERS = {};
    db[lobby_name].ASSIGNMENT = {};
    db[lobby_name].PLAYERS[creator_name] = creator_code;
    db[lobby_name].CREATOR = creator_name;
    db[lobby_name].STARTED = 'false'

    writeJson();
    res.cookie('game', 'hi');
    res.render('index', {
        css:css_file
    });
})


app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});

