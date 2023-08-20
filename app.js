const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const { error } = require('console');

const app = express();
const port = 3009;

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'mydatabase1'
});

db.connect( err => {
    if(err){
        console.log('database connection failed' , err);
    }
    else{
        console.log('Database connected');
    }
});

app.set('view engine' , 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public')));


app.use(session({
    secret : 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.get('/' , (req , res) => {
    if(req.session.user){
        res.render('index', { loggedin : true});
    }
    else{
        res.render('index' , {loggedin : false});
    }
});

app.get('/signup', (req , res) => {
    res.render('signup' , {errors : {} , email : '' , password : '' , username : ''});
});

app.post('/signup' , async (req , res) => {
    const {username , email , password ,confirmPassword} = req.body;
    const errors = {};

    if(password.length < 8){
        errors.passwordlength = true;
    }
    else{

        if(confirmPassword == password)
        {
    
            db.query('SELECT * FROM users WHERE email = ?' , [email] , async (err, results) => {
                if(err){
                    console.log('error in checking the existing database' , err);
                    return
                }
                if(results.length > 0){
                    return res.send('account already exists');
                }
    
                const hashPassword = await bcrypt.hash(password , 10);
        
                db.query('INSERT INTO users (username , email , password) VALUES (? , ? , ?)' , [username , email , hashPassword] , (err , result) => {
                    if(err){
                        console.log('Insertion of data in the database failed');
                        res.send('Sign up failed');
                    }
                    else{
                        console.log('Data inserted in the databse');
                        res.redirect('/login');
                    }
                });
            });
    
        }
        else{
            errors.passwordmatch = true;
        }
    }

    if(Object.keys(errors).length > 0){
        return res.render('signup' , {errors , email , password , username});
    }


});

app.get('/login' , (req ,res) => {
    res.render('login' , {errors : {} , email : '' , password : ''});
})

app.post('/login' , (req , res) => {
    const {email , password} = req.body;
    const errors = {};
    const status = {};

    db.query('SELECT * FROM users WHERE email = ?' , [email] , async (err , results) => {
        if(err){
            console.log('error in searching email', err);
            return;
        }
    
        if(results.length > 0){

            if(password.length < 8){
                errors.passwordlength = true;
            }
            else{
                const users = results[0];
                const match = await bcrypt.compare(password , users.password);
    
                if(match){
                    res.redirect('/');
                }
                else{
                    errors.invalidpassword = true;
                }
            }
        }
        else{
            errors.emailnotfound = true;
        }

        if (Object.keys(errors).length > 0) {
            return res.render('login', { errors, email , password});
        }
    });
});




app.listen(port , (req , res) => {
    console.log(`Server started on port ${port}`);
});


