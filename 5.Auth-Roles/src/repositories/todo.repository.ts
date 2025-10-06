import { getPool } from '../db/config'
import { NewTodo, Todo, UpdateTodo } from '../Types/todo.type';

//get all todos
export const getAllTodos = async (): Promise<Todo[]> => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Todos');
    return result.recordset;
}

//get todo by id
export const getTodoById = async (id: number): Promise<Todo> => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM Todos WHERE todoid = @id');
    return result.recordset[0];
}

//create new todo
export const createTodo = async (todo: NewTodo) => {
    const pool = await getPool();
    await pool
        .request()
        .input('todo_name', todo.todo_name)
        .input('description', todo.description)
        .input('due_date', todo.due_date)
        .input('user_id', todo.user_id)
        .query('INSERT INTO Todos (todo_name, description, due_date, user_id) VALUES (@todo_name, @description, @due_date, @user_id)');
    return { message: 'Todo created successfully' };
}

/* JSON Example
{
    "todo_name": "New Todo",
    "description": "This is a new todo",
    "due_date": "2023-12-31",
    "user_id": 1
}
*/

// update a todo
export const updateTodo = async (id: number, todo: UpdateTodo) => {
    const pool = await getPool();
    await pool
        .request()
        .input('id', id)
        .input('todo_name', todo.todo_name)
        .input('description', todo.description)
        .input('due_date', todo.due_date)
        .input('user_id', todo.user_id)
        .query('UPDATE Todos SET todo_name = @todo_name, description = @description, due_date = @due_date, user_id = @user_id WHERE todoid = @id');
    return { message: 'Todo updated successfully' };
}

//delete a todo
export const deleteTodo = async (id: number) => {
    const pool = await getPool();
    await pool
        .request()
        .input('id', id)
        .query('DELETE FROM Todos WHERE todoid = @id');
    return
}