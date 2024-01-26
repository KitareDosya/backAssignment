const express = require('express');
const app = express();
const static = require('./routes/static');
app.set('view engine', 'ejs');
const trvl = require('./routes/travelagency');
app.use(express.static("public"));

app.use('/', static);
app.use('/', trvl);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sever is listening on: http://localhost:${PORT}`);
});