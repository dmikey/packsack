const express = require('express')
const app = express()
const port = 3000

module.exports = {
  start : (script)=>{
    app.get('/', (req, res) => res.send(`
      <!doctype html>
      <html>
      <head>
        <style>
          body, html{
            margin:0;
            padding:0;
            font-family:arial;
            overflow:hidden;
          }
        </style>
      </head>
      <body>
        <script>${script}</script>
      </body>
      </html>
    `))

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
  }
}