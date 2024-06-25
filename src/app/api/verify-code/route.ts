import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { createSuccessResponse, createErrorResponse } from '@/utils/responseUtils';

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      
      return createErrorResponse(
        'User not found', 404
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();

      
      return createSuccessResponse('Account verified successfully');

    } else if (!isCodeNotExpired) {
      // Code has expired
      
      return createErrorResponse(
        'Verification code has expired. Please sign up again to get a new code.', 400
      );
    } else {
      // Code is incorrect
      
      return createErrorResponse(
        'Incorrect verification code', 400
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return createErrorResponse('Internal server error', 500);
  }
}