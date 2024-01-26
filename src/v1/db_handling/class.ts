// ABOUT:
// This file contains functions for dealing with classes


// Imports
import { Db, ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { validToken } from "./db_handler.ts";


// Create room
export async function createClass(db: Db, token: ObjectId, userId: ObjectId, className: string) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is a teacher
    let collection = db.collection("users");

    let find_response = await collection.findOne(userId);
    if (!find_response || !find_response.teacher) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Create class object to be inserted
    let newClass = {
        className: className,
        teacher: userId,
        notices: [],
        assignments: [],
        students: []
    }

    // Insert class into database
    collection = db.collection("classes");
    let insertResponse = await collection.insertOne(newClass);

    if (insertResponse.acknowledged) {
        return {
            id: insertResponse.insertedId,
            status: StatusCodes.CREATED
        }
    } else {
        return {
            id: null,
            status: StatusCodes.CREATED
        }
    }
}


// Get information about class
export async function getClassInfo(db: Db, token: ObjectId, userId: ObjectId, classId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            class: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Get class
    let collection = db.collection("classes");
    let response = await collection.findOne({ _id: {$eq: classId} });

    if (!response) {
        return {
            class: null,
            status: StatusCodes.NOT_FOUND
        }
    }

    return {
        class: {
            _id: response._id,
            className: response.className,
            teacher: response.teacher,
            students: response.students
        }
    }
}


// Add student to class
export async function addStudent(db: Db, token: ObjectId, userId: ObjectId, classId: ObjectId, targetId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check that target isn't teacher
    let collection = db.collection("users");
    let findResponse = await collection.findOne({ _id: {$eq: targetId} });
    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    } else if (findResponse.teacher) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check that user is teacher of class
    collection = db.collection("classes");
    findResponse = await collection.findOne({ _id: {$eq: classId} });

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    } else if (findResponse.teacher != userId) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check that target isn't already part of class
    if (findResponse.students.includes(targetId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Add target to students
    let updateResult = await collection.updateOne({ _id: { $eq: classId } }, { $push: { students: targetId} });
    if (updateResult.acknowledged) {
        return {
            success: true,
            status: StatusCodes.OK
        }
    } else {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Remove student from class
export async function removeStudent(db: Db, token: ObjectId, userId: ObjectId, classId: ObjectId, targetId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({ _id: {$eq: classId} });

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (findResponse.teacher != userId) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is student in class
    if (!findResponse.students.includes(targetId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Remove target from class
    let updateResult = await collection.updateOne({ _id: {$eq: classId} }, { $pull: {students: {$eq: targetId}} });
    if (!updateResult.acknowledged) {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }

    return {
        success: true,
        status: StatusCodes.OK
    }
}
