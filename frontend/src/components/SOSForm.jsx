import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { FaMapMarkerAlt, FaCommentDots, FaCircleNotch } from "react-icons/fa";
import UserNavbar from "./UserNavbar";
import Footer from "./Footer";

const SOSForm = () => {
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("Help me!");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setFeedback(null);

  try {
    const token = localStorage.getItem("accessToken");
    const { data } = await axios.post(
      "http://localhost:8000/api/v1/sos/send",
      { location, message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFeedback(data.message || "SOS sent!");
    setLocation("");
    setMessage("Help me"); // reset message
  } catch (err) {
    setFeedback(err.response?.data?.message || "Failed to send SOS");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
    <UserNavbar/>
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-100">
      <Card className="w-full max-w-md shadow-2xl border border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-red-600">🚨 SOS Alert</CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Provide your location and message — we'll notify authorities immediately.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Location Field */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute top-3.5 left-3 text-orange-500" />
              <Input
                className="pl-10"
                placeholder="📍 Your location (e.g. Sector 12, Noida)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Message Field */}
            <div className="relative">
              <FaCommentDots className="absolute top-3.5 left-3 text-gray-400" />
              <Textarea
                className="pl-10 min-h-[100px]"
                placeholder="💬 Optional message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaCircleNotch className="animate-spin" />
                  Sending SOS...
                </span>
              ) : (
                "Send SOS Alert"
              )}
            </Button>

            {/* Feedback */}
            {feedback && (
              <p className="text-center text-sm text-muted-foreground mt-2">{feedback}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
    <Footer/>
    </>
  );
};

export default SOSForm;
