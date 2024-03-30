const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const { userRouter } = require('./Router/userRoutes');
app.use(cors());
app.use(express.json());

app.use('/users', userRouter);


app.get('/', (req, res) => {
    res.send('Hello Pokemon Masters!');
});


app.listen(process.env.PORT, async () => {
    try {
        const connection = mongoose.connect(process.env.mongoURL);
        console.log("Conneted to DB");
    } catch (error) {
        console.log(error);
    }
});