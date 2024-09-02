import React from 'react';
import Features from "../assets/data";

export default function Info() {
    return (
        <section id="features" className="py-16 bg-gray-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-wide">Our Key Features</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">Explore the powerful features that make our product a perfect choice for your needs.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                    {Features.map((feature, index) => (
                        <div 
                            key={`${feature.title}-${index}`} 
                            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md transform transition-transform hover:scale-105"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full mb-6 shadow-lg">
                                <feature.icon className="text-4xl"/>
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-center">
                                {feature.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
