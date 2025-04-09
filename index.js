const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const fs = require("fs");
const { parse } = require("csv-parse");

const app = express()
const port = 3000

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  fs.readFile("./produtos.csv", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file")
      return
    }
    parse(data, { columns: true, trim: true }, (err, records) => {
      if (err) {
        res.status(500).send("Error parsing file")
        return
      }
      res.send(records)
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})