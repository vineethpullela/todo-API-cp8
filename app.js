const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const connectToDoServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
};

connectToDoServer();
module.exports = app;

//API 1

app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;
  const getListQuery = `select * from todo where todo like '%${search_q}%' and status like '%${status}%' and priority like '%${priority}%';`;
  const listArray = await db.all(getListQuery);
  response.send(listArray);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDoQuery = `select * from todo where id = ${todoId};`;
  const getTodo = await db.get(getToDoQuery);
  response.send(getTodo);
});

//API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `insert into todo (id,todo,priority,status) values (${id},'${todo}','${priority}','${status}');`;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = request.body;
  //console.log(status);
  let updated = "";
  switch (true) {
    case status != "":
      updated = "Status";
      break;
    case priority != "":
      updated = "Priority";
      break;
    case todo != "":
      updated = "Todo";
      break;

    default:
      break;
  }
  const updateTodo = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}' WHERE id = ${todoId};`;
  await db.run(updateTodo);
  response.send(`${updated} Updated`);
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
