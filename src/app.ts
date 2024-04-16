import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import { usersRouter } from './users/users.routes';

dotenv.config();

if (!process.env.PORT) {
  console.log(`No port value specified...`);
}

const PORT = parseInt(process.env.PORT as string, 10);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.get('/health-check', async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({ msg: `All good` });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
  }
});

app.use('/user', usersRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
