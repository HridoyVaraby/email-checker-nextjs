'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/actions/auth';
import Link from 'next/link';

export function LoginForm() {
    // @ts-ignore - useActionState type definition mismatch in some versions, ignoring for now as it works at runtime usually or useFormState
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Sign In</h1>
                <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
            </div>
            <form action={dispatch} className="space-y-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Don&apos;t have an account? Sign up
                        </Link>
                    </div>
                </div>
                {errorMessage && (
                    <div className="text-red-500 text-sm" aria-live="polite">
                        {errorMessage}
                    </div>
                )}
                <button
                    className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-disabled={isPending}
                    disabled={isPending}
                >
                    {isPending ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
