
import { Request, Response } from 'express';
import * as userServices from '../services/user.service'

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
    const user = req.body;
    //badrequest if id is not a number
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    //notfound if user does not exist
    const existingUser = await userServices.getUser(id);
    if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    //proceed to update
    try {
        const result = await userServices.updateUser(id, user);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

//delete a user
export const deleteUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    //badrequest if id is not a number
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    //notfound if user does not exist
    const user = await userServices.getUser(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    //proceed to delete
    try {
        const result = await userServices.deleteUser(id);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

