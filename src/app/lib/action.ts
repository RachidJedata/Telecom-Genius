'use server'

import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import bcrypt from 'bcryptjs'

export async function saveUser(data: Prisma.UserCreateInput) {    
    try {
        console.log(data);
        // Check if the user already exists
        const ifExists = await prisma.user.count({
            where: { email: data.email }
        });
        
        if (ifExists > 0) {
            // console.log(`User with ID ${user.user_id} already exists.`);
            return { success: 0, errorMessage: "a user with the same email already exist" };
        }


        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,                
            }
        });

        return { success: 1 };
    } catch (error) {
        console.log(error);
        return { success: 0, errorMessage: "Failed to sign up please try again!" };
    }
}