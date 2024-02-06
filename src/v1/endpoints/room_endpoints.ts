// Imports
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { Db } from "mongodb";
import * as Room from "../db_handling/room";


// Export module
module.exports = function(app: Express, db: Db) {
    // POST: /rooms
    // Create a new room
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomName: string
    app.post("api/v1/rooms", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomName } = JSON.parse(rawParams);

        // Add new room to database
        let response = await Room.createRoom(db, token, userId, roomName);
        res.status(response.status).send(response);
        return;
    });


    // GET: /rooms
    // Get information about a room
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    app.get("/api/v1/rooms", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let {token, userId} = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId } = JSON.parse(rawParams);

        // Return room information
        let response = await Room.getRoomInfo(db, token, userId, roomId);
        res.status(response.status).send(response);
        return;
    });


    // DELETE: /rooms
    // Delete a room (requires owner privileges)
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    app.delete("/api/v1/rooms", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId } = JSON.parse(rawParams);

        // Delete room
        let response = await Room.deleteRoom(db, token, userId, roomId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /rooms/members
    // Add new user to room
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    // --> newMemberId: string (valid ObjectId)
    app.post("/api/v1/rooms/members", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId, newMemberId } = JSON.parse(rawParams);

        // Add new member to database
        let response = await Room.addUser(db, token, userId, roomId, newMemberId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /rooms/members/remove
    // Remove user from room
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    // --> memberId: string (valid ObjectId) | null (removing self)
    app.post("/api/v1/rooms/members/remove", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId, memberId } = JSON.parse(rawParams);

        // Remove new member from database
        let response = await Room.removeUser(db, token, userId, roomId, memberId||userId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /rooms/admins
    // Promote member to admin
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    // --> memberId: string (valid ObjectId)
    app.post("/api/v1/rooms/admins", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId, memberId } = JSON.parse(rawParams);

        // Promote member in database
        let response = await Room.promoteAdmin(db, token, userId, roomId, memberId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /rooms/admins/demote
    // Demote admin to normal member
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    // --> adminId: string (valid ObjectId) | null
    app.post("/api/v1/rooms/admins/demote", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId, adminId } = JSON.parse(rawParams);

        // Demote admin in database
        let response = await Room.demoteAdmin(db, token, userId, roomId, adminId || userId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /rooms/messages
    // Create a new message
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    // --> contents: string
    // --> reply: string (valid ObjectId) | null
    app.post("/api/v1/rooms/messages", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId, contents, reply } = JSON.parse(rawParams);

        // Add new message to database
        let response = await Room.createMessage(db, token, userId, roomId, contents, reply);
        res.status(response.status).send(response);
        return;
    });


    // GET: /rooms/messages
    // Get all messages
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    app.get("/api/v1/rooms/messages", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId } = JSON.parse(rawParams);

        // Add new message to database
        let response = await Room.getMessages(db, token, userId, roomId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /rooms/messages/edit
    // Edit a message
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> roomId: string (valid ObjectId)
    // --> messageId: string (valid ObjectId)
    // --> contents: string
    app.post("/api/v1/rooms/messages/edit", async (req, res) => {
        // Get + parse token
        let rawToken = req.query.token?.toString();
        if (!rawToken) {
            res.status(StatusCodes.UNAUTHORIZED).send("ERROR: Token not provided");
            return;
        }

        let { token, userId } = JSON.parse(rawToken);

        // Get + parse parameters
        let rawParams = req.query.params?.toString();
        if (!rawParams) {
            res.status(StatusCodes.NOT_ACCEPTABLE).send("ERROR: Parameters not provided");
            return;
        }

        let { roomId, messageId, contents } = JSON.parse(rawParams);

        // Edit message in database
        let response = await Room.editMessage(db, token, userId, roomId, messageId, contents);
        res.status(response.status).send(response);
        return;
    });
}
