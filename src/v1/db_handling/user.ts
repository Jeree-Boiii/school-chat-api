// ABOUT:
// This file contains functions for dealing with users


// Imports
import { Db, ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { createToken, deleteToken, validToken } from "./db_handler.ts";


// Login, create token, return token
export async function login(db: Db, userName: string|null, email: string|null, password: string) {
	// Create query depending on which parameter is given
    let query: object;
    if (userName) {
		query = {userName: {$eq: userName}};
	} else if (email) {
		query = {email: {$eq: email}};
	} else {
		return {
            token: null,
            status: StatusCodes.NOT_ACCEPTABLE
        }
	}

    // Send + process request
	let collection = db.collection("users");
	
    let result = await collection.findOne(query);
    if (result && result.password == password) {
        let token = await createToken(db, result._id);
        return {
            token: token,
            status: StatusCodes.CREATED
        };
    } else {
        return {
            token: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }
}


// Logout, delete token
export async function logout(db: Db, token: ObjectId, userId: ObjectId) {
     // Check if token is valid
     if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }
    
    // Delete token
    if (await deleteToken(db, token)) {
        return {
            success: true,
            status: StatusCodes.OK
        }
    } else {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }
}


// Create user
export async function createUser(db: Db, userName: string, realName: string, email: string, password: string, teacher: boolean, year: number, classLetter: string) {
    // Check if user already exists
    let collection = db.collection("users");
    
    let findResult = await collection.findOne({ $or: [ {userName: {$eq: userName}}, {email: {$eq: email}} ] })
    if (findResult) {
        return {
            created: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Create user object to be inserted
    let user = {
        userName: userName,
        realName: realName,
        email: email,
        password: password,
        teacher: teacher,
        form: { year: year, classLetter: classLetter },
        classes: [],
        rooms: []
    }

    // Insert user into database
    let insertResult = await collection.insertOne(user);
    if (insertResult.acknowledged) {
        return {
            id: insertResult.insertedId,
            status: StatusCodes.CREATED
        }
    } else {
        return {
            id: null,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Delete user
export async function deleteUser(db: Db, token: ObjectId, userId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Logout the user before deletion
    if (!(await logout(db, token, userId)).success) {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }

    // Delete user
    let collection = db.collection("users");
    let result = await collection.findOneAndDelete({ _id: {$eq: userId} });
    if (result) {
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


// Get user information
export async function getUserInfo(db: Db, token: ObjectId, userId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            user: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Get user
    let collection = db.collection("users");
    let result = await collection.findOne({ _id: {$eq: userId} });

    if (!result) {
        return {
            user: null,
            status: StatusCodes.NOT_FOUND
        }
    }

    return {
        user: {
            id: result._id,
            userName: result.userName,
            realName: result.realName,
            email: result.email,
            teacher: result.teacher,
            form: result.form,
            classes: result.classes
        },
        status: StatusCodes.OK
    }
}
