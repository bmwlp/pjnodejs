const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
require('dotenv').config()
const app = express()

app.use(cors())
app.use(express.json())

const connection = mysql.createConnection(process.env.DATABASE_URL)

app.get('/', (req, res) => {
    res.send('Hello baimai!!')
})

app.get('/users', (req, res) => {
    connection.query(
        'SELECT * FROM users',
        function (err, results, fields) {
            res.send(results)
        }
    )
})

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT * FROM users WHERE id = ?', [id],
        function (err, results, fields) {
            res.send(results)
        }
    )
})

app.post('/regis', (req, res) => {
    connection.query(
        'INSERT INTO `users` (`email`, `password`) VALUES (?,?)',
        [req.body.fname, req.body.lname, req.body.username, req.body.password, req.body.phone],
         function (err, results, fields) {
            if (err) {
                console.error('Error in POST /users:', err);
                res.status(500).send('Error adding user');
            } else {
                res.status(201).send(results);
            }
        }
    )
})

// Import bcrypt for password hashing
const bcrypt = require('bcrypt');

// Adjust the login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query the user by email
    connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async function(err, results, fields) {
            if (err) {
                console.error('Error in POST /login:', err);
                res.status(500).send('Error Login');
            } else if (results.length === 0) {
                // If no user found
                res.status(401).send('Invalid email or password');
            } else {
                const user = results[0];
                try {
                    // Compare the provided password with the hashed password
                    const match = await bcrypt.compare(password, user.password);
                    if (match) {
                        // Send back the user data except the password
                        res.status(200).json({
                            email: user.email,
                            fname: user.fname,
                            lname: user.lname,
                            // Add other user details as needed
                        });
                    } else {
                        res.status(401).send('Invalid email or password');
                    }
                } catch (bcryptError) {
                    console.error('Error comparing passwords:', bcryptError);
                    res.status(500).send('Error Login');
                }
            }
        }
    );
});



app.put('/users', (req, res) => {
    connection.query(
        'UPDATE `users` SET `fname`=?, `lname`=?, `username`=?, `password`=?, `avatar`=? WHERE id =?',
        [req.body.fname, req.body.lname, req.body.username, req.body.password, req.body.avatar, req.body.id],
         function (err, results, fields) {
            res.send(results)
        }
    )
})

app.delete('/users', (req, res) => {
    connection.query(
        'DELETE FROM `users` WHERE id =?',
        [req.body.id],
         function (err, results, fields) {
            res.send(results)
        }
    )
})

app.listen(process.env.PORT || 4004, () => {
    console.log('CORS-enabled web server listening on port 4000')
})
