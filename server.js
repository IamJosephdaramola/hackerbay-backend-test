require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const connectDB = require('./config/db');

const user = require('./routes/user');

const app = express();

// Body parser
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('tiny'));
}

// Connect to DB
connectDB();
// Initialize passport
app.use(passport.initialize());
require('./config')(passport);

// user route
app.use('/user', user);
const PORT = process.env.PORT || 5000;

let server = app.listen(PORT, console.log(`server running  on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`);
	// close server $ exit process
	server.close(() => process.exit);
});

module.exports = server;
