const tracer = require("./tracing")("todo-service");
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
app.use(express.json());
const port = 3000;
let db;

app.get("/todo", async (req, res) => {
  const span = tracer.startSpan("get_todo_list");
  try {
    const todos = await db.collection("todos").find({}).toArray();
    res.send(todos);
  } catch (err) {
    span.setStatus({ code: 2, message: err.message });
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    span.end();
  }
});

app.get("/todo/:id", async (req, res) => {
  const span = tracer.startSpan("get_todo_by_id");
  try {
    const todo = await db.collection("todos").findOne({ id: req.params.id });
    if (!todo) {
      res.status(404).send("Not Found");
      return;
    }
    res.send(todo);
  } catch (err) {
    span.setStatus({ code: 2, message: err.message });
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    span.end();
  }
});

const startServer = async () => {
  const client = await MongoClient.connect("mongodb://localhost:27017/");
  db = client.db("todo");
  await db.collection("todos").insertMany([
    { id: "1", title: "Buy groceries" },
    { id: "2", title: "Install Aspecto" },
    { id: "3", title: "buy my own name domain" },
  ]);
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startServer();
