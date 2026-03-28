import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendOTP,
  verifyOTP,
} from "../../../services/api/auth/sellerAuthService";
import OTPInput from "../../../components/OTPInput";
import { useAuth } from "../../../context/AuthContext";
import speedooLogo from "@assets/Speedoo_logo.png";

export default function SellerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMobileLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mobileNumber.length !== 10) return;

    setLoading(true);
    setError("");

    try {
      const response = await sendOTP(mobileNumber);
      if (response.success) {
        setShowOTP(true);
        setError("");
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await verifyOTP(mobileNumber, otp);
      if (response.success && response.data) {
        login(response.data.token, {
          id: response.data.user.id,
          name: response.data.user.sellerName,
          email: response.data.user.email,
          phone: response.data.user.mobile,
          userType: "Seller",
          storeName: response.data.user.storeName,
          status: response.data.user.status,
          address: response.data.user.address,
          city: response.data.user.city,
        });
        navigate("/seller", { replace: true });
      } else {
        setError(response.message || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden relative">
      {/* Background Layer with Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 left-1/2 w-64 h-64 bg-tertiary/10 rounded-full blur-[80px]"></div>
        <img
          alt="Vibrant blurred city lights at night with purple and orange bokeh reflecting on wet asphalt"
          className="w-full h-full object-cover opacity-20 mix-blend-overlay scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRpWBPRGcBhozHGyH9G2pdRuetNAxbtOkI1NGCXS21TnZclH0hTtNqg0dQfSl-pKF-_5spRZNewO77OZlkESkaKGpmw6Qzrcf3_CiCx-kmtfF1R0NheuJ5P8lEKcOdiVfZZ7mhD6vkS5NeGY3t5Y-hHO0YwjqamWyL0P2It7rp1P9GbX9xNR9dJdxi7QSA7LFx-mM02CtwLk3JshdHOvCJu-Fqy_2kXn-4x2sZt-EO3CvKX0jZygVotlr8A5seunp2jsz8n7bRtPw"
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2.5 rounded-full glass-card hover:bg-surface-variant transition-all hover:scale-110 group"
        aria-label="Back"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#f57c00]"
        >
          <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Main Content Shell */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="glass-card w-full max-w-[420px] rounded-3xl p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border border-white/10 animate-slide-left">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 mb-4 overflow-hidden rounded-2xl ring-2 ring-primary/20 bg-surface flex items-center justify-center p-2">
              <img
                src={speedooLogo}
                alt="Speedoo Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter italic text-[#f57c00]">
              Speedoo
            </h1>
            <p className="font-body text-sm text-on-surface-variant/80 mt-2 tracking-wide font-medium">
              Seller Portal
            </p>
          </div>

          {!showOTP ? (
            <form onSubmit={handleMobileLogin} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="font-label text-xs uppercase tracking-[0.15em] font-bold text-on-surface-variant ml-1"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none group-focus-within:text-[#f57c00] transition-colors">
                    <div className="flex items-center bg-[#f57c00] rounded-xl px-3 py-2 ml-1 shadow-sm">
                      <span className="text-sm font-extrabold text-black">
                        +91
                      </span>
                    </div>
                  </div>
                  <input
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl py-4 pl-20 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-low transition-all duration-300 font-medium tracking-wide"
                    id="phone"
                    placeholder="Enter phone number"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-error font-bold bg-error-container/20 p-3 rounded-xl border border-error/30 text-center animate-fadeIn">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  className="w-full bg-[#f57c00] text-white border-2 border-[#d66a00] font-headline font-extrabold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  type="submit"
                  disabled={mobileNumber.length !== 10 || loading}
                >
                  {loading ? "Sending..." : "Continue"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="font-body text-sm text-on-surface-variant mb-2">
                  Enter 4-digit OTP sent to
                </p>
                <p className="font-headline font-bold text-on-surface tracking-widest">
                  +91 {mobileNumber}
                </p>
              </div>

              <OTPInput
                onComplete={handleOTPComplete}
                disabled={loading}
                variant="dark"
              />

              {error && (
                <div className="text-xs text-error font-bold bg-error-container/20 p-3 rounded-xl border border-error/30 text-center animate-fadeIn">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    setShowOTP(false);
                    setError("");
                  }}
                  disabled={loading}
                  className="flex-1 py-4 rounded-full font-headline font-bold text-sm bg-surface-variant text-on-surface-variant hover:bg-surface-bright transition-colors border border-outline-variant/30"
                >
                  Back
                </button>
                <button
                  onClick={() => handleMobileLogin()}
                  disabled={loading}
                  className="flex-1 py-4 rounded-full font-headline font-bold text-sm bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors"
                >
                  {loading ? "..." : "Resend"}
                </button>
              </div>
            </div>
          )}

          {/* Footer links inside card */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="h-px bg-outline-variant/15 flex-grow"></div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold">
                New to Speedoo?
              </span>
              <div className="h-px bg-outline-variant/15 flex-grow"></div>
            </div>
            <button
              onClick={() => navigate("/seller/signup")}
              className="text-[#f57c00] font-label text-xs font-bold tracking-widest uppercase hover:text-[#ff9100] transition-colors"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </main>

      {/* Decorative Corner Element */}
      <div className="fixed bottom-10 right-10 z-10 hidden lg:block opacity-60">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/20 bg-surface-container/30 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(255,159,74,0.8)]"></span>
          <span className="font-label text-[10px] uppercase tracking-widest font-bold">
            Velocity delivered to your door
          </span>
        </div>
      </div>
    </div>
  );
}
