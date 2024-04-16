import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as database from './users.database';
import { IUnitUser } from './users.interface';

export const usersRouter = express.Router();

usersRouter.get('/', async (res: Response) => {
  try {
    const allUsers: IUnitUser[] = await database.findAll();

    if (!allUsers) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No users at that time...` });
    }

    return res.status(StatusCodes.OK).json({ total: allUsers.length, allUsers });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user: IUnitUser = await database.findOne(req.params.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No users at that time` });
    }
    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

usersRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters...` });
    }
    const user = await database.findByEmail(email);

    if (user) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `This email has already been registered...` });
    }

    const newUser = await database.create(req.body);
    return res.status(StatusCodes.CREATED).json({ newUser });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

usersRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters...` });
    }
    const user = await database.findByEmail(email);
    if (user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: `No user exists with the email provided...` });
    }
    const comparePassword = await database.comparePassword(email, password);
    if (!comparePassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Incorrect Password!' });
    }
    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

usersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const id = req.params.id;
    const getUser = database.findOne(id);

    if (!email || !password || !username) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters...` });
    }
    if (!getUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${id}` });
    }
    const updateUser = database.update(id, req.body);
    return res.status(StatusCodes.CREATED).json({ updateUser });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

usersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await database.findOne(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: `User does not exist` });
    }
    await database.remove(id);
    return res.status(StatusCodes.OK).json({ msg: `User successfully deleted!` });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});
