import bcrypt from 'bcryptjs';
import fs from 'fs';
import { v4 as random } from 'uuid';
import { IUnitUser, IUser, IUsers } from './users.interface';

let users: IUsers = loadUsers();

function loadUsers(): IUsers {
  try {
    const data = fs.readFileSync('./data/users.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error ${error}`);
    return {};
  }
}

function saveUsers() {
  try {
    fs.writeFileSync('./data/users.json', JSON.stringify(users), 'utf-8');
    console.log(`User save successfully!`);
  } catch (error) {
    console.log(`Error ${error}`);
  }
}

export const findAll = async (): Promise<IUnitUser[]> => Object.values(users);

export const findOne = async (id: string): Promise<IUnitUser> => users[id];

export const create = async (userData: IUnitUser): Promise<IUnitUser | null> => {
  let id = random();
  let checkUser = await findOne(id);

  while (checkUser) {
    id = random();
    checkUser = await findOne(id);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(userData.password, salt);

  const user: IUnitUser = {
    id: id,
    username: userData.username,
    email: userData.email,
    password: hashedPass,
  };

  users[id] = user;

  saveUsers();

  return user;
};

export const findByEmail = async (userEmail: string): Promise<null | IUnitUser> => {
  const allUsers = await findAll();
  const getUser = allUsers.find(result => userEmail === result.email);

  if (!getUser) {
    return null;
  }

  return getUser;
};

export const comparePassword = async (userEmail: string, suppliedPass: string): Promise<null | IUnitUser> => {
  const user = await findByEmail(userEmail);
  const decryptPass = await bcrypt.compare(suppliedPass, user!.password);
  if (!decryptPass) {
    return null;
  }
  return user;
};

export const update = async (id: string, updatedValues: IUser): Promise<IUnitUser | null> => {
  const userExists = await findOne(id);
  if (!userExists) {
    return null;
  }

  if (updatedValues.password) {
    const salt = await bcrypt.genSalt(10);
    const newPass = await bcrypt.hash(updatedValues.password, salt);
    updatedValues.password = newPass;
  }

  users[id] = {
    ...userExists,
    ...updatedValues,
  };

  saveUsers();
  return users[id];
};

export const remove = async (id: string): Promise<null | void> => {
  const user = await findOne(id);
  if (!user) {
    return null;
  }

  delete users[id];

  saveUsers();
};
