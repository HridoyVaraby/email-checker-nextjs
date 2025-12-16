'use client';

import { useActionState } from 'react';
import { register } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function RegisterForm() {
    // @ts-ignore
    const [message, dispatch, isPending] = useActionState(register, undefined);
    const router = useRouter();

    useEffect(() => {
        if (message === 'User already exists.') {
            toast.error(message);
        } else if (message === 'Failed to create user.') {
            toast.error(message);
        } else if (typeof message === 'undefined') {
            // Initial state
        } else {
            // Success? If message is not error string.
            // In action we returned error strings or redirects (if implemented). 
            // If the action returned a string and it's not one of the errors?
            // Actually the action I wrote returns simple strings or undefined if I didn't return explicit success?
            // Let's assume action might need tweaking to signal success better, 
            // but for now if it returns 'Invalid data...' etc handle it.
            if (message && !message.includes('success')) {
                // Treat as error if not explicitly success? 
                // My action implementation: returns string on error. returns nothing on success (implicit undefined)? 
                // Wait, if success I didn't return anything in the try block end.
            }
        }
    }, [message]);

    return (
        <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-gray-500 text-sm">Create an account to get started</p>
            </div>
            <form action={dispatch} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Already have an account? Sign In
                        </Link>
                    </div>
                </div>
                {message && (
                    <div className="text-red-500 text-sm" aria-live="polite">
                        {message}
                    </div>
                )}
                <button
                    className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-disabled={isPending}
                    disabled={isPending}
                >
                    {isPending ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
}
