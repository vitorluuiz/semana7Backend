const fs = require("fs");
const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const { parse } = require("csv-parse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const PRODUTOS_FILE_PATH = "./csv/produtos.csv"
const USUARIOS_FILE_PATH = "./csv/usuarios.csv"

const port = 3000
const app = express()
app.use(express.json())

// Middleware swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const usuarios = [
  { id: 1, nome: 'vitor', senha: 'senha123', role: 'user' },
  { id: 2, nome: 'admin', senha: 'admin123', role: 'admin' }
];

const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey";

// Função para gerar token JWT
function generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
}

app.post('/login', (req, res) => {
  const { nome, senha } = req.body;
  const usuario = usuarios.find(u => u.nome === nome && u.senha === senha);
  
  if (usuario) {
      const token = generateToken(usuario);
      res.json({ token });
  } else {
      res.sendStatus(401);
  }
});

app.post('/users', authenticateToken, authorizeRole('admin'), (req, res) => {
  // Aqui você pode implementar a lógica para criar um novo usuário
  res.send('Usuário criado com sucesso.');
});

app.get('/users', authenticateToken, authorizeRole('admin'), (req, res) => {
  // Aqui você pode implementar a lógica para listar os usuários
  res.send('Usuário criado com sucesso.');
});

const produtosWriter = createCsvWriter({
  path: PRODUTOS_FILE_PATH,
  header: [
    { id: "nomeProduto", title: "nomeProduto" },
    { id: "valor", title: "valor" }
  ]
});

// Rota para listar produtos
app.get('/produtos', (req, res) => {
  fs.readFile(PRODUTOS_FILE_PATH, (err, data) => {
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

// Rota para cadastrar produtos
app.post("/produtos", (req, res) => {
  // pegar as informações (nomeProduto e valor) da requisição
  const { nomeProduto, valor } = req.body;
  // acessar o arquivo csv e modifica-lo
  fs.readFile(PRODUTOS_FILE_PATH, (err, data) => {
    parse(data, { columns: true, trim: true }, (err, records) => {
      records.push({ nomeProduto, valor })
      produtosWriter.writeRecords(records).then(() => {
        // retornar a resposta para o cliente (201 Ok)
        res.status(201);
        res.send("Produto cadastrado com sucesso!");
      })
    })
  })
})

// Implementar a rota para deletar produtos
app.delete("/produtos/:nomeProduto", (req, res) => {});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})