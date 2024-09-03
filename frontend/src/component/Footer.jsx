import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-3">
                    <div>
                        <h4 className="text-lg font-semibold mb-4">About Us</h4>
                        <p className="text-gray-400">
                            We are a team dedicated to providing high-quality products and services.
                            Our goal is to help businesses achieve their objectives through innovative solutions.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                            <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                            <li><a href="/services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
                        <p className="text-gray-400 mb-2">1234 Street Name, City, Country</p>
                        <p className="text-gray-400 mb-2">Email: <a href="mailto:info@example.com" className="hover:text-white transition-colors">info@example.com</a></p>
                        <p className="text-gray-400 mb-2">Phone: <a href="tel:+1234567890" className="hover:text-white transition-colors">+123 456 7890</a></p>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
