import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  sendOTP,
  verifyOTP,
} from "../../services/api/auth/customerAuthService";
import { useAuth } from "../../context/AuthContext";
import OTPInput from "../../components/OTPInput";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleContinue = async () => {
    if (mobileNumber.length !== 10) return;

    setLoading(true);
    setError("");

    try {
      const response = await sendOTP(mobileNumber);
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      setShowOTP(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to initiate call. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await verifyOTP(mobileNumber, otp, sessionId);
      if (response.success && response.data) {
        login(response.data.token, {
          id: response.data.user.id,
          name: response.data.user.name,
          phone: response.data.user.phone,
          email: response.data.user.email,
          walletAmount: response.data.user.walletAmount,
          refCode: response.data.user.refCode,
          status: response.data.user.status,
        });

        const redirectPath = searchParams.get("redirect") || "/";
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col justify-end p-8 pb-16 bg-neutral-950">
      {/* Full-screen Background Video */}
      <video
        ref={videoRef}
        src="/assets/login/Mobile_Responsive_Logo_Video_Creation.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 transition-opacity duration-1000"
        onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
      />

      {/* Subtle Bottom Gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 transition-all group"
        aria-label="Back">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white group-hover:scale-110 transition-transform">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Bottom Login Elements (No Card Background) */}
      <div className="w-full max-w-sm mx-auto z-20 space-y-6">
        
        {!showOTP ? (
          <div className="w-full space-y-4">
            {/* Minimal Glass Mobile Input */}
            <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden focus-within:border-white/60 focus-within:ring-2 focus-within:ring-white/20 transition-all h-16">
              <div className="px-5 text-xl font-bold text-white border-r border-white/20">
                +91
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="00000 00000"
                className="flex-1 px-5 text-xl bg-transparent text-white placeholder:text-white/40 focus:outline-none font-medium"
                maxLength={10}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-xs text-red-300 font-semibold bg-red-900/40 backdrop-blur-md border border-red-500/30 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Premium Glass Continue Button */}
            <button
              onClick={handleContinue}
              disabled={mobileNumber.length !== 10 || loading}
              className={`w-full h-16 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-xl flex items-center justify-center ${
                mobileNumber.length === 10 && !loading
                  ? "bg-white text-black hover:bg-neutral-100"
                  : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10 backdrop-blur-sm"
              }`}>
              {loading ? "..." : "Proceed to Login"}
            </button>
          </div>
        ) : (
          <div className="w-full space-y-8 flex flex-col items-center">
            {/* Compact OTP Section */}
            <div className="text-center">
                <p className="text-lg font-bold text-white drop-shadow-lg">
                  OTP sent to +91 {mobileNumber}
                </p>
            </div>

            <div className="w-full flex justify-center">
              <OTPInput onComplete={handleOTPComplete} disabled={loading} />
            </div>

            {error && (
              <div className="w-full text-xs text-red-300 bg-red-900/40 border border-red-500/30 p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="w-full flex gap-4">
              <button
                onClick={() => {
                  setShowOTP(false);
                  setError("");
                }}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl font-bold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all">
                Change Number
              </button>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl font-bold text-sm bg-white text-black hover:bg-neutral-100 transition-all shadow-xl">
                {loading ? "..." : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {/* Minimal Privacy Text */}
        <p className="text-[11px] text-white/50 text-center font-medium drop-shadow-md pb-4">
           By continuing, you agree to our 
           <span className="text-white/80 underline cursor-pointer hover:text-white transition-colors ml-1">Terms</span> & <span className="text-white/80 underline cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
