const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
const trvl = require('./routes/travelagency');
const static = require('./routes/static');
const history = require('./routes/history');
app.use('/', static);
app.use('/', trvl);
app.use('/', history);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sever is listening on: http://localhost:${PORT}`);
});