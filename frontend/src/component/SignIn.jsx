import React from 'react';

const SignIn = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-gradient-to-r from-blue-200 via-purple-300 to-pink-200">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Sign In</h2>
                <form>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                        <input type="email" id="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                    </div>
                    <div className="mb-6 flex items-center justify-between">
                        <label className="inline-flex items-center text-gray-700">
                            <input type="checkbox" className="form-checkbox text-blue-500"/>
                            <span className="ml-2">Remember me</span>
                        </label>
                        <a href="/" className="text-blue-500 hover:underline text-sm">Forgot Password?</a>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-300">Sign In</button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
