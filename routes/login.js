const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cookieParser = require('cookie-parser');
const uri = "mongodb+srv://admin:root@cluster0.txanfzf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const db = client.db("travelAgency");
const collection = db.collection("users");
async function run() {
    try {
        await client.connect();
        await client.db("travelAgency").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB! login");
    } finally {}
}

run().catch(console.dir);
err = "";
async function getUser(username, password) {
    let user = null;
    try {
        user = await collection.findOne({ username: username });

        if (!user) {
            err = "noUser";
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            err = "wrongPassword";
            return null;
        }

        return user.token;
    } finally {}
}
async function addUser(username, password, token) {
    try {
        await client.connect();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            username: username,
            password: hashedPassword,
            token: token
        };
        const result = await collection.insertOne(user);
        console.log(`New user created with the following id: ${result}`);
    } finally {}
}
router.use(cookieParser());

router.post('/login', async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(getUser(username, password))
    console.log("entered:", username, password);
    token = await getUser(username, password);
    console.log("token:", token)
    if (token != null) {
        res.cookie('isLogged', true);
        res.cookie('username', username);
        res.cookie('token', token);
        res.redirect('/');
    } else {
        if (err == "noUser") {
            res.redirect('/noUser');
        } else {
            res.redirect('/wrongPassword');
        }
    }
});

router.post('/register', async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log("username: ", username, "password:", password);
    const existingUser = await collection.findOne({ username: username });
    if (existingUser) {
        res.redirect('/existingUser');
        return;
    }
    const token = generateToken();
    addUser(username, password, token);
    res.cookie('isLogged', true);
    res.cookie('username', username);
    res.cookie('token', token);
    res.redirect('/');
});

router.post('/logout', (req, res) => {
    res.clearCookie('isLogged');
    res.clearCookie('username');
    res.clearCookie('token');
    res.redirect('/login');
});

function generateToken() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    let length = 10;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
process.on('SIGINT', async() => {
    await client.close();
    process.exit();
});
module.exports = router;