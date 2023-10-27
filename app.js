const express = require('express');
const app = express();
const path = require('path');
const userRouter = require('./routers/user');
const adminRouter = require('./routers/admin');
const User = require('./models/userSchema');
const session = require('express-session');
const db = require('./config/db');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const adminController = require('./controllers/adminController'); // Import your adminController

require('dotenv').config();


app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
  next();
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', userRouter);
app.use('/admin', adminRouter);

// Call the admin function to create the admin user during initialization
// adminController.admin()
//   .then(() => {
//     console.log('Admin user created during application initialization.');
//   })
//   .catch((error) => {
//     console.error('Error creating admin user during initialization:', error);
//   });

const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
  console.log(`Connected Successfully on Port http://localhost:${PORT}`);
});
