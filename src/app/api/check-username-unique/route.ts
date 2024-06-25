
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';
import { createSuccessResponse, createErrorResponse } from '@/utils/responseUtils';

// username should fulfill usernameValidation
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request:Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = { username: searchParams.get('username') };

    const result = UsernameQuerySchema.safeParse(queryParams);
    console.log(result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return createErrorResponse(
        usernameErrors.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters', 403
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

    if (existingVerifiedUser) {
      return createErrorResponse('Username is already taken',200);
    }

    return createSuccessResponse('Username is unique');
  } catch (error) {
    console.error('Error checking username:', error);
    return createErrorResponse('Error checking username', 500);
  }
}
