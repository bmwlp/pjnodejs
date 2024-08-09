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

//login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // ตรวจสอบว่ามีการส่ง email และ password มาหรือไม่
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.execute(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length > 0) {
      // ถ้าพบผู้ใช้ที่มี email และ password ตรงกับในฐานข้อมูล
      res.status(200).json({ success: true, message: 'Login successful', user: results[0] });
    } else {
      // ถ้าไม่พบผู้ใช้
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  });
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


app.get('/information', (req, res) => {
    connection.query(
        'SELECT * FROM information',
        function (err, results, fields) {
            res.send(results)
        }
    )
})


app.listen(process.env.PORT || 3000, () => {
    console.log('CORS-enabled web server listening on port 3000')
})
