import React, { useState, useRef } from 'react';
import axios from "axios";
import Footer from '../components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from 'react-dropzone';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const issueTypes = ['Broken Roads', 'Garbage Dumps', 'Street Lights'];
const languages = ['English', 'Hindi', 'Marathi', 'Gujarati'];

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: "",
    languageId: "",
    description: "",
    location: ""
  });
  const [images, setImages] = useState([]);
  const [marker, setMarker] = useState({ lat: 22.5726, lng: 88.3639 });
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  const onDrop = (acceptedFiles) => {
    setImages(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop
  });

  const handleMapClick = async (e) => {
    const latlng = e.latlng;
    setMarker(latlng);
    try {
      const key = import.meta.env.VITE_OPENCAGE_API_KEY;
      const res = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latlng.lat}+${latlng.lng}&key=${key}`);
      const formatted = res.data.results[0]?.formatted;
      setFormData({
        ...formData,
        location: formatted || `Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`
      });
    } catch (err) {
      console.error(err);
      setFormData({
        ...formData,
        location: `Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`
      });
    }
  };

  const LocationMarker = () => {
    useMapEvents({ click: handleMapClick });
    return marker ? <Marker position={marker} icon={customIcon} /> : null;
  };

  const handleSearch = async () => {
    try {
      const key = import.meta.env.VITE_OPENCAGE_API_KEY;
      const res = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchText)}&key=${key}`);
      const results = res.data.results || [];
      setSearchResults(results);

      if (results.length > 0) {
        const firstResult = results[0];
        const { lat, lng } = firstResult.geometry;
        setMarker({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          location: firstResult.formatted,
        }));
        mapRef.current?.setView([lat, lng], 15);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    }
  };

  const handleSelectSuggestion = (result) => {
    const { lat, lng } = result.geometry;
    setMarker({ lat, lng });
    setFormData({ ...formData, location: result.formatted });
    mapRef.current?.setView([lat, lng], 15);
    setSearchResults([]);
    setSearchText(result.formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Unauthorized. Please login first.");
      return;
    }

    setLoading(true); // loader start
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      images.forEach((img) => {
        data.append("issuePhotos", img);
      });

      const res = await axios.post("http://localhost:8000/api/v1/issues", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success(res.data.message || "Issue reported successfully!");
      setFormData({ title: "", languageId: "", description: "", location: "" });
      setImages([]);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Issue creation failed!");
    } finally {
      setLoading(false); // loader end
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="sticky top-0 z-50 shadow bg-white">
        <UserNavbar />
      </div>

      <main className="flex-grow max-w-4xl mx-auto px-6 pt-20 pb-12 w-full">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h1 className="text-3xl font-semibold mb-8 text-gray-800">Report an Issue</h1>

          <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
            {/* Title */}
            <div className="space-y-2 z-10 relative">
              <Label htmlFor="title">Select Issue Type</Label>
              <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })} required>
                <SelectTrigger id="title" className="z-10">
                  <SelectValue placeholder="Choose an issue type" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  {issueTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="languageId">Preferred Language</Label>
              <Select value={formData.languageId} onValueChange={(value) => setFormData({ ...formData, languageId: value })} required>
                <SelectTrigger id="languageId">
                  <SelectValue placeholder="Choose a language" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Issue Description</Label>
              <textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the issue..."
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                required
              />
            </div>

            {/* Location + Search */}
            <div className="space-y-4">
              <Label>Search Location</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for a location"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-orange-600 text-white px-4 rounded-lg"
                >
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-lg shadow max-h-60 overflow-auto z-50 relative">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-2 cursor-pointer hover:bg-orange-100 text-sm text-gray-700"
                      onClick={() => handleSelectSuggestion(result)}
                    >
                      {result.formatted}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-gray-600 text-sm">Selected Location: {formData.location}</div>
              <MapContainer
                center={marker}
                zoom={15}
                style={{ height: "300px", width: "100%" }}
                whenCreated={(map) => (mapRef.current = map)}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker />
              </MapContainer>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Attach Photos</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-6 text-center rounded-xl transition cursor-pointer bg-white ${
                  isDragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-gray-600">
                  Drag and drop images here, or <span className="text-orange-500 font-medium">click to upload</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">You can upload multiple images (JPG, PNG, etc)</p>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className="rounded-md h-24 w-full object-cover shadow-md border"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-1 py-0.5 group-hover:scale-110 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button with Loader */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full font-medium transition ${
                loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "Submit Report"
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportIssue;
