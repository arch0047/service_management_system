const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const port = 8080;

const app = express();
const database = require('./database');

app.use(express.static("frontend"));
app.set('views',path.join(__dirname,'frontend/views'));

app.set('view engine', 'ejs');
// adding session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// admin login
app.get('/login', (req, res) => {
    return res.sendFile(path.join(__dirname + '/frontend/login.html'));
});

app.post('/auth', (req, res) => {
    const adminName = req.body.adminName;
    const password = req.body.password;
        if (adminName && password) {
            connection.query('SELECT * FROM admins WHERE adminName = ? AND password = ?', [adminName, password], function(error, results, fields)
            {
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.adminName = adminName;
                    res.redirect('/adminhome');
                } else {
                    res.send('Incorrect admin name or Password!');
                }
                res.end();
            });
        }
    });
// admin home page
app.get('/adminHome',(req,res) => {
    if(req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/frontend/adminHome.html'));
    } else {
        res.redirect('/login');
    }
});

// register employee
app.get('/register', (req, res) => {
    if (req.session.loggedin) {
    res.render('addUser', {
        title: 'Employee registeration'
    });
} else {
    res.redirect("/");
}
});

function mailConfirmation(confirmationAcc) {

    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'noemi.feeney@ethereal.email',
            pass: 'qY6JucY6CC3yUdpEqt'
        }
    });

    let mailOptions = {
        from: '"Nodemailer contact" <noemi.feeney@ethereal.email>', // sender
        to: confirmationAcc,
        subject: 'Welcome ' + confirmationAcc,
        text: 'En account for you ' + confirmationAcc + 'has been successfully created!'
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            return console.log('There was an error sending confirmation mail...');
        }
        return console.log('Confirmation mail sent...');
    });
}

app.post('/saveEmp',  (req, res) => {
    const employeeName = req.body.employeeName;
    const userId = req.body.userId;
    const plainPassword = req.body.password;
    let password = bcrypt.hashSync(plainPassword, 10);

    const email = req.body.email;
    const department_id = req.body.department_id;
    const data = {employeeName,userId, password,email,department_id};
    let sql = "INSERT INTO employees SET ?";
    connection.query(sql, data,(err, results) => {
        if(err) {
            res.redirect('/register');
            throw err;
        } else{
            res.redirect('/emplist') // redirect to all employee list
            mailConfirmation(email);}
    });
});

// getting all employee list
app.get('/emplist',(req, res) => {
    if (req.session.loggedin) {
        let sql = "SELECT * FROM employees";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('userlist.ejs', {
                title: 'Employee List',
                employees: rows
            });
        });
    } else {
        res.redirect("/login");
    }
});

app.get('/update/:employee_id',(req, res) => {
    const employee_id = req.params.employee_id;
    let sql = `Select * from employees where employee_id = ${employee_id}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.render('updateEmployee', {
            title : 'Update Employee',
            employee : result[0]
        });
    });
});


app.post('/update',(req, res) => {
    const employee_id = req.body.employee_id;
    let sql = "update employees SET employeeName='"+req.body.employeeName+"',userId='"+req.body.userId+"', " +
        "email='"+req.body.email+"' where employee_id ="+employee_id;

    let query = connection.query(sql,(err, results) => {
        if(err) throw err;
        res.redirect('/empList');
    });
});

app.get('/delete/:employee_id',(req, res) => {
    const employee_id = req.params.employee_id;
    let sql = `DELETE from employees where employee_id = ${employee_id}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/empList');
    });
});

// user login page
app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname + '/frontend/userlogin.html'));
});

app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});





// employee
app.post('/authorization', (req, res) => {
    const userId = req.body.userId;
    const password = req.body.password;

    if (userId && password) {
        let encryptedPassword;

        function getClearPassword() {
            connection.query("SELECT password FROM employees WHERE userId = ?", [userId, password],  (error, result, fields) => {
                let passwordResult = JSON.stringify(result);
                return encryptedPassword = passwordResult.substring(14, 74);
            });
        }

        getClearPassword();

        connection.query('SELECT * FROM employees WHERE userId = ? AND password = ?', [userId, password],  (error, result, fields) =>{
            if (bcrypt.compareSync(password, encryptedPassword) === true)  {
                req.session.loggedin = true;
                req.session.userId = userId;
                res.redirect('/userHome');
            } else {
                res.send('Incorrect User Id or Password !');
            }
            res.end();
        });
    } else {
        res.redirect("/");
        res.end();
    }
});

// User home page
app.get('/userHome',(req,res) => {
    if(req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/frontend/userHome.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/logud',(req,res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});










app.listen(port, (error) => {

    if (error) {
        console.log("Due to the error server can not start:", error);
    }
    console.log("Server is running on port:", port);
});