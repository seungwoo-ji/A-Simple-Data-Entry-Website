/*********************************************************************************
 * WEB322 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Seung Woo Ji Student ID: 116376195 Date: December 6, 2020
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
const clientSessions = require("client-sessions");
const data = require("./data-service");
const dataServiceAuth = require("./data-service-auth");

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

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.set("view engine", ".hbs");

app.use(express.static("public"));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_a6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

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

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  dataServiceAuth
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  dataServiceAuth
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory, // authenticated user's loginHistory
      };

      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.get("/employees/add", ensureLogin, (req, res) => {
  data
    .getDepartments()
    .then((dept) => {
      res.render("addEmployee", { departments: dept });
    })
    .catch((err) => {
      res.render("addEmployee", { departments: [] });
    });
});

app.post("/employees/add", ensureLogin, (req, res) => {
  data
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Add the Employee");
    });
});

app.post("/employee/update", ensureLogin, (req, res) => {
  data
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update the Employee");
    });
});

app.get("/employee/:employeeNum", ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};

  data
    .getEmployeeByNum(req.params.employeeNum)
    .then((emp) => {
      if (emp) {
        viewData.employee = emp; //store employee data in the "viewData" object as "employee"
      } else {
        viewData.employee = null; // set employee to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null; // set employee to null if there was an error
    })
    .then(data.getDepartments)
    .then((dept) => {
      viewData.departments = dept; // store department data in the "viewData" object as "departments"

      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
    });
});

app.get("/employees/delete/:employeeNum", ensureLogin, (req, res) => {
  data
    .deleteEmployeeByNum(req.params.employeeNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/images/add", ensureLogin, (req, res) => {
  res.render("addImage");
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", ensureLogin, (req, res) => {
  fs.readdir("./public/images/uploaded", (err, items) => {
    res.render("images", { images: items });
  });
});

app.get("/employees", ensureLogin, (req, res) => {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then((emp) => {
        if (emp.length > 0) {
          res.render("employees", { employees: emp });
        } else {
          res.render("employees", { message: "No results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then((emp) => {
        if (emp.length > 0) {
          res.render("employees", { employees: emp });
        } else {
          res.render("employees", { message: "No results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then((emp) => {
        if (emp.length > 0) {
          res.render("employees", { employees: emp });
        } else {
          res.render("employees", { message: "No results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else {
    data
      .getAllEmployees()
      .then((emp) => {
        if (emp.length > 0) {
          res.render("employees", { employees: emp });
        } else {
          res.render("employees", { message: "No results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  }
});

app.get("/departments", ensureLogin, (req, res) => {
  data
    .getDepartments()
    .then((dept) => {
      if (dept.length > 0) {
        res.render("departments", { departments: dept });
      } else {
        res.render("departments", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("departments", { message: "no results" });
    });
});

app.get("/departments/add", ensureLogin, (req, res) => {
  res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
  data
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to Add the Department");
    });
});

app.post("/departments/update", ensureLogin, (req, res) => {
  data
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update the Department");
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
  data
    .getDepartmentById(req.params.departmentId)
    .then((dept) => {
      if (dept) {
        res.render("department", { department: dept });
      } else {
        res.status(404).send("Department Not Found");
      }
    })
    .catch((err) => {
      res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
  data
    .deleteDepartmentById(req.params.departmentId)
    .then(() => {
      res.redirect("/departments");
    })
    .catch(() => {
      res
        .status(500)
        .send("Unable to Remove Department / Department not found");
    });
});

app.get("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

data
  .initialize()
  .then(dataServiceAuth.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("Error!: " + err);
  });
