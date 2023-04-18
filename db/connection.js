const mysql2 = require("mysql2");

const connection = mysql2.createConnection(
    {
    host: "localhost",
    user: "root",
    password: "root",
    database: "employees"
    },
    console.log(`Connected to the employees database.`)
);

module.exports = connection;