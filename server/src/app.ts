import express from "express";
import cors from "cors";
import { connectToDatabase, getDb } from "./config/database";
import fetchEvents from "./getEvents";
import { handleChat } from "./chatbot";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get("/api", async (req, res) => {
  const db = getDb();
  console.log("recived api request");
  const data = await db.collection("events").find({}).toArray();
  res.send(data);
});

app.post("/api/email", (req, res) => {
  console.log("email recived", req.body);
  res.send("sucess");
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const botres = await handleChat(message);
  res.send({ botres });
});

connectToDatabase().then(() =>
  fetchEvents().then(() =>
    app.listen(port, () => {
      return console.log(`listening at http://localhost:${port}`);
    }),
  ),
);
