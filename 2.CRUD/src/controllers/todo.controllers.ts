
import { Request, Response } from 'express';
import * as todoServices from '../services/todo.service'
import { getPool } from '../db/config'

//bad practice controller doing everything
export const getAllTodosController = async (req: Request, res: Response) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Todos');
        res.status(200).json(result.recordset);

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

    }
}

//bad practice controller doing everything
export const AddTodoController = async (req: Request, res: Response) => {
    const { todo_name, description, due_date, user_id } = req.body;
    try {
        const pool = await getPool();
        await pool
            .request()
            .input('todo_name', todo_name)
            .input('description', description)
            .input('due_date', due_date)
            .input('user_id', user_id)
            .query('INSERT INTO Todos (todo_name, description, due_date, user_id) VALUES (@todo_name, @description, @due_date, @user_id)');
        res.status(201).json({ message: 'Todo created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//get all todos
export const getTodos = async (req: Request, res: Response) => {
    try {
        const todos = await todoServices.listTodos();
        res.status(200).json(todos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

//get todo by id
export const getTodoById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const todo = await todoServices.getTodo(id)
        res.status(200).json(todo)

    } catch (error: any) {
        if (error.message === 'Inavlid todoid') {
            res.status(400).json({ message: 'Inavlid todoid' })
        } else if (error.message == 'Todo not found') {
            res.status(404).json({ message: 'Todo not found' })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}


//create new todo
export const createTodo = async (req: Request, res: Response) => {
    const todo = req.body;
    try {
        const result = await todoServices.createTodo(todo);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

//update a todo
export const updateTodo = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const todo = req.body
    try {
        const result = await todoServices.updateTodo(id, todo)
        res.status(200).json(result)
    } catch (error: any) {
        if (error.message === 'Inavlid todoid') {
            res.status(400).json({ message: 'Inavlid todoid' })
        } else if (error.message == 'Todo not found') {
            res.status(404).json({ message: 'Todo not found' })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }

    }

}


// delete a todo by id
export const deleteTodo = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const result = await todoServices.deletTodo(id)
        res.status(204).json(result)
    } catch (error: any) {
        if (error.message === 'Inavlid todoid') {
            res.status(400).json({ message: 'Inavlid todoid' })
        } else if (error.message == 'Todo not found') {
            res.status(404).json({ message: 'Todo not found' })
        } else {

            res.status(500).json({ error: 'Internal server error' })
        }

    }
}