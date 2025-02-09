import express from "express";
import cors from "cors";
import { connectToDatabase, getDb } from "./config/database";
import fetchEvents from "./getEvents";

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

app.post("/api/email", async (req, res) => {
  console.log("email recived", req.body);
  res.send("sucess");
});

connectToDatabase().then(() =>
  fetchEvents().then(() =>
    app.listen(port, () => {
      return console.log(`listening at http://localhost:${port}`);
    }),
  ),
);
