import * as userRepositories from '../repositories/user.repository'
import { NewUser, UpdateUser } from '../Types/user.type';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
import dotenv from 'dotenv';


dotenv.config();

export const listUsers = async () => await userRepositories.getUsers();
export const getUser = async (id: number) => await userRepositories.getUserById(id);
export const createUser = async (user: NewUser) => {
    //hash the pasword before saving
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
        console.log(user.password);
    }
    return await userRepositories.createUser(user);
}

//export const updateUser = async (id: number, user: any) => await userRepositories.updateUser(id, user);
export const updateUser = async (id: number, user: UpdateUser) => {
    await ensureUserExists(id);
    //hash the pasword before saving
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
        console.log(user.password);
    }
    return await userRepositories.updateUser(id, user);
}
// export const deleteUser = async (id: number) => await userRepositories.deleteUser(id);
export const deleteUser = async (id: number) => {
    await ensureUserExists(id);
    return await userRepositories.deleteUser(id);
}

//Reusable function to check if user exists-helper
const ensureUserExists = async (id: number) => {
    const user = await userRepositories.getUserById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

//login function
export const loginUser = async (email: string, password: string) => {
    //find user by email
    const user = await userRepositories.getUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    //compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    //create JWT payload
    const payload = {
        sub: user.userid,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hour expiration
    }

    // generate JWT token
    const secret = process.env.JWT_SECRET as string;
    if (!secret) throw new Error('JWT secret not defined');
    const token = jwt.sign(payload, secret);

    // return token + user details except password
    return {
        message: 'Login successful',
        token,
        user: {
            userid: user.userid,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number
        }
    }
}

