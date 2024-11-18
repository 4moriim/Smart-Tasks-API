const express = require("express"); // Chama o framework ExpressJS 
const cors = require("cors"); // Sua função é o servidor aceitar requisições de domínios diferentes
const app = express(); // Declara a variável app que contém a função do expressJS
const port = 3000; // Declara a porta em que o código será executado
const bodyParser = require("body-parser"); // Middleware usado no ExpressJS 
const mysql = require("mysql2"); // Chama o banco de dados MySQL
const dotenv = require("dotenv"); // Chama a ferramenta que carrega as variáveis de ambiente

dotenv.config(); // Carrega variáveis de ambiente, que no caso está no arquivo ".env"

app.use(cors());
app.use(bodyParser.json()); // Middleware para parsear o corpo das requisições

// Cria a conexão com o banco de dados MySQL
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'todo_api',
});

//Verifica se a conexão do banco de dados foi bem sucedida ou não
database.connect((error) => {
    if (error) {
        console.error("Erro ao conectar-se com o banco de dados: ");
        return;
    }
    console.log("Conectado ao banco de dados");
});

// Função que transforma o valor de is_completed em booleano
function transformIsCompleted(results) {
    return results.map(task => ({
        ...task,
        is_completed: task.is_completed === 1,
    }));
}

// Endpoints
app.get("/", (request, response) => {
    response.status(200).send("Lista de tarefas home page");
});

// Endpoint para obter as tarefas do usuário
app.get("/todos", (request, response) => {
    database.query('SELECT * FROM tasks', (error, results) => {
        if (error) {
            return response.status(500).json({ error: error.message }); //Mensagem de erro
        }
        const transformedResults = transformIsCompleted(results); // Aplica a transformação para booleano
        response.status(200).json(transformedResults); // Retorna com valores booleanos
    });
});

// Endpoint para obter uma tarefa específica
app.get("/todos/:id", (request, response) => {
    const { id } = request.params;
    database.query('SELECT * FROM tasks WHERE id = ?', [id], (error, results) => {
        if (error) {
            return response.status(500).json({ error: error.message }); // Mensagem de erro
        }
        if (results.length > 0) {
            const transformedResult = transformIsCompleted(results); // Aplica a transformação para booleano
            response.status(200).json(transformedResult[0]); // Retorna a tarefa transformada
        } else {
            response.status(404).json({ message: "Tarefa não encontrada" }); //Caso a tarefa não apareça
        }
    });
});

// Endpoint para adicionar uma nova tarefa
app.post("/todos", (request, response) => {
    const { title, is_completed } = request.body;

    // Garantir que is_completed seja um booleano (1 ou 0)
    const completedValue = is_completed ? 1 : 0;

    const query = 'INSERT INTO tasks (title, is_completed) VALUES (?, ?)';

    database.query(query, [title, completedValue], (error, result) => {
        if (error) {
            return response.status(500).json({ error: error.message }); // Mensagem de erro
        }
        response.status(201).json({
            id: result.insertId,
            title,
            is_completed // Retorna como booleano (true ou false)
        });
    });
});

// Endpoint para atualizar uma tarefa
app.put("/todos/:id", (request, response) => {
    const { id } = request.params;
    const { title, is_completed } = request.body;

    const completedValue = is_completed ? 1 : 0;

    const query = 'UPDATE tasks SET title = ?, is_completed = ? WHERE id = ?';

    database.query(query, [title, completedValue, id], (error, result) => {
        if (error) {
            return response.status(500).json({ error: error.message });
        }
        if (result.affectedRows > 0) {
            response.status(200).json({
                id,
                title,
                is_completed: is_completed // Retorna como booleano (true ou false)
            });
        } else {
            response.status(404).json({ message: "Tarefa não encontrada" }); //Caso não seja encontrada a tarefa
        }
    });
});

// Endpoint para atualizar parcialmente uma tarefa
app.patch("/todos/:id", (request, response) => {
    const { id } = request.params;
    const { title, is_completed } = request.body;

    const updates = []; // Variável declarada vazia para alteração dinâmica
    const values = []; // Variável declarada vazia para alteração dinâmica

    //Se o "title" for alterado, é adicionado à atualização
    if (title) {
        updates.push('title = ?');
        values.push(title);
    }

    //Se o "is_completed" for alterado, é adicionado à atualização
    if (is_completed !== undefined) {
        const completedValue = is_completed ? 1 : 0;
        updates.push('is_completed = ?');
        values.push(completedValue);
    }

    if (updates.length === 0) {
        return response.status(200).json({ message: "Nenhum campo para atualizar" }); // Resposta acionada caso não tenha nada para atualizar
    }

    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    database.query(query, values, (error, result) => {
        if (error) {
            return response.status(500).json({ error: error.message });
        }

        // Se a tarefa foi atualizada
        if (result.affectedRows > 0) {
            response.status(200).json({
                id,
                title: title || undefined, // Retorna o novo título, caso tenha sido mudado
                is_completed: is_completed // Retorna o status da tarefa (true ou false)
            });
        } else {
            response.status(404).json({ message: "Tarefa não encontrada" });
        }
    });
});

// Endpoint para deletar uma tarefa
app.delete("/todos/:id", (request, response) => {
    const { id } = request.params;
    const query = 'DELETE FROM tasks WHERE id = ?'; //Manipula um dado do banco MySQL, deletando-o 

    database.query(query, [id], (error, result) => {
        if (error) {
            return response.status(500).json({ error: error.message });
        }
        if (result.affectedRows > 0) {
            response.status(200).json({ message: "Tarefa deletada com sucesso" });
        } else {
            response.status(404).json({ message: "Tarefa não encontrada" });
        }
    });
});

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`); //Mostra em qual porta o código está rodando
});














