require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json());

const posts = [
    {
        username: "superadmin1",
        title: "Response Post 1"
    },
    {
        username: "edl_tester_2",
        title: "Response Post 2"
    },
    {
        username: "edl_tester_3",
        title: "Response Post 3"
    },
]

app.get('/posts', authenticateToken, (req, res)=> {
    res.json(posts.filter((data) => data.username == req.user.name ));
})

app.get('/', (req, res) => {

    const data = {
        status: "ok",
        message: "server is working!"
    }

    res.status(200).json(data);

})

app.post('/login', (req, res)=> {

    //Authenticate user

    const username = req.body.username;

    user = {
        name: username
    }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken });

})

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        req.user = user;
        next();

    })



}



app.listen(3000, ()=> {
    console.log("Node server running on port 3000");
})