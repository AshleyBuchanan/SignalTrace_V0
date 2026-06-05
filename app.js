const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const rssServices = require('./services/rssServices');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes')
require('dotenv').config({ quiet: true });

// pre-am
const app = express();
app.set('view engine', 'ejs');

// database connection
mongoose.connect(process.env.DATABASE_URI, {})
.then((result) => app.listen(process.env.PORT, process.env.IP))
.catch((err) => console.log(err));

// rss feeds
rssServices.collectFeeds();



// chain
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(checkUser);
app.use(authRoutes);



