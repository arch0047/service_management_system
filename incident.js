
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();
const database = require('./database');

app.use(express.static("frontend"));
app.set('views',path.join(__dirname,'frontend/views'));


app.set('view engine', 'ejs');


//Edit incident



app.get('/editInci/:incident_id',(req, res)=>{
    const incident_id = req.params.incident_id;
    let sql = `Select * from incidents where incident_id =${incident_id}`;
    let query = connection.query(sql,(err,result)=>{
        if(err)throw err,
            console.log(result);
        res.render('updateIncident',{
            title: 'Edit Incident',
            incident :result[0]
        });
    });

});

app.post('/edit',(req, res) => {
    const incident_id = req.body.incident_id;
    let sql = `update incidents SET incidentTitle ="${incidentTitle}",status_id="${status_id}", priority_id="${priority_id}",department_id="${department_id}",employee_id="${employee_id}",short_description="${short_description}",
    where incident_id =${incident_id}`;
    let query = connection.query(sql,(err, results) => {
        if(err) throw err;
        res.redirect('/incidentList');
    });
});


