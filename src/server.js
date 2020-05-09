const express = require('express');
const watch = require('node-watch');
const app = express();
const chalk = require('chalk');
var reload = require('reload');
const port = 3000
let chunk;
let _bundle;
let _entry;

let updateStatus = {
  ack: true,
  update: false
};

watch(process.cwd(), { recursive: true }, function(evt, name) {
  console.log(`${chalk.yellow('[info]')} changes to source detected, reloading`)
  chunk = _bundle(_entry)
  updateStatus.update = true
});

const buildPage = (script) => {
  return `
    <!doctype html>
    <html>
    <head>
      <script>
        const fn = function(){
          fetch('http://localhost:3000/__packsack__')
            .then(response => response.json())
            .then(data => {
              if(!data.update) {
                setTimeout(fn, 1000);
              } else {
                location.reload();
              }
            });
        };
        setTimeout(fn, 1000);
      </script>
    </head>
    <body>
      <script>${script}</script>
    </body>
    </html>
  `
}

module.exports = {
  start : ({bundle, entry})=>{
    _bundle = bundle;
    _entry = entry;
    chunk = chunk || bundle(entry);
    app.get('/', (req, res) => {
      updateStatus.update = false;
      res.send(buildPage(chunk));
    });
    app.get('/__packsack__', (req, res) => res.send(JSON.stringify(updateStatus)));
    app.listen(port, () => console.log(`${chalk.green('[info]')} development server listening on ${port}!`))
  }
}
