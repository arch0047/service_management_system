require('dotenv').config();
const mysql = require('mysql');

connection = mysql.createConnection({
    host:process.env.HOST,
    database: process.env.DATABASE,
    port:process.env.PORT,
    user:process.env.DATAUSER,
    password:process.env.DATAPASS

});

connection.connect((error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(" Database is connected on port !");
    }
});
