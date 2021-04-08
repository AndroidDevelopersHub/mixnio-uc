const mysql = require("mysql");


// Dev
/*const connection = mysql.createConnection({
    host: "localhost",
    user: "mixcweng_api",
    password: "1982gonzoO",
    database: "mixcweng_api"
});*/

//Local
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "mixcweng_api",
    port: 8889
});


connection.connect((err) => {
    if (err) throw err;

    console.log("Connected!");

    // Keep Server Alive to avoid auto shut down
    // https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection


    // on server stuck send signal to server
/*    setInterval(function () {
        connection.query("SELECT 1");
        // console.log("set Interval running!");
    }, 5000);*/


});

module.exports = connection;
