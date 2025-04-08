const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const fs = require("fs");
const { parse } = require("csv-parse");

const app = express()
const port = 3000

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  let rows = [];
  fs.createReadStream("./produtos.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", function (row) {
      rows.push(row);
    })
  setTimeout(() => {
    res.send(rows)
  }, 2000)
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})