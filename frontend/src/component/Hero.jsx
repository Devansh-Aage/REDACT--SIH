import images from '../assets/Hero1.jpg';

const Hero = () => {
    return (
        <section id='hero' className='bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16'>
            <div className='container flex flex-col-reverse items-center mx-auto space-y-8 md:space-y-0 md:flex-row'>
                <div className='flex flex-col space-y-8 md:w-1/2'>
                    <h1 className='max-w-md text-4xl font-extrabold text-center leading-tight tracking-wide md:text-5xl md:text-left'>
                        Bring everyone together to build better products
                    </h1>
                    <p className='max-w-sm text-center text-lg text-gray-200 md:text-left md:max-w-lg'>Manage makes it simple for software teams to plan day-to-day tasks while keeping the larger team goals in view.</p>
                    <div className='flex justify-center md:justify-start'>
                        <a href="/" className='p-3 px-6 pt-2 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-colors duration-300'>Get Started</a>
                    </div>
                </div>
                <div className='h-100 md:w-auto'>
                    <img src={images} alt='Team Collaboration' className='rounded-lg shadow-xl transition-transform duration-300 transform hover:scale-105' />
                </div>
            </div>
        </section>
    );
};

export default Hero;
