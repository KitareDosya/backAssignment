const express = require('express');
const axios = require('axios');
const router = express.Router();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:root@cluster0.txanfzf.mongodb.net/?retryWrites=true&w=majority";
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
        console.log("Pinged your deployment. You successfully connected to MongoDB! History");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
var historyJson;
async function getJson(res) {
    try {
        await client.connect();
        const db = client.db("travelAgency");
        const collection = db.collection("history");
        const history = await collection.find({}).toArray();
        historyJson = history;
        res.render('history', { historyJson });
    } finally {
        await client.close();
    }
}
router.get('/history', (req, res) => {
    getJson(res).catch(console.dir);
});
const apiKey = "24d64906-30b8-4cf8-bb29-aa672b6bfbd5";

const bodyParser = require('body-parser');
const { get } = require('./travelagency');
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/history/edit/:index', async(req, res) => {
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

    url = `https://api.weather.yandex.ru/v2/informers?lat=${lat}&lon=${lon}`;
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
            let isConnected = false;
            async function updateData() {
                try {
                    await client.connect();
                    isConnected = true;
                    const database = client.db('travelAgency');
                    const collection = database.collection('history');
                    const result = await collection.updateOne({ _id: historyJson[index]._id }, { $set: data });
                    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
                } finally {
                    if (isConnected) {
                        await client.close();
                    }
                }
            }
            async function edit() {
                try {
                    await updateData();
                    res.redirect('/history');
                } catch (error) {
                    console.error('Error updating data:', error);
                }
            }
            edit();
        }
    }).catch(error => {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });

    });

});

router.post('/history/delete/:index', async(req, res) => {
    const index = req.params.index;
    let isConnected = false;

    async function deleteData() {
        try {
            await client.connect();
            isConnected = true;
            const database = client.db('travelAgency');
            const collection = database.collection('history');
            const result = await collection.deleteOne({ _id: historyJson[index]._id });
            console.log(`${result.deletedCount} document(s) was/were deleted.`);
        } finally {
            if (isConnected) {
                await client.close();
            }
        }
    }

    try {
        await deleteData();
    } catch (error) {
        console.error('Error deleting data:', error);
    }

    res.redirect('/history');
});


module.exports = router;