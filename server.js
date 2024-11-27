const express = require("express")
const cors = require("cors")
const mysql = require("mysql2")
const jwt = require("jsonwebtoken")

const app = express()

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY } = process.env

app.use(cors())
app.use(express.json())

app.post("/register", (request, response) =>{
    const user = request.body.user

    const searchCommand = `
        SELECT * FROM Users
        WHERE email = ?
    `

    db.query(searchCommand, [user.email], (error, data) => {
        if(error) {
            console.log(error)
            return
        }

        if(data.length !== 0) {
            response.json({ message: "Já existe um usuário cadastrado com esse e-mail. Tente outro e-mail!" , userExists: true })
            return
        }

        const insertCommand = `
            INSERT INTO Users(nome, email, senha)
            VALUES (?, ?, ?)
        `

        db.query(insertCommand, [user.nome, user.email, user.senha], (error) => {
            if(error) {
                console.log(error)
                return
            }

            response.json({message: "Usuário cadastrado com sucesso!" })
        })
    })
})


app.post("/login", (request, response) => {
    const user = request.body.user

    const searchCommand = `
        SELECT * FROM Users
        WHERE email = ?
    `

    db.query(searchCommand, [user.email], (error, data) => {
        if(error) {
            console.log(error)
            return
        }

        if(data.length === 0) {
            response.json({ message: "Não existe nenhum usuário cadastrado com esse e-mail!" })
            return
        }

        if(user.senha === data[0].senha) {
            const email = user.email
            const id = data[0].id
            const nome = data[0].nome

            const token = jwt.sign({ id, email, nome }, SECRET_KEY, { expiresIn: "1h" })
            response.json({ token, ok: true })
            return
        }

        response.json({ message: "Credenciais inválidas! Tente novamente" })
    })
})

app.get("/verify", (request, response) => {
    const token = request.headers.authorization

    jwt.verify(token, SECRET_KEY, (error, decoded) => {
        if(error) {
            response.json({ message: "Token inválido! Efetue o login novamente."})
            return
        }

        response.json({ ok: true })
    })
})

app.get("/getnome", (request, response) => {
    const token = request.headers.authorization

    const decoded = jwt.verify(token, SECRET_KEY)

    response.json({ nome: decoded.nome })
})

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000!")
})

const db = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
})