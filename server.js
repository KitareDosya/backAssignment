const express = require('express');
const app = express();
const helmet = require('helmet');
app.set('view engine', 'ejs');
app.use(express.static("public"));
const trvl = require('./routes/travelagency');
const static = require('./routes/static');
const history = require('./routes/history');
const login = require('./routes/login');
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use('/', static);
app.use('/', trvl);
app.use('/', login);
app.use('/', history);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sever is listening on: http://localhost:${PORT}`);
});