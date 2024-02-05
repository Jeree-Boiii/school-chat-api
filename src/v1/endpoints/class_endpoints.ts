// Imports
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { Db } from "mongodb";
import * as Class from "../db_handling/class";


// Export module
module.exports = function(app: Express, db: Db) {
    // POST: /classes
    // Create a new room
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> className: string
    app.post("api/v1/classes", async (req, res) => {
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

        let { className } = JSON.parse(rawParams);

        // Add new room to database
        let response = await Class.createClass(db, token, userId, className);
        res.status(response.status).send(response);
        return;
    });


    // GET: /classes
    // Get information about a class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    app.get("/api/v1/classes", async (req, res) => {
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

        let { classId } = JSON.parse(rawParams);

        // Return room information
        let response = await Class.getClassInfo(db, token, userId, classId);
        res.status(response.status).send(response);
        return;
    });


    // DELETE: /classes
    // Delete a class (requires teacher privileges)
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    app.delete("/api/v1/classes", async (req, res) => {
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

        let { classId } = JSON.parse(rawParams);

        // Delete room
        let response = await Class.deleteClass(db, token, userId, classId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /classes/students
    // Add new student to class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    // --> newStudentId: string (valid ObjectId)
    app.post("/api/v1/classes/students", async (req, res) => {
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

        let { classId, newStudentId } = JSON.parse(rawParams);

        // Add new member to database
        let response = await Class.addStudent(db, token, userId, classId, newStudentId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /classes/students/remove
    // Remove students from class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    // --> studentId: string (valid ObjectId)
    app.post("/api/v1/classes/students/remove", async (req, res) => {
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

        let { classId, studentId } = JSON.parse(rawParams);

        // Remove new member from database
        let response = await Class.removeStudent(db, token, userId, classId, studentId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /classes/notices
    // Create notice for class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    // --> title: string
    // --> description: string
    // --> image: string | null
    app.post("/api/v1/classes/notices", async (req, res) => {
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

        let { classId, title, description, image } = JSON.parse(rawParams);

        // Remove new member from database
        let response = await Class.createNotice(db, token, userId, classId, title, description, image);
        res.status(response.status).send(response);
        return;
    });


    // DELETE: /classes/notices
    // Delete notice in class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    // --> noticeId: string (valid ObjectId)
    app.delete("/api/v1/classes/notices", async (req, res) => {
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

        let { classId, noticeId } = JSON.parse(rawParams);

        // Remove new member from database
        let response = await Class.deleteNotice(db, token, userId, classId, noticeId);
        res.status(response.status).send(response);
        return;
    });


    // POST: /classes/notices/edit
    // Edit notice in class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    // --> noticeId: string (valid ObjectId)
    // --> title: string | null
    // --> description: string | null
    // --> image: string | null
    app.post("/api/v1/classes/notices/edit", async (req, res) => {
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

        let { classId, noticeId, title, description, image } = JSON.parse(rawParams);

        // Remove new member from database
        let response = await Class.editNotice(db, token, userId, classId, noticeId, title, description, image);
        res.status(response.status).send(response);
        return;
    });


    // POST: /classes/assignments
    // Create assignment for class
    // REQUIRES TOKEN
    // --> token: string (valid ObjectId)
    // --> userId: string (valid ObjectId)
    // Parameters:
    // --> classId: string (valid ObjectId)
    // --> title: string
    // --> description: string
    // --> dueDate: Date
    // --> image: string | null
    app.post("/api/v1/classes/notices", async (req, res) => {
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

        let { classId, title, description, dueDate, image } = JSON.parse(rawParams);

        // Remove new member from database
        let response = await Class.createAssignment(db, token, userId, classId, title, description, dueDate, image);
        res.status(response.status).send(response);
        return;
    });
}
