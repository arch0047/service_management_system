
const mysql = require('mysql');

connection = mysql.createConnection({
    database:'service_management',
    user:'root',
    password: 'password',
    host: '127.0.0.1',
    port: 3306
});

connection.connect((error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Database is connected !');
    }
});


