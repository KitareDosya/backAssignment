const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const axios = require('axios');
app.use(express.static("public"));
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:root@cluster0.txanfzf.mongodb.net/?retryWrites=true&w=majority";

const apiKey = "24d64906-30b8-4cf8-bb29-aa672b6bfbd5";
router.use(bodyParser.urlencoded({ extended: true }));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);


router.get('/travelagency', (req, res) => {
    const filePath = path.join(__dirname, '../public/html', 'travelagency.html');
    res.sendFile(filePath);
});


router.post('/submitForm', (req, res) => {
    adults = req.body.adults;
    children = req.body.children;
    phone = req.body.phone;
    hotelRating = req.body.hotelRating;
    dateArrival = req.body.dateArrival;
    dateDeparture = req.body.dateDeparture;
    cityName = req.body.cityName;
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
    hotelRating += " Star"
    if (children > 0) {
        for (let i = 0; i < children; i++) {
            price += 200;
        }
    }
    if (temp < 10) {
        price += 200;
    }
    url = `https://api.weather.yandex.ru/v2/informers?lat=${lat}&lon=${lon}`;
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
            data = {
                cityName: cityName,
                adults: adults,
                children: children,
                phone: phone,
                hotelRating: hotelRating,
                dateArrival: dateArrival,
                dateDeparture: dateDeparture,
                price: price,
                temp: temp,
                condition: condition
            }

            async function sendData() {
                try {
                    await client.connect();
                    const database = client.db('travelAgency');
                    const collection = database.collection('history');
                    const doc = {
                        cityName: cityName,
                        adults: adults,
                        children: children,
                        phone: phone,
                        hotelRating: hotelRating,
                        dateArrival: dateArrival,
                        dateDeparture: dateDeparture,
                        price: price,
                        temp: temp,
                        condition: condition
                    };
                    const result = await collection.insertOne(doc);
                    console.log(`A document was inserted with the _id: ${result.insertedId}`);
                } finally {
                    await client.close();
                }
            }
            sendData().catch(console.dir);
            res.render('result', { cityName, adults, children, phone, hotelRating, dateArrival, dateDeparture, price, temp, condition });
        }
    }).catch(error => {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });

    });

});


module.exports = router;