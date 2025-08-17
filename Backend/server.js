require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./db/connect');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const allowedOrigins = [
  ...(process.env.FRONTEND_DOMAIN
    ? process.env.FRONTEND_DOMAIN.split(',').map(origin => origin.trim())
    : []),
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_API_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));


app.get('/api/v1', (req, res) => {
  res.send('<h1>SIH</h1>');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
      console.log(process.env.MONGO_URI),
      console.log(process.env.FRONTEND_DOMAIN),
      console.log(process.env.NEXT_PUBLIC_API_URL)
    );
  } catch (error) {
    console.log(error);
  }
};

start();