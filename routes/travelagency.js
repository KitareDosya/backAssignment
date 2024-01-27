const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const axios = require('axios');
app.use(express.static("public"));
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');

const apiKey = "24d64906-30b8-4cf8-bb29-aa672b6bfbd5";
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/travelagency', (req, res) => {
    const filePath = path.join(__dirname, '../public/html', 'travelagency.html');
    res.sendFile(filePath);
});


router.post('/submitForm', (req, res) => {
    const adults = req.body.adults;
    const children = req.body.children;
    const phone = req.body.phone;
    const hotelRating = req.body.hotelRating;
    const dateArrival = req.body.dateArrival;
    const dateDeparture = req.body.dateDeparture;
    const cityName = req.body.cityName;
    var lat = 0;
    var lon = 0;
    switch (cityName) {
        case "Kyoto":
            lat = 35.01;
            lon = 135.76;
            price = 1000;
            break;
        case "Rome":
            lat = 41.89;
            lon = 12.48;
            price = 1500;
            break;
        case "Sydney":
            lat = -33.87;
            lon = 151.21;
            price = 1700;
            break;
        case "Rio de Janeiro":
            lat = -22.90;
            lon = -43.21;
            price = 800;
            break;
        case "Bangkok":
            lat = 13.75;
            lon = 100.50;
            price = 1100;
            break;
        case "Antalia":
            lat = 36.90;
            lon = 30.70;
            price = 700;
            break;
        default:
            lat = 55.75;
            lon = 37.62;
            price = 500;
            break;
    }
    switch (hotelRating) {
        case "5":
            price += 500;
            break;
        case "4":
            price += 400;
            break;
        case "3":
            price += 300;
            break;
        case "2":
            price += 200;
            break;
        case "1":
            price += 100;
            break;
        default:
            price += 100;
            break;
    }
    price *= adults;
    if (children > 0) {
        for (let i = 0; i < children; i++) {
            price += 200;
        }
    }
    if (temp < 10) {
        price += 200;
    }
    url = `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}`;
    var temp
    var condition
    axios.get(url, {
        headers: {
            'X-Yandex-API-Key': apiKey
        }
    }).then(response => {
        temp = response.data.fact.temp
        condition = response.data.fact.condition
        switch (condition) {
            case "showers":
                price -= 100;
                break;
            case "thunderstorm":
                price = 0;
                break;
            default:
                break;
        }

        if (price == 0) {
            const filePath = path.join(__dirname, '../public/html', 'flightCanceled.html');
            res.sendFile(filePath);
        } else {

            res.render('result', { cityName, adults, children, phone, hotelRating, dateArrival, dateDeparture, price, temp, condition });
        }
    }).catch(error => {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });

    });

});


module.exports = router;