import { Router } from "express";
import fs from "fs";
import path from "path";
import auth from "@flycatch/auth-core";

const router = Router();

// Path to the JSON database file
const dbPath = path.join(__dirname, "../db/user.json");

/**
 * Read users safely from db.json
 */
const readUsers = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return [];
  }
};

/**
 * GET /users — Protected Route
 */
router.get("/users", auth.verify("ROLE_USER"), (req, res) => {
  try {
    const users = readUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * ✅ OAuth Success Route
 * Triggered when authentication succeeds
 */
router.get("/oauth-success", (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Login Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f0f8ff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .box {
            background: #ffffff;
            padding: 40px 50px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 {
            color: #1a73e8;
          }
          p {
            color: #333;
          }
          a {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: #1a73e8;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          }
          a:hover {
            background: #155ab6;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>🎉 Login Successful</h1>
          <p>You have successfully logged in via OAuth.</p>
          <a href="/">Go to Homepage</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * ❌ OAuth Failure Route
 * Triggered when authentication fails
 */
router.get("/oauth-failure", (req, res) => {
  res.status(401).send(`
    <html>
      <head>
        <title>Login Failed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #fff0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .box {
            background: #ffffff;
            padding: 40px 50px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 {
            color: #d93025;
          }
          p {
            color: #333;
          }
          a {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: #d93025;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          }
          a:hover {
            background: #b0241d;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>❌ Login Failed</h1>
          <p>Something went wrong during the authentication process.</p>
          <a href="/">Try Again</a>
        </div>
      </body>
    </html>
  `);
});

export default router;


