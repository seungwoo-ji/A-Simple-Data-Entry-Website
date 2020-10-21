/*********************************************************************************
 * WEB322 – Assignment 03
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Seung Woo Ji Student ID: 116376195 Date: October 21, 2020
 *
 * Online (Heroku) Link: https://fierce-lake-12446.herokuapp.com/
 *
 ********************************************************************************/

const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const data = require("./data-service");

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.post("/employees/add", (req, res) => {
  data.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

app.get("/images/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", (err, items) => {
    res.json({ images: items });
  });
});

app.get("/employees", (req, res) => {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then((emp) => {
        res.json(emp);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then((emp) => {
        res.json(emp);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then((emp) => {
        res.json(emp);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  } else {
    data
      .getAllEmployees()
      .then((emp) => {
        res.json(emp);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  }
});

app.get("/employee/:employeeNum", (req, res) => {
  data
    .getEmployeeByNum(req.params.employeeNum)
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/managers", (req, res) => {
  data
    .getManagers()
    .then((mgr) => {
      res.json(mgr);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((dept) => {
      res.json(dept);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

data
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("Error!: " + err);
  });
