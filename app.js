const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const app = express();
const port = 3000;

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

app.get('/' , (req , res) => {
    res.render('index');
});

app.get('/signup', (req , res) => {
    res.render('signup');
});

app.get('/login' , (req ,res) => {
    res.render('login');
})

app.post('/signup' , async (req , res) => {
    const {username , email , password , confirmPassword} = req.body;

    if(consfirmPassword == password)
    {

        const hashPassword = await bcrypt.hash(password , 10);
        
        db.query('INSERT INTO users (username , email , password) VALUES (? , ? , ?)' , [username , email , hashPassword] , (err , result) => {
            if(err){
                console.log('Insertion of data in the database failed');
                res.send('Sign up failed');
            }
            else{
                console.log('Data inserted in the databse');
                res.redirect('/');
            }
        });
    }
    else{
        res.send("Password confirmation failed");
    }


});


app.listen(port , (req , res) => {
    console.log(`Server started on port ${port}`);
});


