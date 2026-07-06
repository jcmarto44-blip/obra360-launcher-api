const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

// Permitir comunicación desde Vercel / cualquier frontend
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// CAMBIO PARA MULTI-PC: en vez de una sola variable "tarea"
// global (que hacía que TODAS las PCs recibieran el mismo
// evento sin importar a cuál iba dirigido), ahora usamos un
// objeto que guarda una tarea POR CADA pcId por separado.
//
// Ejemplo de forma interna:
// tareasPorPc = {
//   "PC-001": { taskId, project, view, createdAt },
//   "PC-OBRA-NORTE": { taskId, project, view, createdAt },
//   ...
// }
// ---------------------------------------------------------
let tareasPorPc = {};

function tareaVacia(pcId) {
  return {
    taskId: null,
    pcId,
    project: "",
    view: "",
    createdAt: null
  };
}

// Vercel envía la tarea (ahora requiere indicar a qué PC va dirigida)
app.post("/task", (req, res) => {
  const { pcId, project, view } = req.body;

  if (!pcId) {
    return res.status(400).json({
      status: "error",
      message: "Falta el campo 'pcId' (¿a qué PC va dirigida la tarea?)"
    });
  }

  if (!project || !view) {
    return res.status(400).json({
      status: "error",
      message: "Faltan campos 'project' o 'view'"
    });
  }

  const tarea = {
    taskId: crypto.randomUUID(),
    pcId,
    project,
    view,
    createdAt: new Date().toISOString()
  };

  tareasPorPc[pcId] = tarea;

  console.log("Nueva tarea:", tarea);

  res.json({
    status: "ok",
    task: tarea
  });
});

// Launcher consulta SU tarea, pasando su propio pcId:
// GET /task?pcId=PC-001
//
// COMPATIBILIDAD HACIA ATRÁS: si algún Launcher viejo (de antes de
// soportar múltiples PCs) consulta este endpoint SIN mandar ?pcId=...,
// asumimos "PC-001" por default. Esto es exactamente el pcId que ya
// manda tu frontend actual, así que tu PC/obra actual sigue
// funcionando exactamente igual, sin ningún cambio necesario de tu
// lado, aunque actualices este server.js.
app.get("/task", (req, res) => {
  const pcId = req.query.pcId || "PC-001";

  const tarea = tareasPorPc[pcId] || tareaVacia(pcId);
  res.json(tarea);
});

// Limpiar la tarea de una PC específica
app.post("/clear", (req, res) => {
  const { pcId } = req.body;

  if (!pcId) {
    return res.status(400).json({
      status: "error",
      message: "Falta el campo 'pcId'"
    });
  }

  tareasPorPc[pcId] = tareaVacia(pcId);
  res.json({ status: "cleared", pcId });
});

// Opcional: ver todas las PCs con tareas registradas (útil para depurar)
app.get("/pcs", (req, res) => {
  res.json(Object.keys(tareasPorPc));
});

// Endpoint de salud, útil para verificar que Render no esté dormido
app.get("/health", (req, res) => {
  res.json({ status: "alive", now: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Launcher API iniciada en puerto " + PORT);
});
