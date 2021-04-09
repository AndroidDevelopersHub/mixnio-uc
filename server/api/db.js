const mysql = require("mysql");

// Dev
const connection = mysql.createConnection({
    host: "localhost",
    user: "mixcweng_api",
    password: "1982gonzoO",
    database: "mixcweng_api"
});

//Local
/*const connection = mysql.
    host: "localhost",
    user: "root",
    password: "123456", // "" , "root"
    database: "mixcweng_api",
    port: 8889
});*/


connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = connection;
