// Imports
import express from "express";
import { StatusCodes } from "http-status-codes";

import * as DbHandler from "./db_handling/db_handler";
import * as User from "./db_handling/user";
import * as Room from "./db_handling/room";
import * as Class from "./db_handling/class";


// Server/database setup
const app = express();
const PORT = 8080;
const db = DbHandler.connect("mongodb://localhost:27017/");


// Endpoints

// POST: /user
// Create user
// Parameters:
// --> userName: string
// --> realName: string
// --> email: string
// --> password: string
// --> year: number
// --> classLetter: string
// Returns
// --> id: ObjectId   | ID of inserted user
// --> status: number | HTTP Status Code
app.post("/user", async (req, res) => {
    // Get + parse parameters
    let rawParams = req.query.params?.toString();
    if (rawParams == undefined) {
        res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
        return;
    }

    let { userName, realName, email, password, year, classLetter } = JSON.parse(rawParams);

    // Add user to database
    let response = await User.createUser(db, userName, realName, email, password, false, year, classLetter);
    res.status(response.status).send(JSON.stringify(response));
    return;
});


// GET: /user
// Get information about user
// REQUIRES TOKEN
// --> token: ObjectId
// --> userId: ObjectId
// Parameters:
// --> targetId: ObjectId | ID of user being searched for
// Returns:
// --> user: {}           | Information about user
// --> status: number     | HTTP Status Code
app.get("/user", async (req, res) => {
    // Get + parse token
    let rawToken = req.query.token?.toString();
    if (rawToken == undefined) {
        res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
        return;
    }

    let { token, userId } = JSON.parse(rawToken);

    // Get + parse parameters
    let rawParams = req.query.params?.toString();
    if (rawParams == undefined) {
        res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
        return;
    }

    let { targetId } = JSON.parse(rawParams);

    // Return user information
    let response = await User.getUserInfo(db, token, userId, targetId);
    res.status(response.status).send(JSON.stringify(response));
});


// Initialise server
app.listen(PORT, () => {
    console.log("Server is listening at port " + PORT);
});
