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
                name: "View Employees By Department",
                value: "View Employees By Department"
                },
                {
                name: "View Employees By Manager",
                value: "View Employees By Manager"
                },
                {
                name: "View Utilized Budget By Department",
                value: "View Utilized Budget By Department"
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
                name: "Remove Department",
                value: "Remove Department"
                },
                {
                name: "Remove Role",
                value: "Remove Role"
                },
                {
                name: "Remove Employee",
                value: "Remove Employee"
                },
                {
                name: "Update Employee Role",
                value: "Update Employee Role"
                },
                {
                name: "Update Employee Manager",
                value: "Update Employee Manager"
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
            case "View Employees By Department":
                viewEmployeesByDepartment();
                break;
            case "View Employees By Manager":
                viewEmployeesByManager();
                break;
            case "View Utilized Budget By Department":
                viewUtilizedBudgetByDepartment();
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
            case "Remove Department":
                removeDepartment();
                break;
            case "Remove Role":
                removeRole();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "Update Employee Manager":
                updateEmployeeManager();
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

function viewEmployeesByDepartment() {
    db.selectDepartments()
        .then(([data]) => {
            const departments = data.map(({ id, name }) => ({
                name: name,
                value: id
            }));
            inquirer.prompt([
                {
                    type: "list",
                    name: "departmentId",
                    message: "Which department would you like to view?",
                    choices: departments
                }
            ])
                .then(res => db.selectEmployeesByDepartment(res.departmentId))
                .then(([data]) => console.table(data))
                .then(() => showPrompts());
        });
}

function viewEmployeesByManager() {
    db.selectEmployees()
        .then(([data]) => {
            const potentialManagers = data.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id 
            }));
            inquirer.prompt([
                {
                    type: "list",
                    name: "managerId",
                    message: "Which employee would you like to view subordinates for?",
                    choices: potentialManagers
                }
            ])
                .then(res => db.selectEmployeesByManager(res.managerId))
                .then(([data]) => {
                    if (!data) {
                        console.log("The selected employee has no subordinates");
                    } else {
                        console.table(data);
                    }
                })
                .then(() => showPrompts())
        });
}

function viewUtilizedBudgetByDepartment() {
    db.selectDepartmentBudgets()
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

function removeDepartment() {
    db.selectDepartments()
        .then(([data]) => {
            const departments = data.map(({ id, name }) => ({
                name: name,
                value: id
            }));
            inquirer.prompt([
                {
                    type: "list",
                    name: "departmentId",
                    message: "Which department would you like to remove? (Caution: this will also remove all roles and employees from the selected department)",
                    choices: departments
                }
            ])
                .then(res => db.deleteDepartment(res.departmentId))
                .then(() => console.log("Removed Department From Database"))
                .then(() => showPrompts())
        })
}

function removeRole() {
    db.selectRoles()
        .then(([data]) => {
            const roles = data.map(({ id, title }) => ({
                name: title,
                value: id
            }));
            inquirer.prompt([
                {
                    type: "list",
                    name: "roleId",
                    message: "Which role would you like to remove? (Caution: this will also remove all employees from the selected role)",
                    choices: roles
                }
            ])
                .then(res => db.deleteRole(res.roleId))
                .then(() => console.log("Removed Role From Database"))
                .then(() => showPrompts())
        })
}

function removeEmployee() {
    db.selectEmployees()
        .then(([data]) => {
            const employees = data.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));
            inquirer.prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee would you like to remove?",
                    choices: employees
                }
            ])
                .then(res => db.deleteEmployee(res.employeeId))
                .then(() => console.log("Removed Employee From Database"))
                .then(() => showPrompts())
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

function updateEmployeeManager() {
    db.selectEmployees()
        .then(([data]) => {
            const employees = data.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));
            inquirer.prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee is getting a new manager?",
                    choices: employees
                }
            ])
                .then(res => {
                    let employeeId = res.employeeId;
                    db.selectPossibleManagers(employeeId)
                        .then(([data]) => {
                            const potentialManagers = data.map(({ id, first_name, last_name }) => ({
                                name: `${first_name} ${last_name}`,
                                value: id
                            }));
                            inquirer.prompt([
                                {
                                    type: "list",
                                    name: "managerId",
                                    message: "Who is their new manager?",
                                    choices: potentialManagers
                                }
                            ])
                                .then(res => db.updateManager(res.managerId, employeeId))
                                .then(() => console.log("Updated Employee's Manager"))
                                .then(() => showPrompts())
                        })
                })
        })
}

showPrompts();