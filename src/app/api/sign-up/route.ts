import bcrypt from "bcryptjs";
import UserModel from '@/model/User';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";

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
            return Response.json(
              {
                success: false,
                message: 'Username is already taken',
              },
              { status: 400 }
            );
          }

          //if Email exist and verified return false 
          

            const existingUserByEmail = await UserModel.findOne({
                email
            });
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            if (existingUserByEmail) {
                if (existingUserByEmail.isVerified) {
                    return Response.json(
                        {
                            success: false,
                            message: 'Email is already taken',
                        },
                        { status: 400 }
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
            return Response.json(
            {
                success: false,
                message: emailResponse.message,
            },
            { status: 500 }
            );
        }
    
        return Response.json(
            {
            success: true,
            message: 'User registered successfully. Please verify your account.',
            },
            { status: 201 }
        );
        } catch (error) {
        console.error('Error registering user:', error);
        return Response.json(
            {
            success: false,
            message: 'Error registering user',
            },
            { status: 500 }
        );
        }

    
}





