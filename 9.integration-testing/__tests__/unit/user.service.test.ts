import * as userRepositories from "../../src/repositories/user.repository";
import * as userServices from "../../src/services/user.service"
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../src/mailer/mailer";
import { emailTemplate } from "../../src/mailer/emailTemplates";

//mock all external dependencies
jest.mock("../src/repositories/user.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../src/mailer/mailer");
jest.mock("../src/mailer/emailTemplates");


describe("User Service Test Suite", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    //listUsers
    it("should return a list of users", async () => {
        // "userid": 1,
        // "first_name": "Alice",
        // "last_name": "Mwangi",
        // "email": "alice@gmail.com",
        // "phone_number": "0711000001"
        const mockUsers = [{
            userid: 1,
            first_name: "Alice",
            last_name: "Mwangi",
            email: "alice@gmail.com",
            phone_number: "0711000001"
        },
        {
            userid: 2,
            first_name: "Brian",
            last_name: "Kemboi",
            email: "kemboi@gmail.com",
            phone_number: "0711000001"
        }
        ];

        (userRepositories.getUsers as jest.Mock).mockResolvedValue(mockUsers);

        const users = await userServices.listUsers();
        expect(users).toEqual(mockUsers);
        expect(userRepositories.getUsers).toHaveBeenCalledTimes(1);
    });

    //createUser
    it("should hash password, save user, and send verification email", async () => {
        const mockUser = {
            first_name: "Charlie",
            last_name: "Otieno",
            email: "otieno@gmail.com",
            phone_number: "0711000003",
            password: "password123"
        };

        (bycrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
        (userRepositories.createUser as jest.Mock).mockResolvedValue({ message: "user created successfully. Verification code sent to email" });
        (userRepositories.setVerificationCode as jest.Mock).mockResolvedValue({}); //left empty because it returns nothing
        (sendEmail as jest.Mock).mockResolvedValue(true);
        (emailTemplate.verify as jest.Mock).mockReturnValue("<p>Your verification code is 123456</p>");

        const result = await userServices.createUser(mockUser as any);

        expect(bycrypt.hash).toHaveBeenCalledWith("password123", 10);
        expect(userRepositories.createUser).toHaveBeenCalled();
        expect(userRepositories.setVerificationCode).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalled();
        expect(result).toEqual({ message: "user created successfully. Verification code sent to email" });
    });

    //verifyUser
    it("should verify user with correct code", async () => {
        const mockUser = {
            email: "kemboi@gmail.com",
            verification_code: "123456",
            is_verified: false,
            first_name: "Brian",
            last_name: "Kemboi"
        };
        (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (userRepositories.verifyUser as jest.Mock).mockResolvedValue({});
        (sendEmail as jest.Mock).mockResolvedValue(true);
        (emailTemplate.welcome as jest.Mock).mockReturnValue("<p>Account Verified</p>");

        const result = await userServices.verifyUser("kemboi@gmail.com", "123456");

        expect(userRepositories.getUserByEmail).toHaveBeenCalledWith("kemboi@gmail.com");
        expect(userRepositories.verifyUser).toHaveBeenCalledWith("kemboi@gmail.com");
        expect(sendEmail).toHaveBeenCalled();
        expect(result).toEqual({ message: "User verified successfully" });
    });

    it("should throw error for invalid verification code", async () => {
        const mockUser = {
            email: "kemboi@gmail.com",
            verification_code: "123456",
            is_verified: false,
            first_name: "Brian",
            last_name: "Kemboi"
        };

        (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

        await expect(userServices.verifyUser("kemboi@gmail.com", "987654"))
            .rejects
            .toThrow("Invalid verification code");
    });

    //loginUser
    it("should return token and user info when login is successful", async () => {
        const mockUser = {
            userid: 1,
            first_name: 'Mark',
            last_name: 'Too',
            email: 'mark@gmail.com',
            password: 'hashedPass',
            phone_number: '0711000004',
            is_verified: true,
        };

        (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (bycrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue("mockjwtToken");

        const result = await userServices.loginUser("mark@gmail.com", "password123");

        expect(userRepositories.getUserByEmail).toHaveBeenCalledWith("mark@gmail.com");
        expect(jwt.sign).toHaveBeenCalled();
        expect(result).toHaveProperty("token", "mockjwtToken");
        expect(result.user.email).toBe("mark@gmail.com");
    });

    it("should throw error for invalid credentials", async () => {
        const mockUser = { email: 'mark@gmail.com', password: 'hashedPass' };
        (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (bycrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(userServices.loginUser("mark@gmail.com", "wrongpassword"))
            .rejects
            .toThrow("Invalid credentials");
    });

    //updateUser
    it("should update user after hashing password", async () => {
        (userRepositories.getUserById as jest.Mock).mockResolvedValue({ userid: 1 });
        (bycrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
        (userRepositories.updateUser as jest.Mock).mockResolvedValue({ message: "User updated successfully" });

        const result = await userServices.updateUser(1, { password: "newpassword123" } as any);

        expect(bycrypt.hash).toHaveBeenCalledWith("newpassword123", 10);
        expect(userRepositories.updateUser).toHaveBeenCalled();
        expect(result).toEqual({ message: "User updated successfully" });
    });

    //deleteUser
    it("should delete user if exists", async () => {
        (userRepositories.getUserById as jest.Mock).mockResolvedValue({ userid: 1 });
        (userRepositories.deleteUser as jest.Mock).mockResolvedValue({ message: "User deleted successfully" });

        const result = await userServices.deleteUser(1);
        expect(userRepositories.deleteUser).toHaveBeenCalledWith(1);
        expect(result).toEqual({ message: "User deleted successfully" });
    });


});