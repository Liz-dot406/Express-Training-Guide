import { getPool } from '../db/config'
import { NewUser, UpdateUser, User } from '../Types/user.type';

//get all users
export const getUsers = async (): Promise<User[]> => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Users');
    return result.recordset;
}

//get user by id
export const getUserById = async (id: number): Promise<User[]> => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('id', id)
        .query('SELECT * FROM Users WHERE userid = @id');
    return result.recordset[0];
};

//create new user -user: any changed to user: NewUser
export const createUser = async (user: NewUser) => {
    const pool = await getPool();
    await pool
        .request()
        .input('first_name', user.first_name)
        .input('last_name', user.last_name)
        .input('email', user.email)
        .input('phone_number', user.phone_number)
        .input('password', user.password)
        .query('INSERT INTO Users (first_name, last_name,email, phone_number, password) VALUES (@first_name, @last_name,@email, @phone_number, @password)');
    return { message: 'User created successfully' };
}

/* JSON Example
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@gmail.com",
    "phone_number": "1234567890",
    "password": "mypass123"
}
*/

//update a user
export const updateUser = async (id: number, user: UpdateUser) => {
    const pool = await getPool();
    await pool
        .request()
        .input('id', id)
        .input('first_name', user.first_name)
        .input('last_name', user.last_name)
        .input('phone_number', user.phone_number)
        .input('password', user.password)
        .input('role', user.role)
        // .query('UPDATE Users SET first_name = @first_name, last_name = @last_name, phone_number = @phone_number WHERE userid = @id');
        .query('UPDATE Users SET first_name = @first_name, last_name = @last_name, phone_number = @phone_number, password = @password, role = @role WHERE userid = @id');
    return { message: 'User updated successfully' };
}


/* update a user json example
{
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "1234567890",
    "password": "mypass123",
    "role": "admin"
}
*/


//delete a user
export const deleteUser = async (id: number) => {
    const pool = await getPool();
    await pool
        .request()
        .input('id', id)
        .query('DELETE FROM Users WHERE userid = @id');
    return { message: 'User deleted successfully' };
}


//get user by email -for login purpose
export const getUserByEmail = async (email: string): Promise<User | null> => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('email', email)
        .query('SELECT * FROM Users WHERE email = @email');
    return result.recordset[0] || null;
}

//set verification code for a user
export const setVerificationCode = async (email: string, code: string) => {
    const pool = await getPool();
    await pool
        .request()
        .input('email', email)
        .input('code', code)
        .query('UPDATE Users SET verification_code = @code, is_verified = 0 WHERE email = @email');
    return { message: 'Verification code saved' };
}

// verify user
export const verifyUser = async (email: string) => {
    const pool = await getPool();
    await pool
        .request()
        .input('email', email)
        .query('UPDATE Users SET is_verified = 1, verification_code = NULL WHERE email = @email');
    return { message: 'User verified successfully' };
};

// get user with their todos
export const getUserWithTodos = async (id: number) => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('id', id)
        .query(`SELECT
        u.userid, u.first_name, u.last_name, u.email, u.phone_number, u.role,
        t.todoid, t.todo_name, t.description, t.created_at, t.due_date     
        FROM Users u
        LEFT JOIN Todos t ON t.user_id = u.userid
        WHERE u.userid = @id
        `);
    const rows = result.recordset;
    // console.log(rows);
    if (rows.length === 0) {
        return null;
    }

    const user = {
        userid: rows[0].userid,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email: rows[0].email,
        phone_number: rows[0].phone_number,
        role: rows[0].role,
        todos: rows
            .filter(row => row.todoid !== null && row.todoid !== undefined)
            .map(row => ({
                todoid: row.todoid,
                todo_name: row.todo_name,
                description: row.description,
                created_at: row.created_at,
                due_date: row.due_date
            }))
    };
    return user;
}