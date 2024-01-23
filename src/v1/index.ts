// Imports
import express from "express";
import url from "url";
import * as dbHandler from "./db_handling/db_handler.ts";

// Server/database setup
const app = express();
const PORT = 8080;
const db = dbHandler.connect("mongodb://localhost:27017/");


// Endpoints


// Initialise server
app.listen(PORT, () => {
    console.log("Server is listening at port " + PORT);
});
