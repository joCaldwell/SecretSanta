const express = require('express');
const path = require('path');

var json = require('./santa.json');
const app = express();
const port = 80;

app.use(express.static('public'));


app.get('/', (req,res) => {
    res.sendFile('index.html');
});

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
  console.log(Object.keys(json.game1.players)[0]);
});

