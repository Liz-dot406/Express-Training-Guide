
import { Request, Response } from 'express';
import * as userServices from '../services/user.service'
import { User } from '../Types/user.type';

//get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userServices.listUsers();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

//get user by id    
export const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const user = await userServices.getUser(id);
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

//create new user
export const createUser = async (req: Request, res: Response) => {
    const user = req.body;
    try {
        const result = await userServices.createUser(user);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

//update a user
export const updateUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    //badrequest if id is not a number
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    //proceed to update
    try {
        const user = req.body;
        const result = await userServices.updateUser(id, user);
        res.status(200).json(result);
    } catch (error: any) {
        //notfound if user does not exist
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

//delete a user
export const deleteUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    //badrequest if id is not a number
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    //proceed to delete
    try {
        const result = await userServices.deleteUser(id);
        res.status(200).json(result);
    } catch (error: any) {
        //notfound if user does not exist
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

