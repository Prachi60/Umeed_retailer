import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPolicyByType } from "../../services/api/policyService";
import { Policy } from "../../services/api/admin/adminPolicyService";

export default function AboutUs() {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await getPolicyByType("about_us");
        if (response.success) {
          setPolicy(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch about us content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  return (
    <div className="pb-24 md:pb-8 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-50 to-white pb-6 pt-4 sticky top-0 z-10 border-b border-neutral-100">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-neutral-900"
              aria-label="Back">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-neutral-900">About Us</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
        {/* Logo/Brand Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#9048A5] to-[#7b3a8d] mb-4 shadow-lg">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Speedoo</h2>
          <p className="text-sm text-neutral-600 font-medium tracking-wide">
            Your Trusted 10-Minute Delivery Partner
          </p>
        </div>

        {/* Dynamic Mission Section */}
        <div className="bg-purple-50 rounded-3xl p-8 mb-12 border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl -mr-16 -mt-16" />
          
          <h3 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {loading ? "Our Mission" : policy?.title || "Our Mission"}
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : policy ? (
            <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {policy.content}
            </div>
          ) : (
            <>
              <p className="text-neutral-700 leading-relaxed">
                At Speedoo, we're committed to revolutionizing the way you shop and
                receive your products. Our mission is to provide lightning-fast
                delivery services while maintaining the highest standards of quality
                and customer satisfaction.
              </p>
              <p className="text-neutral-700 mt-4 leading-relaxed">
                We leverage cutting-edge technology and a hyper-local network to ensure that your daily essentials are delivered to your doorstep in just 10 minutes.
              </p>
            </>
          )}
        </div>

        {/* Legal & Policies Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Legal & Policies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => navigate("/privacy-policy")}
              className="group bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-purple-500 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Privacy Policy</h3>
              <p className="text-neutral-500 text-sm">How we handle your data.</p>
            </button>

            <button
              onClick={() => navigate("/terms")}
              className="group bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-orange-500 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Terms of Service</h3>
              <p className="text-neutral-500 text-sm">Rules for using Speedoo.</p>
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-12 text-center pb-8 border-t border-neutral-100 pt-8">
          <p className="text-xs text-neutral-400">Version 1.3.0</p>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
            © 2026 Speedoo - Instant Commerce.
          </p>
        </div>
      </div>
    </div>
  );
}
