import React from 'react';
import { Gallery } from '../assets/data';

const GalleryComponent = () => {
    return (
        <div id="portfolio" className="bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Gallery</h2>
                    <p className="text-lg text-gray-600">Explore our collection of stunning visuals showcasing our projects and work.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {Gallery.map((item, index) => (
                        <div key={index} className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
                            <img src={item.smallImage} alt={item.title} className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <h3 className="text-white text-xl font-semibold">{item.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GalleryComponent;
