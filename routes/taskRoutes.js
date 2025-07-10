const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/", taskController.home);
router.get("/tasks", taskController.getAllTasks);
router.get("/tasks/completed", taskController.getCompletedTasks);
router.get("/tasks/deleted", taskController.getDeletedTasks);
router.get("/tasks/:id", taskController.getTaskById);
router.post("/tasks", taskController.createTask);
router.put("/tasks/:id", taskController.updateTask);
router.patch("/tasks/:id", taskController.partialUpdateTask);
router.patch("/tasks/:id/status", taskController.updateTaskStatus);
router.delete("/tasks/:id", taskController.deleteTask);

module.exports = router;
