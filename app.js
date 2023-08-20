const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const app = express();
const port = 3002;

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

app.post('/signup' , async (req , res) => {
    const {username , email , password ,confirmPassword} = req.body;
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
        res.send("Password confirmation failed");
    }

});

app.get('/login' , (req ,res) => {
    res.render('login');
})

app.post('/login' , (req , res) => {
    const {email , password} = req.body;

    db.query('SELECT * FROM users WHERE email = ?' , [email] , async (err , results) => {
        if(err){
            console.log('error in searching email', err);
            return;
        }
        if(results.length > 0){

            const users = results[0];
            const match = await bcrypt.compare(password , users.password);

            if(match){
                res.redirect('/');
            }
            else{
                res.send('invalid password');
            }

            // db.query('SELECT password FROM users WHERE email = ? ' , [email] , async (err , result) => {
            //     if(err){
            //         console.log('error in checking password' , err)
            //         return;
            //     }
                
            //     if(result == hashPassword){
            //         res.redirect('/');
            //     }
            //     else{
            //         res.send('invalid password');
            //     }
        
            // });
        }
        else{
            res.send('invalid email');
        }
    });
});




app.listen(port , (req , res) => {
    console.log(`Server started on port ${port}`);
});


