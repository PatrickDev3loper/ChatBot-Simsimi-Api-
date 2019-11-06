const express = require('express')
const app = express()
const lowdb = require('lowdb')
const port = 80
const path = require('path');
var request = require('request')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('keys.json')
const db = lowdb(adapter)

db.defaults({
  listKey: []
}).write()


var listKey = db.get('listKey').value()

var apiKey = ''

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

function randomKey(){
  apiKey = listKey.sample()
}

randomKey()

app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/simsimi/:msg/:protect', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
    let msg = req.params.msg
    let nivel = req.params.protect

    var options = { method: 'POST',
  url: 'https://wsapi.simsimi.com/190410/talk',
  headers: 
   { 'x-api-key': apiKey,
     'Content-Type': 'application/json' },
  body: { 
    utext: msg, 
    lang: 'pt',
    "atext_bad_prob_max": nivel,
    "country" : ["BR"], 
  },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  let state = body.statusMessage
  if (!body.statusMessage){
    state = "Error"
  }
  if(body.message == 'Limit Exceeded Exception'){
    listKey = listKey.filter(item => item !== apiKey)
    db.set('listKey', listKey).write()
  }
  res.json({body, apiKey})
  randomKey()
});


   
})

app.use(function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
});
app.listen(port, () => console.log(`Server listening on port ${port}!`))