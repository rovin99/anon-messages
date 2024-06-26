import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { User } from 'next-auth';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { createSuccessResponse, createErrorResponse } from '@/utils/responseUtils';
export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    
    return createErrorResponse('Not authenticated',401);
  }
  const userId = new mongoose.Types.ObjectId(_user._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    if (!user || user.length === 0) {
      
      return createErrorResponse('User not found',404);
    }
    return createSuccessResponse('Messages found', user[0].messages);

    
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return createErrorResponse('An unexpected error occurred',500);
  }
}