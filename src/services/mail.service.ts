import { User } from "@flycatch/auth-core/dist/interfaces/user.interface";
import nodemailer from "nodemailer";

const AppPass = "hstq smyn joed sxqq";
const AppUser = "rahul.b@flycatchtech.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AppUser,
    pass: AppPass,
  },
});

export const sendOTP = async (otp: string, user: User) => {
  const sendReport = await transporter.sendMail({
    from: AppUser,
    to: user.email,
    subject: "Two Factor Auth Verification",
    text: `Your Verification OTP: ${otp}`,
  });
  console.log(`Accepted: ${sendReport.accepted}`);
  console.log(`Rejected: ${sendReport.rejected}`);
};
