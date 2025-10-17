import fs from 'fs/promises';
import path from 'path';

// Configuration
const BLACKLIST_FILE_PATH = path.join(__dirname,'../db/blacklist.json');
const SAVE_DEBOUNCE_MS = 1000; // Save to file after 1 second of inactivity

// In-memory cache
let tokenBlacklist = new Map<string, Date>();
let userTokensMap = new Map<string | number, Set<string>>();
let saveTimeout: NodeJS.Timeout | null = null;
let isInitialized = false;

/**
 * Storage structure for JSON file
 */
interface BlacklistData {
  tokens: Array<{ token: string; expiresAt: string }>;
  userTokens: Array<{ userId: string | number; tokens: string[] }>;
}

/**
 * Initialize the service by loading data from JSON file
 */
export const initializeBlacklist = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    // Ensure data directory exists
    const dir = path.dirname(BLACKLIST_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });

    // Try to read existing file
    const fileContent = await fs.readFile(BLACKLIST_FILE_PATH, 'utf-8');
    const data: BlacklistData = JSON.parse(fileContent);

    // Load tokens into memory
    tokenBlacklist = new Map(
      data.tokens.map(({ token, expiresAt }) => [token, new Date(expiresAt)])
    );

    // Load user tokens into memory
    userTokensMap = new Map(
      data.userTokens.map(({ userId, tokens }) => [userId, new Set(tokens)])
    );

    // Clean up expired tokens after loading
    cleanupExpiredTokens();

    console.log('Token blacklist initialized from file');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create empty one
      await saveToFile();
      console.log('Created new token blacklist file');
    } else {
      console.error('Error initializing blacklist:', error);
    }
  }

  isInitialized = true;
};

/**
 * Save blacklist data to JSON file
 */
const saveToFile = async (): Promise<void> => {
  try {
    const data: BlacklistData = {
      tokens: Array.from(tokenBlacklist.entries()).map(([token, expiresAt]) => ({
        token,
        expiresAt: expiresAt.toISOString(),
      })),
      userTokens: Array.from(userTokensMap.entries()).map(([userId, tokens]) => ({
        userId,
        tokens: Array.from(tokens),
      })),
    };

    await fs.writeFile(BLACKLIST_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving blacklist to file:', error);
  }
};

/**
 * Debounced save to file
 */
const debouncedSave = (): void => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    await saveToFile();
    saveTimeout = null;
  }, SAVE_DEBOUNCE_MS);
};

/**
 * Add a token to the blacklist
 */
export const addTokenToBlacklist = async (
  token: string,
  expiresAt?: Date
): Promise<void> => {
  await initializeBlacklist();

  const expiry = expiresAt || new Date(Date.now() + 8 * 60 * 60 * 1000);
  tokenBlacklist.set(token, expiry);
  
  cleanupExpiredTokens();
  debouncedSave();
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  await initializeBlacklist();

  if (!tokenBlacklist.has(token)) {
    return false;
  }

  const expiresAt = tokenBlacklist.get(token);
  if (expiresAt && expiresAt < new Date()) {
    tokenBlacklist.delete(token);
    debouncedSave();
    return false;
  }

  return true;
};

/**
 * Remove a token from the blacklist
 */
export const removeTokenFromBlacklist = async (token: string): Promise<void> => {
  await initializeBlacklist();

  tokenBlacklist.delete(token);
  debouncedSave();
};

/**
 * Clear all blacklisted tokens
 */
export const clearBlacklist = async (): Promise<void> => {
  await initializeBlacklist();

  tokenBlacklist.clear();
  userTokensMap.clear();
  await saveToFile();
};

/**
 * Track a token for a specific user
 */
export const trackUserToken = (
  userId: string | number,
  token: string
): void => {
  if (!userTokensMap.has(userId)) {
    userTokensMap.set(userId, new Set());
  }
  userTokensMap.get(userId)!.add(token);
  debouncedSave();
};

/**
 * Get all tokens for a specific user
 */
export const getUserTokens = (userId: string | number): Set<string> => {
  return userTokensMap.get(userId) || new Set();
};

/**
 * Remove a specific token from user tracking
 */
export const removeUserToken = (
  userId: string | number,
  token: string
): void => {
  const tokens = userTokensMap.get(userId);
  if (tokens) {
    tokens.delete(token);
    if (tokens.size === 0) {
      userTokensMap.delete(userId);
    }
    debouncedSave();
  }
};

/**
 * Blacklist all tokens for a specific user
 */
export const blacklistAllUserTokens = async (
  userId: string | number
): Promise<number> => {
  await initializeBlacklist();

  const userTokens = getUserTokens(userId);
  
  for (const token of userTokens) {
    await addTokenToBlacklist(token);
  }
  
  const count = userTokens.size;
  userTokensMap.delete(userId);
  
  debouncedSave();
  return count;
};

/**
 * Cleanup expired tokens from the blacklist
 */
const cleanupExpiredTokens = (): void => {
  const now = new Date();
  let hasChanges = false;

  for (const [token, expiresAt] of tokenBlacklist.entries()) {
    if (expiresAt < now) {
      tokenBlacklist.delete(token);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    debouncedSave();
  }
};

/**
 * Manually trigger cleanup of expired tokens
 */
export const cleanupExpiredTokensManually = async (): Promise<number> => {
  await initializeBlacklist();

  const initialSize = tokenBlacklist.size;
  cleanupExpiredTokens();
  const removedCount = initialSize - tokenBlacklist.size;

  if (removedCount > 0) {
    await saveToFile();
  }

  return removedCount;
};

/**
 * Get blacklist statistics
 */
export const getBlacklistStats = async () => {
  await initializeBlacklist();

  return {
    totalBlacklistedTokens: tokenBlacklist.size,
    totalTrackedUsers: userTokensMap.size,
    totalTrackedTokens: Array.from(userTokensMap.values()).reduce(
      (sum, tokens) => sum + tokens.size,
      0
    ),
  };
};

/**
 * Callback handler when user logs out of all sessions
 */
export const handleLogoutAll = async (
  userId: string | number
): Promise<void> => {
  console.log(`User ${userId} requested logout from all sessions`);

  const blacklistedCount = await blacklistAllUserTokens(userId);

  console.log(`Successfully blacklisted ${blacklistedCount} tokens for user ${userId}`);

  // Force immediate save for logout all
  await saveToFile();

  // Add any additional cleanup logic here:
  // - Clear user cache
  // - Invalidate sessions
  // - Notify other services
  // - Trigger audit logs
};

/**
 * Force save to file (useful for graceful shutdown)
 */
export const flushToFile = async (): Promise<void> => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  await saveToFile();
};

/**
 * Storage service object for auth config
 */
export const tokenBlacklistStorageService = {
  add: addTokenToBlacklist,
  has: isTokenBlacklisted,
  remove: removeTokenFromBlacklist,
  clear: clearBlacklist,
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Saving blacklist before shutdown...');
  await flushToFile();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Saving blacklist before shutdown...');
  await flushToFile();
  process.exit(0);
});