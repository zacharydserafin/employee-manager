const inquirer = require("inquirer");
const db = require("./db/index.js");
const cTable = require("console.table");

function showPrompts() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: [
                {
                name: "View All Departments",
                value: "View All Departments"
                },
                {
                name: "View All Roles",
                value: "View All Roles"
                },
                {
                name: "View All Employees",
                value: "View All Employees"
                },
                {
                name: "Add Department",
                value: "Add Department"
                },
                {
                name: "Add Role",
                value: "Add Role"
                },
                {
                name: "Add Employee",
                value: "Add Employee"
                },
                {
                name: "Update Employee Role",
                value: "Update Employee Role"
                },
                {
                name: "Quit",
                value: "Quit"
                }
            ]
        }
    ]).then(res => {
        var choice = res.choice;
        switch (choice) {
            case "View All Departments":
                viewAllDepartments();
                break;
            case "View All Roles":
                viewAllRoles();
                break;
            case "View All Employees":
                viewAllEmployees();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            default:
                process.exit();
        }
    })
}

function viewAllDepartments() {
    db.selectDepartments()
        .then(([data]) => console.table(data))
        .then(() => showPrompts());
}

function viewAllRoles() {
    db.selectRoles()
        .then(([data]) => console.table(data))
        .then(() => showPrompts());
}

function viewAllEmployees() {
    db.selectEmployees()
        .then(([data]) => console.table(data))
        .then(() => showPrompts());
}

function addDepartment() {
    inquirer.prompt([
        {
            name: "name",
            message: "What new department would you like to add?"
        }
    ])
    .then(res => {
        db.addDepartment(res)
            .then(() => showPrompts());
    })
}

function addRole() {
    db.selectDepartments()
        .then(([data]) => {
            const departments = data.map(({ id, name }) => (
                {
                name: name,
                value: id
                }
            ));
        inquirer.prompt([
            {
                name: "title",
                message: "What new role would you like to add?"
            },
            {
                name: "salary",
                message: "What is the salary for this role?"
            },
            {
                type: "list",
                name: "department_id",
                message: "Which department does this role fall under?",
                choices: departments
            }
        ])
        .then(res => {
            db.addRole(res)
                .then(() => showPrompts());
        })
    })
}

function addEmployee() {
    inquirer.prompt([
        {
            name: "first_name",
            message: "What is the employee's first name?"
        },
        {
            name: "last_name",
            message: "What is the employee's last name?"
        }
    ])
        .then(res => {
            var firstName = res.first_name;
            var lastName = res.last_name;

            db.selectRoles()
                .then(([data]) => {
                    const roles = data.map(({ id, title }) => (
                        {
                        name: title,
                        value: id
                        }
                    ));
                    inquirer.prompt([
                        {
                        type: "list",
                        name: "roleId",
                        message: "What is the employee's role?",
                        choices: roles
                        }
                    ])
                    .then(res => {
                        var roleId = res.roleId;
                        db.selectEmployees()
                            .then(([data]) => {
                                const managers = data.map(({ id, first_name, last_name }) => (
                                    {
                                    name: `${first_name} ${last_name}`,
                                    value: id
                                    }
                                ));
                                managers.push({ name: "None", value: null });
                                inquirer.prompt([
                                    {
                                        type: "list",
                                        name: "managerId",
                                        message: "Who is this employee's manager?",
                                        choices: managers
                                    }
                                ])
                                .then(res => {
                                    var employee = {
                                        manager_id: res.managerId,
                                        role_id: roleId,
                                        first_name: firstName,
                                        last_name: lastName
                                    }
                                    db.addEmployee(employee)
                                })
                                .then(() => showPrompts())
                            })
                    })
                })
        })
}

function updateEmployeeRole() {
    db.selectEmployees()
        .then(([data]) => {
            const employees = data.map(({ id, first_name, last_name }) => (
                {
                name: `${first_name} ${last_name}`,
                value: id
                }
            ));
            inquirer.prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee is getting a new role?",
                    choices: employees
                }
            ])
            .then(res => {
                var employeeId = res.employeeId;
                db.selectRoles()
                    .then(([data]) => {
                        const roles = data.map(({ id, title }) => (
                            {
                            name: title,
                            value: id
                            }
                        ));
                        inquirer.prompt([
                            {
                                type: "list",
                                name: "roleId",
                                message: "What is the employee's new role?",
                                choices: roles
                            }
                        ])
                            .then(res => db.updateRole(res.roleId, employeeId))
                            .then(() => showPrompts())
                    });
            });
        })
}

showPrompts();