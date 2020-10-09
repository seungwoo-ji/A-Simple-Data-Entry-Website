/*********************************************************************************
 * WEB322 – Assignment 02
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Seung Woo Ji Student ID: 116376195 Date: October 9, 2020
 *
 * Online (Heroku) Link: ________________________________________________________
 *
 ********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const data = require("./data-service");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees", (req, res) => {
  data
    .getAllEmployees()
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => {
      res.json({ message: "err" });
    });
});

app.get("/managers", (req, res) => {
  data
    .getManagers()
    .then((mgr) => {
      res.json(mgr);
    })
    .catch((err) => {
      res.json({ message: "err" });
    });
});

app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((dept) => {
      res.json(dept);
    })
    .catch((err) => {
      res.json({ message: "err" });
    });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

data
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("Error!: " + err.message);
  });
