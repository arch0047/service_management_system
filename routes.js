const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Validator } = require('node-input-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config()


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

//welcome page
app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname + '/frontend/welcome.html'));
});

// admin login & authentication
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
    res.redirect("/adminHome");
}
});

// sending mail conformation
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

// adding employee and bcrypt password
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
            res.redirect('/emplist');   // redirect to all employee list
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


//update employee by id
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

// updating data in to database
app.post('/update',(req, res) => {
    const employee_id = req.body.employee_id;
    let sql = "update employees SET employeeName='"+req.body.employeeName+"',userId='"+req.body.userId+"', " +
        "email='"+req.body.email+"' where employee_id ="+employee_id;

    let query = connection.query(sql,(err, results) => {
        if(err) throw err;
        res.redirect('/empList');
    });
});


// delete employee
app.get('/delete/:employee_id',(req, res) => {
    const employee_id = req.params.employee_id;
    let sql = `DELETE from employees where employee_id = ${employee_id}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/empList');
    });
});

// admin logout
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});

// Employee login page
app.get('/empLogin', (req, res) => {
    return res.sendFile(path.join(__dirname + '/frontend/userlogin.html'));
});

// employee authentication
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
                res.redirect('/empHome');
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

// Employee home page
app.get('/empHome',(req,res) => {
    if(req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/frontend/userHome.html'));
    } else {
        res.redirect('/empLogin');
    }
});

//employee logout
app.get('/logud',(req,res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/empLogin');
        }
    });
});

// Incident Page
//create
app.get('/createInci', (req, res) => {
    if (req.session.loggedin) {
    res.render('addIncident', {
        title: 'Create new Incident'
    });
    } else {
        res.redirect("/empHome");
    }
});

//save
app.post('/saveInci',(req, res)=>{
    console.log(req.body);
    const data1 ={incidentTitle, creator, date, time, status_id, priority_id, department_id, employee_id, short_description}= req.body;
    let sql = "INSERT INTO incidents SET ?";

    let query = connection.query(sql, data1,(err, results) => {
        if(err) throw err;
        res.redirect('/incidentList');
    });
});

// getting all incidents list
app.get('/incidentList',(req, res) => {
    if (req.session.loggedin) {
        let sql = "SELECT * FROM incidents";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('incidentList.ejs', {
                title: 'Incidents List',
                incidents: rows
            });
        });
    } else {
        res.redirect("/emplogin");
    }
});

//Edit incident by incident_id
app.get('/editInci/:incident_id',(req, res)=>{
    const incident_id = req.params.incident_id;
    let sql = `Select * from incidents where incident_id =${incident_id}`;
    let query = connection.query(sql,(err,result)=>{
        if(err)throw err,
            res.render('updateIncident',{
                title: 'Edit Incident',
                incident :result[0]
            });
    });

});

// updating data into the database
app.post('/editInci',(req, res) => {
    const incident_id = req.body.incident_id;
    let sql = "update incidents SET incidentTitle='"+req.body.incidentTitle+"',status_id='"+req.body.status_id+"', " +
        "priority_id='"+req.body.priority_id+"',department_id ='"+req.body.department_id+"',employee_id='"+req.body.employee_id+"'," +
        "short_description ='"+req.body.short_description+"'where incident_id ="+incident_id;


    let query = connection.query(sql,(err, results) => {
        console.log(results);
        if(err) throw err;
        res.redirect('/incidentList');
    });
});

// getting new incidents list by status
app.get('/newList',(req, res) => {
    if (req.session.loggedin) {
        let sql = "Select * from incidents where status_id =1";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('incidentList.ejs', {
                title: 'New incidents List',
                incidents: rows
            });
        });
    } else {
        res.send("<h1>Please choose again there was an error !</h1>");
    }
});
// In progress incidents List
app.get('/inProgressList',(req, res) => {
    if (req.session.loggedin) {
        let sql = "Select * from incidents where status_id =2";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('incidentList.ejs', {
                title: 'In progress incidents List',
                incidents: rows
            });
        });
    } else {
        res.send("<h1>Please choose again there was an error !</h1>");
    }
});

// getting Closed incidents List
app.get('/closedIncident',(req, res) => {
    if (req.session.loggedin) {
        let sql = "Select * from incidents where status_id =3";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('incidentList.ejs', {
                title: 'Closed incidents List',
                incidents: rows
            });
        });
    } else {
        res.send("<h1>Please choose again there was an error !</h1>");
    }
});

// Demand Page
//create
app.get('/demand_create', (req, res) => {
    if (req.session.loggedin) {
        res.render('createDemand', {
            title: 'Create new Demand'
        });
    } else {
        res.redirect("/empHome");
    }
});

//save
app.post('/save',(req, res)=>{
    const data ={demandTitle,requester,department_id,employee_id,status_id,priority_id,date,time,businessNeed,presentSituation,benefits}= req.body;
    let sql = "INSERT INTO demands SET ?";
    let query = connection.query(sql, data,(err, results) => {
        if(err) throw err;
        res.redirect('/demandList');
    });
});

// getting all demands list
app.get('/demandList',(req, res) => {
    if (req.session.loggedin) {
        let sql = "SELECT * FROM demands";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'Demands List',
                demands: rows
            });
        });
    } else {
        res.redirect("/empHome");
    }
});

//Edit demand
app.get('/demand/:demand_id',(req, res)=>{
    const demand_id = req.params.demand_id;
    let sql = `Select * from demands where demand_id =${demand_id}`;
    let query = connection.query(sql,(err,result)=>{
        if(err)throw err;
        res.render('updateDemand',{
            title: 'Edit Demand',
            demand :result[0]
        });
    });
});

app.post('/edit',(req, res) => {
    const demand_id = req.body.demand_id;
    let sql = "update demands SET demandTitle='"+req.body.demandTitle+"',requester='"+req.body.requester+"', "+
        "department_id ='"+req.body.department_id+"',employee_id='"+req.body.employee_id+"', " +
        "status_id='"+req.body.status_id+"',priority_id ='"+req.body.priority_id+"',date='"+req.body.date+"'," +
        "time ='"+req.body.time+"',businessNeed ='"+req.body.businessNeed+"'," +
        "presentSituation ='"+req.body.presentSituation+"',benefits ='"+req.body.benefits+"' where incident_id ="+incident_id;
    let query = connection.query(sql,(err, results) => {
        console.log(results);
        if(err) throw err;
        res.redirect('/demandList');
    });
});

// getting new demands list by status
app.get('/demand_new',(req, res) => {
    if (req.session.loggedin) {
        let sql = "Select * from demands where status_id = 1";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'New demands List',
                demands: rows
            });
        });
    } else {
        res.send("<h1>Please choose again there was an error !</h1>");
    }
});

// In progress demands List
app.get('/demand_inProgress',(req, res) => {
    if (req.session.loggedin) {
        let sql = "Select * from demands where status_id =2";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'In progress demands List',
                demands: rows
            });
        });
    } else {
        res.send("<h1>Please choose again there was an error !</h1>");
    }
});

// getting Closed demands List
app.get('/demand_closed',(req, res) => {
    if (req.session.loggedin) {
        let sql = "Select * from demands where status_id =3";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'Closed demands List',
                demands: rows
            });
        });
    } else {
        res.send("<h1>Please choose again there was an error !</h1>");
    }
});









app.listen(port, (error) => {

    if (error) {
        console.log("Due to the error server can not start:", error);
    }
    console.log("Server is running on port:", port);
});