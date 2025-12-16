'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const data = Object.fromEntries(formData.entries());
    const validatedFields = RegisterSchema.safeParse(data);

    if (!validatedFields.success) {
        return 'Invalid data. Please check your inputs.';
    }

    const { email, password, name } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return 'User already exists.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || '',
            },
        });

        // We can't immediately sign in here easily without redirecting or creating a session manually, 
        // but usually we redirect to login or sign them in.
        // Let's just return success message or redirect to login.
    } catch (error) {
        console.error('Registration error:', error);
        return 'Failed to create user.';
    }

    // If successful, we could try to sign in, but for simplicity let's redirect to login page.
}
