import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import phoneImage from '../assets/road.jpg';
import phoneImage2 from '../assets/Elect.jpg';

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-10rem)] px-8 py-16 max-w-7xl mx-auto mt-10">
        {/* Left side content */}
        <section className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Fix your <span className='text-orange-500'>neighbourhood</span> as soon as possible.
          </h1>
          <p className="text-gray-600 text-lg max-w-md">
            Our platform empowers residents to report local issues and track them until resolved - simple, transparent and impactful.
          </p>
          <button className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 transition">
            Report an issue
          </button>
        </section>

        {/* Right side content */}
        <section className="md:w-1/2 relative mt-12 md:mt-0 flex justify-center items-center space-x-6">
          {/* Large colored circle */}
          <div className="w-96 h-96 bg-orange-400 rounded-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-0"></div>

          {/* Phone images placeholders */}
          <div className="relative z-10 flex space-x-6">
            <div className="w-40 h-80 bg-white rounded-3xl shadow-lg transform -rotate-12 flex items-center justify-center">
              <img src={phoneImage} alt="Phone 1" className="w-full h-full object-cover rounded-3xl" />
            </div>
            <div className="w-40 h-80 bg-white rounded-3xl shadow-lg transform rotate-12 flex items-center justify-center">
              <img src={phoneImage2} alt="Phone 2" className="w-full h-full object-cover rounded-3xl" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;
