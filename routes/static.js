const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
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
const router = express.Router();

router.use(cookieParser());

router.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../public/html', 'index.html');
    res.sendFile(filePath);
});
router.get('/contacts', (req, res) => {
    res.render('contacts', {});
});
router.get('/noUser', (req, res) => {
    res.render('noUser', {});
});
router.get('/wrongPassword', (req, res) => {
    res.render('wrongPassword', {});
});
router.get('/existingUser', (req, res) => {
    res.render('existingUser', {});
});

async function isLoggedIn(req, res) {
    try {
        await client.connect();
        isLogged = req.cookies.isLogged;
        if (isLogged) {
            username = req.cookies.username;
            tokenLS = req.cookies.token;

            try {
                token = (await collection.findOne({ username: username })).token;

                if (tokenLS == token) {
                    res.render("login", { username: username, isLogged: true });
                } else {
                    res.clearCookie('isLogged');
                    res.clearCookie('username');
                    res.clearCookie('token');
                    console.log("incorrect token");
                    res.render("login", { username: "", isLogged: false });
                }
            } catch (error) {
                // Handle any errors related to fetching user or token
                console.error(error);
            }
        } else {
            console.log(req.cookies.isLogged);
            console.log("not logged");
            res.render("login", { username: "", isLogged: false });
        }
    } catch (error) {
        // Handle any connection-related errors
        console.error(error);
    } finally {}
}
router.get('/login', async(req, res) => {
    try {
        await isLoggedIn(req, res);
    } catch (error) {
        console.error(error);
    }
});

process.on('SIGINT', async() => {
    await client.close();
    process.exit();
});
module.exports = router;