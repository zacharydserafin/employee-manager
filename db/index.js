const connection = require("./connection.js");

class DB {
    constructor(connection) {
        this.connection = connection
    }

    selectEmployees() {
        return this.connection.promise().query(
          "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id;");
    }

    selectEmployeesByDepartment(departmentId) {
        return this.connection.promise().query(
            "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.id = ?;", departmentId);
    }

    selectEmployeesByManager(managerId) {
        return this.connection.promise().query(
            "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON department.id = role.department_id WHERE manager_id = ?;", managerId);
    }

    selectPossibleManagers(id) {
        return this.connection.promise().query("SELECT id, first_name, last_name FROM employee WHERE id != ?", id);
    }

    updateManager(managerId, employeeId) {
        return this.connection.promise().query(
            "UPDATE employee SET manager_id = ? WHERE id = ?", [managerId, employeeId]);
    }

    addEmployee(employee) {
        return this.connection.promise().query("INSERT INTO employee SET ?", employee);
    }

    deleteEmployee(id) {
        return this.connection.promise().query("DELETE FROM employee WHERE id = ?", id);
    }

    selectRoles() {
        return this.connection.promise().query("SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id;");
    }

    addRole(role) {
        return this.connection.promise().query("INSERT INTO role SET ?", role);
    }

    deleteRole(id) {
        return this.connection.promise().query("DELETE FROM role WHERE id = ?", id);
    }

    updateRole(roleId, employeeId) {
        return this.connection.promise().query(
          "UPDATE employee SET role_id = ? WHERE id = ?",
          [roleId, employeeId]
        );
    }

    selectDepartments() {
        return this.connection.promise().query("SELECT department.id, department.name FROM department;");
    }

    addDepartment(department) {
        return this.connection.promise().query("INSERT INTO department SET ?", department);
    }

    deleteDepartment(id) {
        return this.connection.promise().query("DELETE FROM department WHERE id = ?", id);
    }

    selectDepartmentBudgets() {
        return this.connection.promise().query(
            "SELECT department.id, department.name, SUM(role.salary) AS department_utilized_budget FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id GROUP BY department.id, department.name;");
    }
}

module.exports = new DB(connection);