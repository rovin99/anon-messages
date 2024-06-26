import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';
import { createSuccessResponse, createErrorResponse } from '@/utils/responseUtils';
export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !session.user) {
    
    return createErrorResponse('Not authenticated', 401);
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      
      return createErrorResponse('Unable to find user to update message acceptance status', 404);
    }

    // Successfully updated message acceptance status
    return createSuccessResponse('Message acceptance status updated');
  } catch (error) {
    console.error('Error updating message acceptance status:', error);
    return createErrorResponse('Error updating message acceptance status', 500);
    
  }
}


export async function GET(request: Request) {
  // Connect to the database
  await dbConnect();

  // Get the user session
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Check if the user is authenticated
  if (!session || !user) {
    return createErrorResponse('Not authenticated', 401);
    
    
  }

  try {
    // Retrieve the user from the database using the ID
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      // User not found
      return createErrorResponse('User not found', 404);
    }

    // Return the user's message acceptance status
    return createSuccessResponse('Message acceptance status retrieved', {
      isAcceptingMessages: foundUser.isAcceptingMessages,
    });
  } catch (error) {
    console.error('Error retrieving message acceptance status:', error);
    return createErrorResponse('Error retrieving message acceptance status', 500);
  }
}