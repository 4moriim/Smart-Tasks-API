// Função que transforma o valor de is_completed em booleano
function transformIsCompleted(results) {
    return results.map(task => ({
        ...task,
        is_completed: task.is_completed === 1,
    }));
}

module.exports = transformIsCompleted;