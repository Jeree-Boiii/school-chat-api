// ABOUT:
// This file contains functions for dealing with chatrooms


// Imports
import { Db, ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { validToken } from "./db_handler.ts";


// Create room
export async function createRoom(db: Db, token: ObjectId, userId: ObjectId, roomName: string) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Create room object to be inserted
    let room = {
        roomName: roomName,
        owner: userId,
        messages: [],
        admins: [userId],
        allMembers: [userId]
    }

    // Insert room into database
    let collection = db.collection("rooms");

    let result = await collection.insertOne(room);
    if (result.acknowledged) {
        return {
            id: result.insertedId,
            status: StatusCodes.CREATED
        }
    } else {
        return {
            id: null,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Get room info
export async function getRoomInfo(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            room: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Get room
    let collection = db.collection("rooms");
    let result = await collection.findOne({ _id: {$eq: roomId} });

    if (!result) {
        return {
            room: null,
            status: StatusCodes.NOT_FOUND
        }
    }

    return {
        room: {
            _id: result._id,
            roomName: result.roomName,
            owner: result.owner,
            members: result.allMembers
        },
        status: StatusCodes.OK
    }
}


// Add user to room
export async function addUser(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId, targetId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if room exists
    let collection = db.collection("rooms");

    let findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is admin
    if (!findResult.admins.includes(userId)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is already in room
    if (findResult.allMembers.includes(targetId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Add target
    let updateResult = await collection.updateOne({ _id: { $eq: roomId } }, { $push: { members: targetId} });
    if (updateResult.acknowledged) {
        return {
            success: true,
            status: StatusCodes.CREATED
        }
    } else {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Promote user to admin
export async function promoteAdmin(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId, targetId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if room exists
    let collection = db.collection("rooms");

    let findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is owner
    if (!(findResult.owner == userId)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is already admin
    if (findResult.admins.includes(targetId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Add target to admins
    let updateResult = await collection.updateOne({ _id: { $eq: roomId } }, { $push: { admins: targetId} });
    if (updateResult.acknowledged) {
        return {
            success: true,
            status: StatusCodes.CREATED
        }
    } else {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Remove user from room
export async function kickUser(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId, targetId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if room exists
    let collection = db.collection("rooms");

    let findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is admin
    if (!findResult.admins.includes(userId)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is already in room
    if (!findResult.allMembers.includes(targetId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Check if target is admin (only owner can kick admins)
    if (findResult.admins.includes(targetId)) {
        if (findResult.owner == userId) {
            let updateResult = await collection.updateOne({ _id: {$eq: roomId} }, { $pull: {admins: {$eq: targetId}} });
            if (!updateResult.acknowledged) {
                return {
                    success: false,
                    status: StatusCodes.INTERNAL_SERVER_ERROR
                }
            }
        } else {
            return {
                success: false,
                status: StatusCodes.UNAUTHORIZED
            }
        }
    } else {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Demote user from admin
export async function demoteAdmin(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId, targetId: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if room exists
    let collection = db.collection("rooms");

    let findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is owner
    if (!(findResult.owner == userId)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is already admin
    if (!findResult.admins.includes(targetId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Remove user from admins
    let updateResult = await collection.updateOne({ _id: {$eq: roomId} }, { $pull: {admins: {$eq: targetId}} });
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


// Create new message
export async function createMessage(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId, contents: string, reply: ObjectId|null) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if room exists
    let collection = db.collection("rooms");

    let findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            id: null,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is member
    if (!findResult.allMembers.includes(userId)) {
        return {
            id: null,
            status: StatusCodes.CONFLICT
        }
    }

    // Create message object to be inserted
    let messageId = new ObjectId();
    let message = {
        _id: messageId,
        author: userId,
        contents: contents,
        reply: reply,
        edited: false
    }
    
    // Insert message into database
    let updateResult = await collection.updateOne({ _id: {$eq: roomId} }, { $push: {messages: message} });
    if (updateResult.acknowledged) {
        return {
            id: messageId,
            status: StatusCodes.CREATED
        }
    } else {
        return {
            id: null,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
}


// Edit message
export async function editMessage(db: Db, token: ObjectId, userId: ObjectId, roomId: ObjectId, messageId: ObjectId, newContents: ObjectId) {
    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if room exists
    let collection = db.collection("rooms");

    let findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is member
    if (!findResult.allMembers.includes(userId)) {
        return {
            success: false,
            status: StatusCodes.CONFLICT
        }
    }

    // Check if message exists
    let messageIndex = -1;
    for (let i=0; i<findResult.messages.length; i++) {
        if (messageId == findResult.messages[i]._id) {
            messageIndex = i;
            break;
        }
    }

    if (messageIndex == -1) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Edit message
    let contentsStr = "messages."+messageIndex+".contents";
    let editedStr = "messages."+messageIndex+".edited";
    let updateResult = await collection.updateOne({ _id: {$eq: roomId} }, { $set: { contentsStr: newContents, editedStr: true } });

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
