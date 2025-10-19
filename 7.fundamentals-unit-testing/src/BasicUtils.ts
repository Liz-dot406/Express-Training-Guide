import { IAuthData } from "./authData";

export function product(a: number, b: number): number {
    return a * b
}

export function authenticateUser(username: string, password: string): IAuthData {
    //simulate authentication logic
    const authStatus = username === "deveLOPER" && password === "dev"
    return {
        usernameToLower: username.toLowerCase(),
        usernameCharacters: username.split(""),
        userDetails: { name: "Developer", role: "admin" },
        isAuthenticated: authStatus
    }

}


export function UserNameToLowerCase(username: string): string {
    if (username === "") {
        throw new Error("Username cannot be empty");
    }
    return username.toLowerCase();
}