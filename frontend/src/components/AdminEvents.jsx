import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: null,
    startTime: "",
    endDate: null,
    endTime: "",
  });

  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/events/all", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setEvents(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch events");
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setCreating(true);
    try {
      const startDateTime = new Date(`${formData.startDate.toISOString().split("T")[0]}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate.toISOString().split("T")[0]}T${formData.endTime}`);

      await axios.post(
        "http://localhost:8000/api/v1/events",
        {
          name: formData.name,
          description: formData.description,
          location: formData.location,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      toast.success("Event created successfully");
      setFormData({
        name: "",
        description: "",
        location: "",
        startDate: null,
        startTime: "",
        endDate: null,
        endTime: "",
      });
      fetchEvents();
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/events/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      toast.success("Event deleted");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 pt-24 px-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
            className="border-orange-500 text-orange-600 hover:bg-orange-100"
          >
            ← Go to Admin Dashboard
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              + Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />

              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full text-left", !formData.startDate && "text-muted-foreground")}
                      >
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        mode="single"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Label className="mt-2 block">Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="w-1/2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full text-left", !formData.endDate && "text-muted-foreground")}
                      >
                        {formData.endDate ? format(formData.endDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        mode="single"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Label className="mt-2 block">End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <Button
                className="bg-orange-600 text-white hover:bg-orange-700 w-full"
                onClick={handleCreateEvent}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-orange-600">Loading events...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event._id} className="p-5 border border-orange-200 bg-white">
              <h2 className="text-xl font-semibold text-orange-700 mb-2">{event.name}</h2>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate(`/admin/events/${event._id}`)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
