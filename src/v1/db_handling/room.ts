// ABOUT:
// This file contains functions for dealing with chatrooms


// Imports
import { Db, ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { validToken } from "./db_handler";


// Create room
export async function createRoom(db: Db, tokenRaw: string, userIdRaw: string, roomName: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);

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


// Delete room
export async function deleteRoom(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is owner of the room
    let collection = db.collection("rooms");
    let findResponse = await collection.findOne({ _id: {$eq: roomId} });

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (!userId.equals(findResponse.owner)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Delete room
    let deleteResponse = await collection.deleteOne({ _id: {$eq: roomId} });
    if (!deleteResponse.acknowledged) {
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


// Get room info
export async function getRoomInfo(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);

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
export async function addUser(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string, targetIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);
    let targetId = new ObjectId(targetIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user exists
    let collection = db.collection("users");
    let findResult = await collection.findOne({ _id: targetId });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if room exists
    collection = db.collection("rooms");

    findResult = await collection.findOne({ _id: {$eq: roomId} });
    if (!findResult) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Check if user is admin
    findResult.admins.forEach((admin: ObjectId) => {
        if (userId.equals(admin)) {
            return {
                success: false,
                status: StatusCodes.UNAUTHORIZED
            }
        }
    })

    // Check if target is already in room
    findResult.allMembers.forEach((member: ObjectId) => {
        if (userId.equals(member)) {
            return {
                success: false,
                status: StatusCodes.CONFLICT
            }
        }
    })

    // Add target
    let updateResult = await collection.updateOne({ _id: { $eq: roomId } }, { $push: { members: targetId} });
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


// Promote user to admin
export async function promoteAdmin(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string, targetIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);
    let targetId = new ObjectId(targetIdRaw);

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
    if (!userId.equals(findResult.owner)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is already admin
    findResult.admins.forEach((admin: ObjectId) => {
        if (targetId.equals(admin)) {
            return {
                success: false,
                status: StatusCodes.CONFLICT
            }
        }
    })

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
export async function kickUser(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string, targetIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);
    let targetId = new ObjectId(targetIdRaw);

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

    // Check if user is admin (also target for later)
    let userIsAdmin = false;
    let targetIsAdmin = false;
    findResult.admins.forEach((admin: ObjectId) => {
        if (userId.equals(admin)) userIsAdmin = true;
        if (targetId.equals(admin)) targetIsAdmin = true;
    })
    if (!userIsAdmin) {
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
    if (targetIsAdmin && !userId.equals(findResult.owner)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Remove member from room
    let updateResult = await collection.updateOne({ _id: {$eq: roomId} }, { $pull: {admins: {$eq: targetId}} });
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


// Demote user from admin
export async function demoteAdmin(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string, targetIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);
    let targetId = new ObjectId(targetIdRaw);

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
    if (!userId.equals(findResult.owner)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is already admin
    let targetIsAdmin = false;
    findResult.admins.forEach((admin: ObjectId) => {
        if (targetId.equals(admin)) targetIsAdmin = true;
    })
    if (!targetIsAdmin) {
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
export async function createMessage(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string, contents: string, reply: ObjectId|null) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);

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
    let isMember = false;
    findResult.allMembers.forEach((member: ObjectId) => {
        if (userId.equals(member)) isMember = true;
    })
    if (!isMember) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
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
export async function editMessage(db: Db, tokenRaw: string, userIdRaw: string, roomIdRaw: string, messageIdRaw: string, newContents: ObjectId) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let roomId = new ObjectId(roomIdRaw);
    let messageId = new ObjectId(messageIdRaw);

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

    // Check if message exists and user is the author
    let messageIndex = -1;
    for (let i=0; i<findResult.messages.length; i++) {
        if (messageId.equals(findResult.messages[i]._id) && userId.equals(findResult.messages[i].author)) {
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
    let updateResult = await collection.updateOne({ _id: {$eq: roomId} }, { $set: { [contentsStr]: newContents, [editedStr]: true } });

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
