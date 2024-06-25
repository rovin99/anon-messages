import bcrypt from "bcryptjs";
import UserModel from '@/model/User';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import { createSuccessResponse, createErrorResponse } from '@/utils/responseUtils';
export async function POST(request: Request) {

    await dbConnect()

    try{
        const { username, email, password } = await request.json();

        //if Username exist return false 

        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
          });

          if (existingVerifiedUserByUsername) {
            
            return createErrorResponse(
                'Username is already taken', 400
              );
          }

          //if Email exist and verified return false 
          

            const existingUserByEmail = await UserModel.findOne({
                email
            });
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            if (existingUserByEmail) {
                if (existingUserByEmail.isVerified) {
                    return createErrorResponse(
                        'Email is already taken', 400
                      );
                    

                } 
                //if Email exist and unverified, save a new user(unverified by default)
                else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    existingUserByEmail.password = hashedPassword;
                    existingUserByEmail.verifyCode = verifyCode;
                    existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                    await existingUserByEmail.save();
                }
            }
            
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);
          
                const newUser = new UserModel({
                  username,
                  email,
                  password: hashedPassword,
                  verifyCode,
                  verifyCodeExpiry: expiryDate,
                  isVerified: false,
                  isAcceptingMessages: true,
                  messages: [],
                });
          
                await newUser.save();
              }

        // Send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );
        if (!emailResponse.success) {
            return createErrorResponse(
                'Error sending verification email', 500
              );
        }
    
        return createSuccessResponse('User registered successfully');
        } catch (error) {
            console.error('Error registering user:', error);
            return createErrorResponse('Internal server error', 500);
        }

    
}





