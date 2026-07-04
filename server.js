const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

// Permitir comunicación desde Vercel / cualquier frontend
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// FIX #3: Ahora la tarea incluye un "taskId" único y un
// "timestamp". Esto permite que el Launcher distinga una
// tarea NUEVA de una repetida, aunque el proyecto y la vista
// sean exactamente los mismos que la tarea anterior.
// ---------------------------------------------------------
let tarea = {
  taskId: null,
  pcId: "PC-001",
  project: "",
  view: "",
  createdAt: null
};

// Vercel envía la tarea
app.post("/task", (req, res) => {
  const { pcId, project, view } = req.body;

  if (!project || !view) {
    return res.status(400).json({
      status: "error",
      message: "Faltan campos 'project' o 'view'"
    });
  }

  tarea = {
    taskId: crypto.randomUUID(),      // ID único por cada tarea
    pcId: pcId || "PC-001",
    project,
    view,
    createdAt: new Date().toISOString()
  };

  console.log("Nueva tarea:", tarea);

  res.json({
    status: "ok",
    task: tarea
  });
});

// Launcher consulta la tarea actual
app.get("/task", (req, res) => {
  res.json(tarea);
});

// Limpiar tarea (opcional, útil para pruebas)
app.post("/clear", (req, res) => {
  tarea = {
    taskId: null,
    pcId: "PC-001",
    project: "",
    view: "",
    createdAt: null
  };
  res.json({ status: "cleared" });
});

// Endpoint de salud, útil para verificar que Render no esté dormido
app.get("/health", (req, res) => {
  res.json({ status: "alive", now: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Launcher API iniciada en puerto " + PORT);
});

