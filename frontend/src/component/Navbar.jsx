import { useState } from "react";
import { Menu, X } from 'lucide-react';
import { NavLink } from "react-router-dom";

export default function Navbar() {
    const [active, setActive] = useState(true);

    return (
        <nav className="bg-gradient-to-r from-red-400 to-pink-500 px-4 sm:px-6 py-4 shadow-lg">
            <div className="container flex flex-wrap justify-between items-center mx-auto">
                <NavLink to="/" className="text-3xl font-bold text-white hover:text-gray-200 transition-colors duration-300">REDACTION</NavLink>
                <div className="flex md:order-2 md:hidden">
                    <button type="button" onClick={() => setActive(!active)} className="text-white hover:text-gray-200 transition-colors duration-300">
                        {active ? <Menu size={30} /> : <X size={30} />} 
                    </button>
                </div>
                <div className={`${active ? `hidden` : `block`} w-full md:flex md:w-auto md:order-1 transition-all duration-300 ease-in-out`}>
                    <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 text-lg text-white">
                        <li className="py-2 md:py-0">
                            <NavLink to="/" className="py-4 pr-6 pl-0 hover:opacity-80 transition-opacity duration-300">Explore</NavLink>
                        </li>
                        <li className="py-2 md:py-0">
                            <NavLink to="/" className="py-4 pr-6 pl-0 hover:opacity-80 transition-opacity duration-300">Resources</NavLink>
                        </li>
                        <li className="py-2 md:py-0">
                            <NavLink to="/" className="py-4 pr-6 pl-0 hover:opacity-80 transition-opacity duration-300">Creators</NavLink>
                        </li>
                        <li className="py-2 md:py-0">
                            <NavLink to="/signin" className="py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 shadow-lg">Sign In</NavLink>
                        </li>
                        <li className="py-2 md:py-0">
                            <NavLink to="/signup" className="py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 shadow-lg">Sign Up</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
