const mysql = require("mysql");

// Dev
// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "mixcweng_api",
//     password: "1982gonzoO",
//     database: "mixcweng_api"
// });


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", // "" , "root"
    database: "mixnioDb",
    port: 8889
});


connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = connection;
