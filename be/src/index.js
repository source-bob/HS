import express from 'express';
import authRouter from './routes/auth-router.js';
import userRouter from './routes/user-router.js';
import cors from 'cors';

const hostname = '127.0.0.1';
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
