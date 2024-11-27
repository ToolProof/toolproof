import dotenv from "dotenv";
dotenv.config();
console.log("Loaded API Key:", process.env.LANGSMITH_API_KEY);

import fs from "fs";
console.log(".env exists:", fs.existsSync(".env"));
