const express = require("express");
const database = require('./database');
const router = express.Router();



app.use(express.static("frontend"));
app.set('views',path.join(__dirname,'frontend/views'));

app.set('view engine', 'ejs');


app.get('/createInci', (req, res) => {
    if (req.session.loggedin) {
        res.render('addUser', {
            title: 'Employee registeration'
        });
    } else {
        res.redirect("/");
    }
});


module