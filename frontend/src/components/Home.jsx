import React from 'react';
import { FaSearch, FaPills, FaMapMarkerAlt, FaHospitalUser } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="text-center">
      {/* Hero Section */}
      <section className="py-20 bg-blue-50 rounded-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary">Find Life-Saving Medicines Faster</h1>
        <p className="mt-4 text-lg text-gray-600">Your reliable partner in locating hard-to-find medications.</p>
        <div className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Enter medicine name..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-md transition duration-300">
            Search
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="bg-emerald-100 p-6 rounded-full">
              <FaPills className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Search for Medicine</h3>
            <p className="mt-2 text-gray-500">Enter the name of the rare drug you are looking for.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-emerald-100 p-6 rounded-full">
              <FaMapMarkerAlt className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Find Locations</h3>
            <p className="mt-2 text-gray-500">Get a list of pharmacies and hospitals where it's available.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-emerald-100 p-6 rounded-full">
              <FaHospitalUser className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Connect with Providers</h3>
            <p className="mt-2 text-gray-500">Contact providers directly to confirm availability.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
