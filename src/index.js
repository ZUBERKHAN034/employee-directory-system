const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require("multer");
const route = require('../src/routes/route');

// application method
const app = express();

// global middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(multer().any());

/*----------------------------------------------------------------------
🗃️ connect mongo db
----------------------------------------------------------------------*/
mongoose.connect("mongodb+srv://zuberkhan034:Khan5544266@cluster0.ouo9x.mongodb.net/company", {
    useNewUrlParser: true
})
    .then((result) => console.log("MongoDb is connected"))
    .catch((err) => console.log(err));


app.use('/', route);


app.listen(process.env.PORT || 3000, () => {
    console.log('Express app running on port ' + (process.env.PORT || 3000));
});