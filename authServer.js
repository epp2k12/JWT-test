require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(express.json());

let refreshTokens = [];

const users = [];

app.get('/users', (req, res) => {
    res.json(users);
})

// create the users
app.post('/users', async (req, res) => {

    try {

        // const salt = await bcrypt.genSalt();
        // const hashPassword = await bcrypt.hash(req.body.password, salt);

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { name: req.body.username, password: hashedPassword };
        // save the user 
        users.push(user);
        res.sendStatus(201);



    } catch(err) {
        if(err) res.sendStatus(500);

    }

})

app.post('/login', async (req, res)=> {

    //Authenticate user

    const username = req.body.username;

    const user = users.find((user) => user.name == req.body.username);
    if( user == null ) {
        return res.status(400).send('Cannot find user');
    }
    try {

        if(await bcrypt.compare(req.body.password, user.password)) {

            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            res.json({ accessToken: accessToken, refreshToken: refreshToken });
            
        } else {
            res.send('Not Allowed');
        }


    } catch(err) {

        if(err) res.sendStatus(500);

    }

    

    //  will all happen if user is valid
    // const user = {
    //     name: username
    // }


})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
})

app.post('/token', (req, res) => {

    const refreshToken = req.body.token;

    if(refreshToken == null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name})
        res.json({ accessToken: accessToken });
    })

})

function generateAccessToken(user) {

    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s'});

}




app.listen(4000, ()=> {
    console.log("Node server running on port 4000");
})