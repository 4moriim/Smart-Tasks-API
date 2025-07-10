const database = require("../config/db");
const transformIsCompleted = require("../utils/transform");

exports.home = (req, res) => {
    res.status(200).send("A API de Lista de tarefas está funcionando!");
};

exports.getAllTasks = (req, res) => {
    database.query('SELECT * FROM tasks', (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        const transformedResults = transformIsCompleted(results);
        res.status(200).json(transformedResults);
    });
};

exports.getTaskById = (req, res) => {
    const { id } = req.params;
    database.query('SELECT * FROM tasks WHERE id = ?', [id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.length > 0) {
            const transformedResult = transformIsCompleted(results);
            res.status(200).json(transformedResult[0]);
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    });
};

exports.createTask = (req, res) => {
    const { title, description } = req.body;
    const query = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
    database.query(query, [title, description], (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ id: result.insertId, title, description });
    });
};

exports.updateTask = (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const query = 'UPDATE tasks SET title = ?, description = ? WHERE id = ?';
    database.query(query, [title, description, id], (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        if (result.affectedRows > 0) {
            res.status(200).json({ id, title, description });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    });
};

exports.partialUpdateTask = (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const updates = [];
    const values = [];

    if (title) {
        updates.push('title = ?');
        values.push(title);
    }

    if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
    }

    if (updates.length === 0) {
        return res.status(200).json({ message: "Nenhum campo para atualizar" });
    }

    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    database.query(query, values, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        if (result.affectedRows > 0) {
            res.status(200).json({ id, title: title || undefined, description });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    });
};

exports.deleteTask = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';
    database.query(query, [id], (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Tarefa deletada com sucesso" });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    });
};

exports.getCompletedTasks = (req, res) => {
    database.query("SELECT * FROM tasks WHERE status = 'completed'", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

exports.getDeletedTasks = (req, res) => {
    database.query("SELECT * FROM tasks WHERE status = 'deleted'", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

exports.updateTaskStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'deleted'].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
    }

    const query = "UPDATE tasks SET status = ? WHERE id = ?";
    database.query(query, [status, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Status atualizado com sucesso" });
    });
};
