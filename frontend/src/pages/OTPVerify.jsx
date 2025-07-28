import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OTPVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (/^[a-zA-Z0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email not found. Please register again.");
    if (otp.includes("")) return toast.warning("Please enter full 6-digit OTP");

    setLoading(true);
    try {
      const otpCode = otp.join("");
      const res = await axios.post("http://localhost:8000/api/v1/otp/verify-otp", {
        email,
        otp: otpCode,
      });

      toast.success(res.data.message || "OTP Verified");
     setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid OTP or Verification Failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return toast.error("Email not found.");

    try {
      const res = await axios.post("http://localhost:8000/api/v1/otp/resend-otp", { email });
      toast.success(res.data.message || "OTP resent successfully");
      setResendTimer(60); // restart timer
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-100 to-white px-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-orange-200 text-center">
        <h2 className="text-2xl font-bold text-orange-700 mb-2">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-6">
          OTP sent to: <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="text"
                pattern="[A-Za-z0-9]{1}"
                maxLength={1}
                className="w-12 h-12 text-center text-xl border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={otp[index]}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition duration-300"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend OTP */}
          <p className="text-sm text-gray-600">
            Didn’t receive the code?{" "}
            {resendTimer > 0 ? (
              <span className="text-orange-500 font-medium">
                Resend in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-orange-600 font-medium hover:underline"
              >
                Resend OTP
              </button>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default OTPVerify;
