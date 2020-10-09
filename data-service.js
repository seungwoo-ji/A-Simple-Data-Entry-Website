const fs = require("fs");

var employees = [];
var departments = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/employees.json", (err, data) => {
      if (err) {
        reject("unable to read employees file");
        return;
      }

      employees = JSON.parse(data);
    });

    fs.readFile("./data/departments.json", (err, data) => {
      if (err) {
        reject("unable to read departments file");
        return;
      }

      departments = JSON.parse(data);
    });

    resolve();
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    if (employees.length === 0) {
      reject("no results returned");
    }

    resolve(employees);
  });
};

module.exports.getManagers = function () {
  return new Promise((resolve, reject) => {
    var managers = employees.filter((manager) => manager.isManager === true);

    if (managers.length === 0) {
      reject("no results returned");
    }

    resolve(managers);
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    if (departments.length === 0) {
      reject("no results returned");
    }

    resolve(departments);
  });
};
