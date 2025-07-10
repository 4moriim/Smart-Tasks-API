const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config(); // Carrega variáveis de ambiente, que no caso está no arquivo ".env"

// Cria a conexão com o banco de dados MySQL
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'smart_tasks_api',
});

//Verifica se a conexão do banco de dados foi bem sucedida ou não
database.connect((error) => {
    if (error) {
        console.error("Erro ao conectar-se com o banco de dados: ");
        return;
    }
    console.log("Conectado ao banco de dados");
});

module.exports = database;

