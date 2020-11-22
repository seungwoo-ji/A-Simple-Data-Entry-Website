const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "d4mb5hvhngif35",
  "fpcrfkyagnkcly",
  "3784cef3e4a8e2ea9658ecccbb0c727d1433651ee0909638c8a0b3259449e42a",
  {
    host: "ec2-54-166-114-48.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING,
});

var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to sync the database");
      });
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;

    for (const prop in employeeData) {
      if (!employeeData[prop]) {
        employeeData[prop] = null;
      }
    }

    Employee.create(employeeData)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to create employee");
      });
  });
};

module.exports.updateEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;

    for (const prop in employeeData) {
      if (!employeeData[prop]) {
        employeeData[prop] = null;
      }
    }

    Employee.update(employeeData, {
      where: { employeeNum: employeeData.employeeNum },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to update employee");
      });
  });
};

module.exports.getEmployeesByStatus = function (status) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        status: status,
      },
    })
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        department: department,
      },
    })
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        employeeManagerNum: manager,
      },
    })
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeeByNum = function (num) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        employeeNum: num,
      },
    })
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data[0]);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.deleteEmployeeByNum = function (num) {
  return new Promise((resolve, reject) => {
    Employee.destroy({ where: { employeeNum: num } })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};

// the manual doet not specify whether this function is going to be used later
// thus, I comment out this function just in case if it is used later
// module.exports.getManagers = function () {
//   return new Promise((resolve, reject) => {
//     reject();
//   });
// };

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.addDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    for (const prop in departmentData) {
      if (!departmentData[prop]) {
        departmentData[prop] = null;
      }
    }

    Department.create(departmentData)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to create department");
      });
  });
};

module.exports.updateDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    for (const prop in departmentData) {
      if (!departmentData[prop]) {
        departmentData[prop] = null;
      }
    }

    Department.update(departmentData, {
      where: { departmentId: departmentData.departmentId },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to update department");
      });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.findAll({
      where: {
        departmentId: id,
      },
    })
      .then((data) => {
        data = data.map((value) => value.dataValues);
        resolve(data[0]);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.deleteDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.destroy({ where: { departmentId: id } })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};
