import fs from "fs";
import path from "path";

interface Otp {
  userId: string | number;
  otp: string;
  expiresAt: string; // store as ISO string for JSON
}

const filePath = path.join(__dirname, "../db/otp.json");

export const StoreOtp = async (
  userId: string | number,
  otp: string,
  expiresInMs: number // <-- should be number of ms
) => {
  let otps: Otp[] = [];
  if (fs.existsSync(filePath)) {
    otps = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  const expiryDate = new Date(Date.now() + expiresInMs).toISOString();

  const userOtpIndex = otps.findIndex((data) => data.userId == userId);

  if (userOtpIndex >= 0) {
    // update existing
    otps[userOtpIndex].otp = otp;
    otps[userOtpIndex].expiresAt = expiryDate;
  } else {
    // add new
    otps.push({ userId, otp, expiresAt: expiryDate });
  }

  fs.writeFileSync(filePath, JSON.stringify(otps, null, 2));
};

export const getNonExpiredOtp = async (userId: string | number) => {
  let otps: Otp[] = [];
  if (fs.existsSync(filePath)) {
    otps = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  const userData = otps.find((otp) => otp.userId === userId);
  if (!userData) {
    return null;
  }

  const isExpired = new Date(userData.expiresAt) < new Date();

  if (isExpired) {
    return null;
  }

  return userData.otp;
};

