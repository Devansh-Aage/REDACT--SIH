import aboutImage from '../assets/Hero.jpg';

const About = () => {
  return (
    <section id='about' className='bg-gray-50 text-gray-900 py-16 px-4'>
      <div className='container mx-auto flex flex-col-reverse md:flex-row items-center md:items-start space-y-12 md:space-y-0 md:space-x-12'>
        {/* Text Section */}
        <div className='flex flex-col space-y-6 md:w-1/2'>
          <div className='relative'>
            <h2 className='text-4xl md:text-5xl font-extrabold text-center md:text-left leading-tight tracking-wide'>Who We Are
              <span className='block w-24 h-1 bg-red-500 absolute bottom-0 left-0 transform -translate-y-1/2 md:translate-x-0'></span>
            </h2>
          </div>
          <p className='text-lg md:text-xl text-gray-700 leading-relaxed transition-transform duration-300 transform hover:translate-x-1'>We are innovators at our core, dedicated to redefining how teams collaborate and achieve their goals. Our cutting-edge solutions simplify workflows and amplify productivity, seamlessly integrating into your daily operations.</p>
          <p className='text-lg md:text-xl text-gray-700 leading-relaxed transition-transform duration-300 transform hover:translate-x-1'>
            Experience the blend of simplicity and sophistication with our tools, crafted to help you excel effortlessly. Join us as we embark on a journey to make teamwork more efficient and enjoyable.
          </p>
          <a href="/" className='inline-block text-red-500 font-bold border-2 border-red-500 py-2 px-4 rounded-lg bg-transparent hover:bg-red-500 hover:text-white transition-all duration-300 text-lg md:text-xl shadow-md hover:shadow-lg'>About Us</a>
        </div>
        <div className='w-full md:w-1/2'>
          <div className='relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300'>
            <img src={aboutImage} alt='About Us' className='w-full h-auto object-cover transition-transform duration-500 transform hover:scale-105'/>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
