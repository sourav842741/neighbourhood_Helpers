import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-orange-100 to-orange-200 shadow-inner py-4 px-6 text-sm text-gray-700 font-sans mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Left Section */}
        <div className="text-center md:text-left mb-2 md:mb-0">
          <p className="font-medium">
            © 2025 <span className="text-orange-600 font-semibold">My Neighborhood Helper</span>. All rights reserved.
          </p>
          <p>
            Contact us at{" "}
            <Link to="/contact" className="underline text-orange-500 hover:text-orange-700 transition">
              forplacement90@gmail.com
            </Link>
          </p>
        </div>

        {/* Right Section */}
        <div className="flex space-x-5 mt-2 md:mt-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-gray-600 hover:text-orange-500 transition duration-300"
          >
            <FontAwesomeIcon icon={faFacebookF} className="text-xl" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-gray-600 hover:text-orange-500 transition duration-300"
          >
            <FontAwesomeIcon icon={faTwitter} className="text-xl" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-gray-600 hover:text-orange-500 transition duration-300"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-xl" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
