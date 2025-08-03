import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const AdminEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEventDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/events/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setEvent(response.data.data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  if (loading) {
    return <div className="pt-24 px-6 text-orange-600">Loading event...</div>;
  }

  if (!event) {
    return <div className="pt-24 px-6 text-red-500">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50 pt-24 px-6 font-sans">
      <Button onClick={() => navigate("/admin/events")} className="mb-4">
        ← Back to Events
      </Button>

      <Card className="p-6 bg-white shadow-lg border border-orange-200 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">
          {event.name}
        </h1>
        <p className="text-gray-700 mb-3">{event.description}</p>

        <div className="mb-2">
          <span className="font-medium text-gray-800">Location:</span>{" "}
          {event.location || "N/A"}
        </div>

        <div className="mb-2">
          <span className="font-medium text-gray-800">Start Time:</span>{" "}
          {new Date(event.startTime).toLocaleString()}
        </div>

        <div className="mb-2">
          <span className="font-medium text-gray-800">End Time:</span>{" "}
          {new Date(event.endTime).toLocaleString()}
        </div>

        {event.createdBy && (
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Created By:</strong> {event.createdBy.fullName}</p>
            <p><strong>Email:</strong> {event.createdBy.email}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminEventDetail;
