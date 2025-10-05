import * as userRepositories from '../repositories/user.repository'

export const listUsers = async () => await userRepositories.getUsers();
export const getUser = async (id: number) => await userRepositories.getUserById(id);
export const createUser = async (user: any) => await userRepositories.createUser(user);
export const updateUser = async (id: number, user: any) => await userRepositories.updateUser(id, user);
export const deleteUser = async (id: number) => await userRepositories.deleteUser(id);

