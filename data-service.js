const fs = require("fs");

var employees = [];
var departments = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    var error = "";

    try {
      const emp = fs.readFileSync("./data/employees.json");
      employees = JSON.parse(emp);
    } catch (err) {
      error = "unable to read employees file";
    }

    // only once the read operation for the employees has completed successfully, repeat the same process for the
    // departments
    if (error === "") {
      try {
        const dept = fs.readFileSync("./data/departments.json");
        departments = JSON.parse(dept);
      } catch (err) {
        error = "unable to read department file";
      }
    }

    // if there was an error at any time during this process, invoke the reject with an appropriate message
    if (error === "") {
      resolve();
    } else {
      reject(error);
    }
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
