// ABOUT:
// This file contains basic functions related to the database (+ login tokens)


// Imports
import { Db, MongoClient, ObjectId } from "mongodb";


// Create connection to database
export function connect(uri: string) {
	const client = new MongoClient(uri);
	return client.db("school-chat");
}


// Validate token
export async function validToken(db: Db, token: ObjectId, user: ObjectId) {
	let collection = db.collection("tokens");

	let result = await collection.findOne({_id: {$eq: token}});
	return user.equals(result?.user);
}


// Create token
export async function createToken(db: Db, user: ObjectId) {
	let collection = db.collection("tokens");

	let result = await collection.insertOne({user: user});
	return result.insertedId;
}


// Delete token
export async function deleteToken(db: Db, token: ObjectId) {
	let collection = db.collection("tokens");
	
	return await collection.findOneAndDelete({_id: {$eq: token}});
}
