const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');


const router =express.Router();


router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

// Demand Page
//create
router.get('/create', (req, res) => {
   // if (req.session.loggedin) {
        res.render('createDemand', {
            title: 'Create new Demand'
        });
   // } else {
   //     res.redirect("/empHome");
  // }
});

//save
router.post('/save',(req, res)=>{
    const data ={demandTitle,requester,department_id,employee_id,status_id,priority_id,date,time,businessNeed,presentSituation,benefits}= req.body;
    let sql = "INSERT INTO demands SET ?";

    let query = connection.query(sql, data,(err, results) => {
        if(err) throw err;
        res.redirect('/demand/List');
    });
});

// getting all demands list
router.get('/List',(req, res) => {
  //  if (req.session.loggedin) {
        let sql = "SELECT * FROM demands";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'Demands List',
                demands: rows
            });
        });
   // } else {
   //     res.redirect("/empHome");
   // }
});

//Edit demand
router.get('/:demand_id',(req, res)=>{ //    /demand/:incident_id
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

router.post('/edit',(req, res) => {
    const demand_id = req.body.demand_id;
    let sql = "update demands SET demandTitle='"+req.body.demandTitle+"',requester='"+req.body.requester+"', "+
        "department_id ='"+req.body.department_id+"',employee_id='"+req.body.employee_id+"', " +
        "status_id='"+req.body.status_id+"',priority_id ='"+req.body.priority_id+"',date='"+req.body.date+"'," +
        "time ='"+req.body.time+"',businessNeed ='"+req.body.businessNeed+"'," +
        "presentSituation ='"+req.body.presentSituation+"',benefits ='"+req.body.benefits+"' where incident_id ="+incident_id;


    let query = connection.query(sql,(err, results) => {
        console.log(results);
        if(err) throw err;
        res.redirect('/deamnd/List');
    });
});

// getting new demands list by status
router.get('/new',(req, res) => {
   // if (req.session.loggedin) {
        let sql = "Select * from demands where status_id = 1";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'New demands List',
                demands: rows
            });
        });
   // } else {
   //     res.send("<h1>Please choose again there was an error !</h1>");
   // }
});
// In progress demands List
router.get('/inProgress',(req, res) => {
  //  if (req.session.loggedin) {
        let sql = "Select * from demands where status_id =2";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'In progress demands List',
                demands: rows
            });
        });
   // } else {
   //     res.send("<h1>Please choose again there was an error !</h1>");
   // }
});

// getting Closed incidents List
router.get('/closed',(req, res) => {
   // if (req.session.loggedin) {
        let sql = "Select * from demandss where status_id =3";
        let query = connection.query(sql, (err, rows) => {
            if (err) throw err;
            res.render('demandList.ejs', {
                title: 'Closed demands List',
                demands: rows
            });
        });
  //  } else {
   //     res.send("<h1>Please choose again there was an error !</h1>");
  //  }
});




module.exports = router;