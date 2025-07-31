import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const issueTypes = ['Broken Roads', 'Garbage Dumps', 'Street Lights'];

const ReportIssue = () => {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState(null);

  const handleIssueTypeClick = (type) => {
    setSelectedIssue(type);
  };

  const handlePhotoChange = (e) => {
    setPhotos(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the form data
    console.log({
      selectedIssue,
      description,
      location,
      photos,
    });
    alert('Report submitted successfully!');
    // Reset form
    setSelectedIssue('');
    setDescription('');
    setLocation('');
    setPhotos(null);
    e.target.reset();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-2xl font-semibold mb-6">Report an Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Select Issue Type</label>
            <div className="flex space-x-6">
              {issueTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleIssueTypeClick(type)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedIssue === type
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                  } focus:outline-none`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
              Issue Description
            </label>
            <textarea
              id="description"
              placeholder="Provide a detailed description of the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              required
            />
          </div>

          {/* Location Details */}
          <div>
            <label htmlFor="location" className="block mb-2 font-medium text-gray-700">
              Location Details
            </label>
            <input
              id="location"
              type="text"
              placeholder="Enter location details..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Attach Photos */}
          <div>
            <label htmlFor="photos" className="block mb-2 font-medium text-gray-700">
              Attach Photos
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full rounded-lg border border-gray-300 p-2 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-full font-medium transition"
          >
            Submit Report
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ReportIssue;
