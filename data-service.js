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

    // if there were an error at any time during this process, invoke the reject with an appropriate message
    if (error === "") {
      resolve();
    } else {
      reject(error);
    }
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    employeeData.employeeNum = employees.length + 1;

    employees.push(employeeData);

    resolve();
  });
};

module.exports.getEmployeesByStatus = function (status) {
  return new Promise((resolve, reject) => {
    var employeesByStatus = employees.filter((emp) => emp.status === status);

    if (employeesByStatus.length === 0) {
      reject("no results returned");
    }

    resolve(employeesByStatus);
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise((resolve, reject) => {
    var employeesByDepartment = employees.filter(
      (emp) => emp.department === parseInt(department)
    );

    if (employeesByDepartment.length === 0) {
      reject("no results returned");
    }

    resolve(employeesByDepartment);
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise((resolve, reject) => {
    var employeesByManager = employees.filter(
      (emp) => emp.employeeManagerNum === parseInt(manager)
    );

    if (employeesByManager.length === 0) {
      reject("no results returned");
    }

    resolve(employeesByManager);
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

module.exports.getEmployeeByNum = function (num) {
  return new Promise((resolve, reject) => {
    var employeeByNum = employees.filter(
      (emp) => emp.employeeNum === parseInt(num)
    );

    if (employeeByNum.length === 0) {
      reject("no results returned");
    }

    resolve(employeeByNum);
  });
};

module.exports.getManagers = function () {
  return new Promise((resolve, reject) => {
    var managers = employees.filter((emp) => emp.isManager === true);

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
