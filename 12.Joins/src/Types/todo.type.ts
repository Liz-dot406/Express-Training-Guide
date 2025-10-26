
// type todo
export interface Todo {
    todoid: number;
    todo_name: string;
    description: string;
    due_date: string;
    user_id: number;
}

// type creating new todo
export interface NewTodo {
    todo_name: string;
    description: string;
    due_date: string;
    user_id: number;
}

// type updating todo
export interface UpdateTodo {
    todo_name?: string;
    description?: string;
    due_date?: string;
    user_id?: number;
}