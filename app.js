const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/", taskRoutes);

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`);
});














