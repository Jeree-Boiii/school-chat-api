// ABOUT:
// This file contains functions for dealing with classes


// Imports
import { Db, ObjectId } from "mongodb";
import { StatusCodes } from "http-status-codes";
import { validToken } from "./db_handler";


// Create room
export async function createClass(db: Db, tokenRaw: string, userIdRaw: string, className: string) {
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

    // Check if user is a teacher
    let collection = db.collection("users");

    let find_response = await collection.findOne(userId);
    if (!find_response) {
        return {
            id: null,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }
    if (!find_response.teacher) {
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
            id: insertResponse.insertedId.toString(),
            status: StatusCodes.CREATED
        }
    } else {
        return {
            id: null,
            status: StatusCodes.CREATED
        }
    }
}


// Delete class
export async function deleteClass(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);

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

    if (!userId.equals(findResponse.teacher)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Delete class
    let deleteResponse = await collection.deleteOne({ _id: {$eq: classId} });
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


// Get information about class
export async function getClassInfo(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);

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
            _id: response._id.toString(),
            className: response.className,
            teacher: response.teacher,
            students: response.students
        },
        status: StatusCodes.OK
    }
}


// Add student to class
export async function addStudent(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, targetIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);
    let targetId = new ObjectId(targetIdRaw);

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
    findResponse.students.forEach((student: ObjectId) => {
        if (targetId.equals(student)) {
            return {
                success: false,
                status: StatusCodes.CONFLICT
            }
        }
    })

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
export async function removeStudent(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, targetIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);
    let targetId = new ObjectId(targetIdRaw);

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

    if (!userId.equals(findResponse.teacher)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if target is student in class
    let targetIsStudent = false;
    findResponse.students.forEach((student: ObjectId) => {
        if (targetId.equals(student)) targetIsStudent = true;
    })
    if (!targetIsStudent) {
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


// Create notice
export async function createNotice(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, title: string, description: string, image: string|null) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({_id: {$eq: classId}});

    if (!findResponse) {
        return {
            id: null,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (!userId.equals(findResponse.teacher)) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Create notice object to be inserted
    let noticeId = new ObjectId();
    let notice = {
        _id: noticeId,
        author: userId,
        title: title,
        description: description,
        image: image
    }

    // Insert notice
    let updateResponse = await collection.updateOne({_id: {$eq: classId}}, {$push: {notices: notice}});

    if (!updateResponse.acknowledged) {
        return {
            id: null,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }

    return {
        id: noticeId.toString(),
        status: StatusCodes.CREATED
    }
}


// Edit notice
export async function editNotice(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, noticeIdRaw: string, newTitle: string|null, newDescription: string|null, newImage: string|null) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);
    let noticeId = new ObjectId(noticeIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({_id: {$eq: classId}});

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (!userId.equals(findResponse.teacher)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check that notice exists
    let noticeIndex = -1;

    for (let i=0; i<findResponse.notices.length; i++) {
        if (noticeId.equals(findResponse.notices[i])) {
            noticeIndex = i;
            break;
        }
    }

    if (noticeIndex == -1) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Update notice
    let updateParams: {[index: string]: any} = {};
    if (newTitle) updateParams[`notices.${noticeIndex}.title`] = newTitle;
    if (newDescription) updateParams[`notices.${noticeIndex}.description`] = newDescription;
    if (newImage) updateParams[`notices.${noticeIndex}.title`] = newImage;

    let updateResponse = await collection.updateOne({ _id: { $eq: noticeId } }, { $set: updateParams });

    if (!updateResponse.acknowledged) {
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


// Delete notice
export async function deleteNotice(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, noticeIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);
    let noticeId = new ObjectId(noticeIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({_id: {$eq: classId}});

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (userId.equals(findResponse.teacher)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Delete notice
    let updateResponse = await collection.updateOne({ _id: {$eq: classId} }, { $pull: { notices: { _id: {$eq: noticeId} } } });

    if (!updateResponse.acknowledged) {
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


// Create assignment
export async function createAssignment(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, title: string, description: string, dueDate: Date, image: string|null) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({_id: {$eq: classId}});

    if (!findResponse) {
        return {
            id: null,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (!userId.equals(findResponse.teacher)) {
        return {
            id: null,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Create assignment object to be inserted
    let assignmentId = new ObjectId();
    let assignment = {
        _id: assignmentId,
        author: userId,
        title: title,
        description: description,
        dueDate: dueDate,
        image: image
    }

    // Insert assignment
    let updateResult = await collection.updateOne({ _id: {$eq: classId} }, { $push: {assignments: assignment} });

    if (!updateResult.acknowledged) {
        return {
            id: null,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }
    }

    return {
        id: assignmentId.toString(),
        status: StatusCodes.CREATED
    }
}


// Edit assignment
export async function editAssignment(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, assignmentIdRaw: string, field: string, value: string|Date|null) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);
    let assignmentId = new ObjectId(assignmentIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({_id: {$eq: classId}});

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (!userId.equals(findResponse.teacher)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if assignment exists
    let assignmentIndex = -1;

    for (let i=0; i<findResponse.assignments.length; i++) {
        if (assignmentId.equals(findResponse.assignments[i])) {
            assignmentIndex = i;
            break;
        }
    }

    if (assignmentIndex == -1) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    // Edit assignment
    let fieldStr = `assignments.${assignmentIndex}.${field}`
    let updateResponse = await collection.updateOne({ _id: {$eq: classId} }, { $set: {[fieldStr]: value} });

    if (!updateResponse.acknowledged) {
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


// Delete assignment
export async function deleteAssignment(db: Db, tokenRaw: string, userIdRaw: string, classIdRaw: string, assignmentIdRaw: string) {
    // Convert strings to ObjectIds
    let token = new ObjectId(tokenRaw);
    let userId = new ObjectId(userIdRaw);
    let classId = new ObjectId(classIdRaw);
    let assignmentId = new ObjectId(assignmentIdRaw);

    // Check if token is valid
    if (!(await validToken(db, token, userId))) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Check if user is teacher of class
    let collection = db.collection("classes");
    let findResponse = await collection.findOne({_id: {$eq: classId}});

    if (!findResponse) {
        return {
            success: false,
            status: StatusCodes.NOT_FOUND
        }
    }

    if (!userId.equals(findResponse.teacher)) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED
        }
    }

    // Delete assignment
    let updateResponse = await collection.updateOne({ _id: {$eq: classId} }, { $pull: { assignments: { _id: {$eq: assignmentId} } } });

    if (!updateResponse.acknowledged) {
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
