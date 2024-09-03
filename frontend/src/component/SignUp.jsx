import React from 'react';

const SignUp = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-gradient-to-r from-blue-200 via-purple-300 to-pink-200">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Sign Up</h2>
                <form>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                            Email Address
                        </label>
                        <input type="email" id="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <input type="password" id="password" placeholder="Create a password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                        <input type="password" id="confirm-password" placeholder="Confirm your password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-300">Sign Up</button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">Already have an account?{' '}
                        <a href="/signin" className="text-blue-500 hover:underline">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
