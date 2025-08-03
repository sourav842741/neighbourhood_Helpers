import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import UserNavbar from "@/components/UserNavbar";
import Footer from "@/components/Footer";

// shadcn/ui components
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Lucide Icons
import {
  CheckCircle,
  Wrench,
  Flag,
  MapPin,
  CalendarDays,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

const IssueTracker = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllIssues = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8000/api/v1/issues/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const issueList = Array.isArray(res.data?.data) ? res.data.data : [];

      for (let i = 0; i < issueList.length; i++) {
        if (!Array.isArray(issueList[i].imageId)) {
          issueList[i].imageId = [];
        }
      }

      setIssues(issueList);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        toast.error("Unauthorized. Please login again.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else {
        toast.error("Failed to fetch issues");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllIssues();
  }, []);

  const renderStatusBar = (issue) => {
    const steps = [
      { label: "Reported", status: "reported", icon: <Flag size={16} /> },
      { label: "Verified", status: "verified", icon: <CheckCircle size={16} /> },
      { label: "In Progress", status: "in-progress", icon: <Wrench size={16} /> },
      { label: "Resolved", status: "resolved", icon: <CheckCircle size={16} /> },
    ];

    const currentIndex = steps.findIndex((s) => s.status === issue.status);

    return (
      <div className="relative w-full mt-4">
        <div className="flex justify-between items-center relative z-10">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center w-1/4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`rounded-full h-8 w-8 flex items-center justify-center text-white shadow-md transition-all ${
                      index <= currentIndex ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    {step.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{step.label}</TooltipContent>
              </Tooltip>
              <p
                className={`text-xs mt-2 font-medium ${
                  index <= currentIndex ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress line */}
        <div className="absolute top-[16px] left-[7%] w-[86%] h-1 bg-gray-300 z-0 rounded-full">
          <div
            className="h-1 bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const issueCards = issues.map((issue, i) => (
    <Card key={`issue-${i}`} className="border shadow-md hover:shadow-xl transition-all">
      <CardContent className="p-5 space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">{issue.title}</h2>

        {/* Location & Reported */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} className="text-gray-500" />
          <span>{issue.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays size={16} className="text-gray-500" />
          <span>{new Date(issue.createdAt).toLocaleString()}</span>
        </div>

        {/* Status bar */}
        {renderStatusBar(issue)}

        {/* Votes and comments */}
        <div className="flex justify-between text-sm mt-3 text-gray-500">
          <div className="flex items-center gap-1">
            <ThumbsUp size={14} /> {issue.upvoteCount}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={14} /> {issue.commentCount}
          </div>
        </div>

        {/* Timestamps */}
        {issue.verifiedAt && (
          <p className="text-xs text-gray-500">
            ✅ Verified At: {new Date(issue.verifiedAt).toLocaleString()}
          </p>
        )}
        {issue.inProgressAt && (
          <p className="text-xs text-gray-500">
            🔧 In Progress At: {new Date(issue.inProgressAt).toLocaleString()}
          </p>
        )}
        {issue.resolvedAt && (
          <p className="text-xs text-gray-500">
            🏁 Resolved At: {new Date(issue.resolvedAt).toLocaleString()}
          </p>
        )}

        {/* Images */}
        {issue.imageId.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {issue.imageId.map((url, j) => (
              <img
                key={`image-${i}-${j}`}
                src={url}
                alt={`issue-${j}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  ));

  return (
    <>
      <UserNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">📋 Issue Tracker</h1>
        {loading ? (
          <p className="text-gray-500">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="text-gray-500">No issues found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">{issueCards}</div>
        )}
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default IssueTracker;
