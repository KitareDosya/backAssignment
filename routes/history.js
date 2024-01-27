const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
historyJson = JSON.parse(fs.readFileSync('history.json', 'utf8'));
console.log(historyJson);
router.get('/history', (req, res) => {
    historyJson = JSON.parse(fs.readFileSync('history.json', 'utf8'));
    res.render('history', { historyJson });
});
const apiKey = "24d64906-30b8-4cf8-bb29-aa672b6bfbd5";

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/history/edit/:index', (req, res) => {
    historyJson = JSON.parse(fs.readFileSync('history.json', 'utf8'));
    const index = req.params.index;
    switch (req.body.cityNameEdit) {
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
    price *= req.body.adultsEdit;
    if (req.body.childrenEdit > 0) {
        for (let i = 0; i < req.body.childrenEdit; i++) {
            price += 200;
        }
    }

    url = `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}`;
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
        if (temp < 10) {
            price += 200;
        }
        if (price == 0) {
            const filePath = path.join(__dirname, '../public/html', 'flightCanceled.html');
            res.sendFile(filePath);
        } else {
            data = {
                cityName: req.body.cityNameEdit,
                adults: req.body.adultsEdit,
                children: req.body.childrenEdit,
                phone: req.body.phoneEdit,
                hotelRating: req.body.hotelRatingEdit,
                dateArrival: req.body.dateArrivalEdit,
                dateDeparture: req.body.dateDepartureEdit,
                price: price,
                temp: temp,
                condition: condition
            }
            historyJson[index] = data;

            fs.writeFileSync('history.json', JSON.stringify(historyJson));

            res.redirect('/history');
        }
    }).catch(error => {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });

    });

});

router.post('/history/delete/:index', (req, res) => {
    const index = req.params.index;
    historyJson.splice(index, 1);

    fs.writeFileSync('history.json', JSON.stringify(historyJson));

    res.redirect('/history');
});

module.exports = router;