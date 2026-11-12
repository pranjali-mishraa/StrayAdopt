import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { listNgos } from "../services/adminService";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    listNgos(status)
      .then((data) => setNgos(data.ngos || []))
      .catch((err) => setError(err?.response?.data?.message || "Could not load requests."))
      .finally(() => setLoading(false));
  }, [status]);

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-bark-dark">NGO verification requests</h1>
            <p className="text-text-mid text-sm mt-1">Signed in as {admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="h-10 px-5 border border-rust text-rust rounded-lg text-sm font-medium hover:bg-rust hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`px-5 h-10 rounded-full text-sm font-medium transition-colors ${
                status === tab.key
                  ? "bg-bark-dark text-cream"
                  : "border border-border-brand text-bark-dark hover:border-rust"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-text-mid">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        ) : ngos.length === 0 ? (
          <p className="bg-white border border-border-brand rounded-2xl p-10 text-center text-text-mid">
            No {status === "verified" ? "approved" : status} requests.
          </p>
        ) : (
          <div className="space-y-4">
            {ngos.map((ngo) => (
              <div key={ngo._id} className="bg-white border border-border-brand rounded-2xl p-5 flex flex-wrap items-center gap-5">
                <img src={ngo.image} alt={ngo.name} className="w-16 h-16 rounded-full object-cover border border-border-brand" />
                <div className="flex-1 min-w-[220px]">
                  <h2 className="font-display text-lg font-semibold text-bark-dark">{ngo.name}</h2>
                  <p className="text-sm text-text-mid">{ngo.email}</p>
                  <p className="text-[12px] text-text-light mt-1">
                    Submitted {new Date(ngo.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {ngo.verificationDocuments?.length || 0} document(s)
                  </p>
                </div>
                <Link
                  to={`/admin/ngos/${ngo._id}`}
                  className="h-10 px-6 inline-flex items-center bg-rust hover:bg-rust-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}