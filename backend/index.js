const express = require('express');
const connectDB = require('./db/connectDB')
require('dotenv').config();
const authRoutes = require('./routes/authRoutes')
const app = express();
app.use(express.json())
app.use('/api/auth', authRoutes)

app.listen(3000, () => {
    connectDB();
    console.log('app started');
})