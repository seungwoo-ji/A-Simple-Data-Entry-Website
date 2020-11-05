/*********************************************************************************
 * WEB322 – Assignment 04
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Seung Woo Ji Student ID: 116376195 Date: November 5, 2020
 *
 * Online (Heroku) Link: https://fierce-lake-12446.herokuapp.com/
 *
 ********************************************************************************/

const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
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

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },

      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/employees/add", (req, res) => {
  res.render("addEmployee");
});

app.post("/employees/add", (req, res) => {
  data.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

app.post("/employee/update", (req, res) => {
  data.updateEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

app.get("/images/add", (req, res) => {
  res.render("addImage");
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", (err, items) => {
    res.render("images", { images: items });
  });
});

app.get("/employees", (req, res) => {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then((emp) => {
        res.render("employees", { employees: emp });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then((emp) => {
        res.render("employees", { employees: emp });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then((emp) => {
        res.render("employees", { employees: emp });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else {
    data
      .getAllEmployees()
      .then((emp) => {
        res.render("employees", { employees: emp });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  }
});

app.get("/employee/:employeeNum", (req, res) => {
  data
    .getEmployeeByNum(req.params.employeeNum)
    .then((emp) => {
      res.render("employee", { employee: emp });
    })
    .catch((err) => {
      res.render("employee", { message: "no results" });
    });
});

app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((dept) => {
      res.render("departments", { departments: dept });
    })
    .catch((err) => {
      res.render("departments", { message: "no results" });
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
