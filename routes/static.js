const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const router = express.Router();
var pic1 = "/img/image1.jpg";
var pic2 = "/img/image2.jpg";
var pic3 = "/img/image3.jpg";

router.get('/', (req, res) => {
    res.render('index', { pic1, pic2, pic3 });
});
router.get('/contacts', (req, res) => {
    res.render('contacts', {});
});

module.exports = router;