// Imports
import express from "express";

import * as DbHandler from "./db_handling/db_handler";
import * as Room from "./db_handling/room";
import * as Class from "./db_handling/class";


// Server/database setup
const app = express();
const PORT = 8080;
const db = DbHandler.connect("mongodb://localhost:27017/");


// Include endpoints
require("./endpoints/user_endpoints")(app, db);


// Initialise server
app.listen(PORT, () => {
    console.log("Server is listening at port " + PORT);
});
