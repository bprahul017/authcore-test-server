import fs from "fs";
import path from "path";
import { User } from "@flycatch/auth-core/dist/interfaces/user.interface";

const dbPath = path.join(__dirname, "../db/user.json");

/**
 * Helper to read users from db.json
 */
const readUsers = (): User[] => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error("Error reading db.json:", error);
    return [];
  }
};

/**
 * Helper to write users to db.json
 */
const writeUsers = (users: User[]): void => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
};

/**
 * Get user by email
 */
export const getUserByMail = async (email: string): Promise<User | undefined> => {
  const users = readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

/**
 * Verify password
 */
export const verifyPassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return inputPassword === storedPassword;
};

/**
 * Generate unique user ID
 */
const generateUserId = (): number => {
  const users = readUsers();
  const ids = users.map((u) => Number(u.id));
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};

/**
 * Create new user and save to db.json
 */
export const createUser = async (profile: any): Promise<User> => {
  const users = readUsers();

  // Prevent duplicate users by email
  const existing = users.find(
    (user) => user.email.toLowerCase() === profile.email.toLowerCase()
  );
  if (existing) return existing;

  const newUser: User = {
    id: generateUserId(),
    email: profile.email,
    username: profile.username || profile.login || "New User",
    password: profile.password || "",
    is2faEnabled: false,
    grants: [profile.defaultRole || "ROLE_USER"],
  };

  users.push(newUser);
  writeUsers(users);

  return newUser;
};
