const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const PatientRouter = require('./routes/PatientRouter');
const DoctorRouter = require('./routes/DoctorRouter');
const UserRouter = require('./routes/UserRouter');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = express();

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/ArabicSystem')
    .then(() => {
        console.log("MongoDb connection done");
    })
    .catch((err) => {
        console.log('MongoDb connection failed:', err);
    });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/patient', PatientRouter);
app.use('/api/v1/doctor', DoctorRouter);
app.use('/api/v1/users', UserRouter);

app.get('/', (req, res) => {
    res.json({
        status: "success",
        message: "Welcome to the Arabic AI System"
    });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
