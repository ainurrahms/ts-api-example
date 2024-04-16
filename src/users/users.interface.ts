export interface IUser {
  username: string;
  email: string;
  password: string;
}

export interface IUnitUser extends IUser {
  id: string;
}

export interface IUsers {
  [key: string]: IUnitUser;
}
