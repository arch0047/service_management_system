const express = require("express");
const session = require('express-session');
const router =require("express").Router();


// adding session for admin
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

module.exports = router;