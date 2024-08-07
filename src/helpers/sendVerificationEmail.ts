import nodemailer from 'nodemailer';

import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from '@/types/ApiResponse';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass:  process.env.APP_PASS // Use an app password, not your regular password
  }
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const emailContent = VerificationEmail({ username, otp: verifyCode });
    
    // Convert the React element to an HTML string
    const emailHtml = '<!DOCTYPE html>' + 
      require('react-dom/server').renderToStaticMarkup(emailContent);

  

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: email,
      subject: 'Anon Message Verification Code',
      html: emailHtml,
    });

    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}