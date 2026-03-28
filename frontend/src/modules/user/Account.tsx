import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getProfile,
  CustomerProfile,
} from "../../services/api/customerService";

export default function Account() {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showGstModal, setShowGstModal] = useState(false);
  const [gstNumber, setGstNumber] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getProfile();
        if (response.success) {
          setProfile(response.data);
        } else {
          setError("Failed to load profile");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
        if (err.response?.status === 401) {
          authLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, navigate, authLogout]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  const handleGstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGstModal(false);
  };

  // Show login/signup prompt for unregistered users
  if (!user) {
    return (
      <div className="pb-24 md:pb-8 bg-white min-h-screen">
        <div className="bg-gradient-to-b from-purple-100 via-purple-50 to-white pb-6 md:pb-8 pt-12 md:pt-16">
          <div className="px-4 md:px-6 lg:px-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-neutral-900"
              aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex flex-col items-center mb-4 md:mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-50 flex items-center justify-center mb-3 md:mb-4 border-2 border-white shadow-md backdrop-blur-sm">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-purple-600 md:w-12 md:h-12">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
                Welcome!
              </h1>
              <p className="text-sm md:text-base text-neutral-600 text-center px-4">
                Login to access your profile, orders, and more
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 mt-6">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 rounded-full font-bold text-base bg-gradient-to-r from-[#FFC107] to-[#B95F15] text-white hover:opacity-95 transition-all duration-300 shadow-xl shadow-orange-500/20 uppercase tracking-widest">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pb-24 md:pb-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="pb-24 md:pb-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gradient-to-r from-[#FFC107] to-[#B95F15] text-white rounded-full font-bold uppercase tracking-wide">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || "User";
  const displayPhone = profile?.phone || user?.phone || "";
  const displayDateOfBirth = profile?.dateOfBirth;

  return (
    <div className="pb-24 md:pb-8 bg-gradient-to-br from-white via-yellow-50/30 to-purple-50/30 min-h-screen">
      {/* Top Header & Profile Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-100/80 via-purple-50/40 to-transparent pb-12 pt-8 md:pt-12">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[0%] left-[-5%] w-48 h-48 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="px-4 md:px-6 lg:px-8 max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-neutral-900 border border-white/20 transition-all hover:scale-105 active:scale-95"
              aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-neutral-900">Account</h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(123,31,162,0.15)] p-6 relative">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 p-1 shadow-inner">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-purple-600 md:w-14 md:h-14">
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-90 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-1">
                {displayName}
              </h2>
              
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {displayPhone && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-100 text-[13px] text-neutral-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{displayPhone}</span>
                  </div>
                )}
                {displayDateOfBirth && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-100 text-[13px] text-neutral-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDate(displayDateOfBirth)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards (Orders / Help) */}
      <div className="px-4 md:px-6 lg:px-8 -mt-6 mb-8 relative z-20">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/orders")}
            className="group bg-white rounded-2xl p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] border border-neutral-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(255,193,7,0.25)] hover:-translate-y-1 outline-none">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-600">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-sm font-bold text-neutral-900 mb-0.5">Your Orders</div>
            <div className="text-[11px] text-neutral-500 font-medium">History & status</div>
          </button>
          
          <button
            onClick={() => navigate("/faq")}
            className="group bg-white rounded-2xl p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] border border-neutral-100 hover:border-purple-200 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(123,31,162,0.15)] hover:-translate-y-1 outline-none">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-sm font-bold text-neutral-900 mb-0.5">Need Help?</div>
            <div className="text-[11px] text-neutral-500 font-medium">Support & FAQs</div>
          </button>
        </div>
      </div>

      {/* Your Information List */}
      <div className="px-4 md:px-6 lg:px-8 pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">
              Your Information
            </h2>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 'address', label: 'Address Book', icon: (
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ), onClick: () => navigate("/address-book") },
              { id: 'wishlist', label: 'Your Wishlist', icon: (
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ), onClick: () => navigate("/wishlist") },
              { id: 'gst', label: 'GST Details', icon: (
                <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>
              ), onClick: () => setShowGstModal(true) },
              { id: 'about', label: 'About Us', icon: (
                <><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" /><line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" /></>
              ), onClick: () => (window.location.href = "https://about.Speedoo.com") },
            ].map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full group flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] hover:border-purple-100 hover:shadow-md transition-all duration-300 outline-none">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      {item.icon}
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{item.label}</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}

            {/* Logout button separate */}
            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all duration-300 group outline-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 group-hover:translate-x-1 transition-transform">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="text-sm font-bold text-red-600">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showGstModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowGstModal(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500 ease-out">
            <div className="bg-white rounded-t-[32px] shadow-2xl max-w-lg mx-auto p-6 pt-10 relative">
              <button
                onClick={() => setShowGstModal(false)}
                className="absolute -top-12 right-4 w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5">
                    <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                    <line x1="9" y1="15" x2="13" y2="15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Add GST Details
                </h3>
                <p className="text-[13px] text-neutral-500 mb-8 px-4">
                  Identify your business to get a GST invoice on your business
                  purchases.
                </p>
                <form onSubmit={handleGstSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="Enter GST Number"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!gstNumber.trim()}
                    className="w-full rounded-full bg-gradient-to-r from-[#FFC107] to-[#B95F15] text-white font-bold py-4 hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm">
                    Save Details
                  </button>
                </form>
                <p className="mt-6 text-[11px] text-neutral-400">
                  By continuing, you agree to our{" "}
                  <span className="underline">Terms & Conditions</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
