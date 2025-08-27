const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// =============================
// Exercise Tracker API
// =============================

let users = [];
let exercises = {};
let userIdCounter = 1;

// 1. Create User
app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const newUser = { username, _id: userIdCounter.toString() };
  users.push(newUser);
  exercises[newUser._id] = [];
  userIdCounter++;
  res.json(newUser); //  Only username & _id
});

// 2. Get all Users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// 3. Add Exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const user = users.find((u) => u._id === userId);

  if (!user) return res.json({ error: "User not found" });

  const exercise = {
    description: description.toString(), //  force string
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
  };

  exercises[userId].push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(), //  formatted string
    _id: user._id,
  });
});

// 4. Get Logs
app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;
  const user = users.find((u) => u._id === userId);

  if (!user) return res.json({ error: "User not found" });

  let log = exercises[userId] || [];

  if (from) {
    const fromDate = new Date(from);
    log = log.filter((e) => e.date >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter((e) => e.date <= toDate);
  }
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: log.length, //  required
    _id: user._id,
    log: log.map((e) => ({
      description: e.description.toString(), //  ensure string
      duration: e.duration,
      date: e.date.toDateString(), //  string format
    })),
  });
});

// =============================

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
