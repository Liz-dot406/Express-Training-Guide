import * as userRepositories from '../repositories/user.repository'
import { NewUser, UpdateUser } from '../Types/user.type';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
import dotenv from 'dotenv';
import { sendEmail } from '../mailer/mailer';
import { emailTemplate } from '../mailer/emailTemplates';


dotenv.config();

export const listUsers = async () => await userRepositories.getUsers();
export const getUser = async (id: number) => await userRepositories.getUserById(id);
export const createUser = async (user: NewUser) => {
    //1. hash the pasword before saving
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
        console.log(user.password);
    }

    //2. generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); //6 digit code between 100000 and 999999
    //2. save the user
    const result = await userRepositories.createUser(user);

    //save the verification code to the user
    await userRepositories.setVerificationCode(user.email, verificationCode);

    //3. send welcome email to the user
    // -- without template
    // try {
    //     await sendEmail(
    //         user.email,
    //         'Welcome to Todo App By Kemboi🎉',
    //         `<div>
    //         <h2>Welcome ${user.first_name}!</h2>
    //         <p>Thank you for registering with our Todo App. We're excited to have you on board!</p>
    //         <P>You can now log in and start managing your tasks efficiently.</P>
    //         </div>`,
    //     );
    // } catch (error) {
    //     console.error('Error sending welcome email:', error);
    // }

    // -- refactored using email template

    // await sendEmail(
    //     user.email,
    //     'Welcome to Todo App By Kemboi🎉',
    //     emailTemplate.welcome(user.first_name),
    // )

    await sendEmail(
        user.email,
        'Verify your email for Todo App',
        emailTemplate.verify(user.first_name, verificationCode)
    )

    // return result;
    return { message: 'user created successfully. Verification code sent to email' }
}


//verify user email
export const verifyUser = async (email: string, code: string) => {
    const user = await userRepositories.getUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.verification_code !== code) {
        throw new Error('Invalid verification code');
    }
    await userRepositories.verifyUser(email);

    //send email to user notifying successful verification
    await sendEmail(
        user.email,
        'Your email has been verified - Todo App',
        emailTemplate.verifiedSuccess(user.first_name)
    )
    return { message: 'User verified successfully' };
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


//get user with todos
export const getUserWithTodos = async (id: number) => {
    await ensureUserExists(id);
    return await userRepositories.getUserWithTodos(id);
}
