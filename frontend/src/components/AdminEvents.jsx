import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/events", {
          withCredentials: true,
        });
        setEvents(res.data.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 pt-24 px-6 font-sans">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">All Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event._id} className="p-5 border border-orange-200 bg-white">
            <h2 className="text-xl font-semibold text-orange-700 mb-2">
              {event.name}
            </h2>
            <p className="text-gray-600 mb-1">{event.description}</p>
            <p className="text-gray-700 text-sm">
              <strong>Location:</strong> {event.location || "TBD"}
            </p>
            <p className="text-gray-700 text-sm">
              <strong>Time:</strong>{" "}
              {new Date(event.startTime).toLocaleString()} -{" "}
              {new Date(event.endTime).toLocaleString()}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => navigate(`/admin/events/${event._id}`)}
              >
                View
              </Button>
              <Button size="sm" variant="destructive">
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;
