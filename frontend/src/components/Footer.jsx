import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
<footer className="fixed bottom-0 left-0 right-0 bg-[#f5d1a3] py-6 px-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-700 z-50">
      <div className="mb-4 md:mb-0">
        <p>© 2025 My Neighborhood Helper. All rights reserved.</p>
        <p>
          Contact us:{" "}
          <a href="mailto:forplacement90@gmail.com" className="underline hover:text-gray-900">
            forplacement90@gmail.com
          </a>
        </p>
      </div>
      <div className="flex space-x-6 text-gray-600">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-900">
          <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5 text-2xl" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-900">
          <FontAwesomeIcon icon={faTwitter} className="w-5 h-5 text-2xl" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-900">
          <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 text-2xl" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
