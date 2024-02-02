// Imports
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { Db } from "mongodb";
import * as User from "../db_handling/user";


// Export module
module.exports = function(app: Express, db: Db) {
    // POST: /users
    // Create user
    // Parameters:
    // --> userName: string
    // --> realName: string
    // --> email: string
    // --> password: string
    // --> year: number
    // --> classLetter: string
    // Returns
    // --> id: string (valid ObjectId)   | ID of inserted user
    // --> status: number                | HTTP Status Code
    app.post("/users", async (req, res) => {
        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (rawParams == undefined) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let {userName, realName, email, password, year, classLetter} = JSON.parse(rawParams);

        // Add user to database
        let response = await User.createUser(db, userName, realName, email, password, false, year, classLetter);
        res.status(response.status).send(JSON.stringify(response));
        return;
    });


    // GET: /users
    // Get information about user
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> targetId: string (valid ObjectId) | ID of user being searched for
    // Returns:
    // --> user: {}                          | Information about user
    // --> status: number                    | HTTP Status Code
    app.get("/users", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (rawToken == undefined) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let {token, userId} = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (rawParams == undefined) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let {targetId} = JSON.parse(rawParams);

        // Return user information
        let response = await User.getUserInfo(db, token, userId, targetId);
        res.status(response.status).send(JSON.stringify(response));
    });


    // POST: /users/login
    // Login and get login token
    // Parameters:
    // --> userName: string|null
    // --> email: string|null
    // --> password: string
    app.post("/users/login", async (req, res) => {
        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (rawParams == undefined) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let {userName, email, password} = JSON.parse(rawParams);

        // Return login token
        let response = await User.login(db, userName, email, password);
        res.status(response.status).send(JSON.stringify(response));
    });


    // POST: /users/logout
    // Logout user
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> N/A
    app.post("/users/logout", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (rawToken == undefined) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let {token, userId} = JSON.parse(rawToken);

        // Return response
        let response = await User.logout(db, token, userId);
        res.status(response.status).send(JSON.stringify(response));
    });


    // POST: /users/delete
    // Delete user
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> N/A
    app.post("users/delete", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (rawToken == undefined) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let {token, userId} = JSON.parse(rawToken);

        // Return response
        let response = await User.deleteUser(db, token, userId);
        res.status(response.status).send(JSON.stringify(response));
    });
}
