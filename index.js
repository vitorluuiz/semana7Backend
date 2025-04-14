const express = require('express')

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const fs = require("fs");
const { parse } = require("csv-parse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const app = express()

app.use(express.json())

const port = 3000

const csvWriter = createCsvWriter({
  path: "./produtos.csv",
  header: [
    {id: "nomeProduto", title: "nomeProduto"},
    {id: "valor", title: "valor"}
  ]
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/produtos', (req, res) => {
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

app.post("/produtos", (req, res) => {
  // pegar as informações (nomeProduto e valor) da requisição
  const {nomeProduto, valor} = req.body;
  // acessar o arquivo csv e modifica-lo
  fs.readFile("./produtos.csv", (err, data) => {
    parse(data, {columns: true, trim: true}, (err, records) => {
      records.push({nomeProduto, valor})
      csvWriter.writeRecords(records).then(() => {
        console.log("Feito")
      })
    })
  })
  // retornar a resposta para o cliente (201 Ok)
  res.status(201);
  res.send("Produto cadastrado com sucesso!");
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})