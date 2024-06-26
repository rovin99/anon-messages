import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import { Message } from '@/model/User';
import { createSuccessResponse, createErrorResponse } from '@/utils/responseUtils';
export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username }).exec();

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return createErrorResponse('User is not accepting messages', 403);
    }

    const newMessage = { content, createdAt: new Date() };

    // Push the new message to the user's messages array
    user.messages.push(newMessage as Message);
    await user.save();

    return createSuccessResponse('Message added');
  } catch (error) {
    console.error('Error adding message:', error);
    return createErrorResponse('Error adding message', 500);
  }
}