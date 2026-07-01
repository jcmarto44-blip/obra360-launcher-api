const express = require("express");
const cors = require("cors");

const app = express();

// Permitir comunicación desde Vercel / cualquier frontend
app.use(cors());

app.use(express.json());

// Última tarea recibida
let tarea = {
    pcId: "PC-001",
    project: "",
    view: ""
};

// Vercel envía la tarea
app.post("/task", (req, res) => {

    tarea = req.body;

    console.log("Nueva tarea:", tarea);

    res.json({
        status: "ok",
        task: tarea
    });

});

// Launcher consulta la tarea
app.get("/task", (req, res) => {

    res.json(tarea);

});

// Limpiar tarea
app.post("/clear", (req, res) => {

    tarea = {
        pcId: "PC-001",
        project: "",
        view: ""
    };

    res.json({
        status: "cleared"
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Launcher API iniciada en puerto " + PORT);

});
