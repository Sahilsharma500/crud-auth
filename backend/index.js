const express = require('express');
const connectDB = require('./db/connectDB')
require('dotenv').config();
const authRoutes = require('./routes/authRoutes')
const app = express();
const PORT = process.env.PORT;
app.use(express.json())
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log('app started');
})