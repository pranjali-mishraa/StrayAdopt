import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { approveNgo, getNgoForReview, rejectNgo } from "../services/adminService";

// Cloudinary serves a file as a download when fl_attachment is added to the URL
const toDownloadUrl = (url) => url.replace("/upload/", "/upload/fl_attachment/");
const isPdf = (url) => url.toLowerCase().split("?")[0].endsWith(".pdf");

function DocumentCard({ doc }) {
  return (
    <div className="border border-border-brand rounded-xl overflow-hidden bg-white">
      <div className="h-40 bg-warm flex items-center justify-center">
        {isPdf(doc.url) ? (
          <span className="text-sm font-medium text-text-mid uppercase tracking-wide">PDF document</span>
        ) : (
          <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-bark-dark truncate mb-3" title={doc.label}>{doc.label || "Document"}</p>
        <div className="flex gap-2">
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-9 inline-flex items-center justify-center border border-border-brand rounded-lg text-sm font-medium text-bark-dark hover:bg-warm transition-colors"
          >
            View
          </a>
          <a
            href={toDownloadUrl(doc.url)}
            className="flex-1 h-9 inline-flex items-center justify-center bg-bark-dark text-cream rounded-lg text-sm font-medium hover:bg-rust transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex gap-4 text-[14px]">
      <span className="w-28 flex-shrink-0 text-text-light">{label}</span>
      <span className="text-bark-dark">{children}</span>
    </div>
  );
}

export default function AdminNgoReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    getNgoForReview(id)
      .then((data) => setNgo(data.ngo))
      .catch((err) => setError(err?.response?.data?.message || "Could not load this NGO."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    setWorking(true);
    setError("");
    try {
      await approveNgo(id);
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not approve.");
      setWorking(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return setError("Please enter a reason for rejection.");
    setWorking(true);
    setError("");
    try {
      await rejectNgo(id, reason);
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not reject.");
      setWorking(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-text-mid">Loading...</div>;
  }

  if (!ngo) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-text-mid">{error || "NGO not found."}</p>
        <Link to="/admin" className="text-rust font-medium hover:underline">Back to requests</Link>
      </div>
    );
  }

  const [lng, lat] = ngo.location?.coordinates || [];

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/admin" className="text-sm text-rust font-medium hover:underline">Back to requests</Link>

        {/* Profile */}
        <div className="bg-white border border-border-brand rounded-2xl p-8 flex flex-wrap gap-6">
          <img src={ngo.image} alt={ngo.name} className="w-28 h-28 rounded-full object-cover border border-border-brand" />
          <div className="flex-1 min-w-[260px] space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-bark-dark">{ngo.name}</h1>
              <span className="text-[11px] uppercase tracking-wide bg-warm text-bark-dark px-3 py-1 rounded-full">
                {ngo.verificationStatus === "verified" ? "Approved" : ngo.verificationStatus}
              </span>
            </div>
            <p className="text-text-mid text-[15px] leading-relaxed">{ngo.description}</p>
            <div className="pt-2 space-y-1.5">
              <Row label="Email">{ngo.email}</Row>
              <Row label="Phone">{ngo.contact?.phone}</Row>
              <Row label="Website">{ngo.contact?.website}</Row>
              <Row label="Address">{ngo.address}</Row>
              {lat !== undefined && (
                <Row label="Location">
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rust hover:underline"
                  >
                    {lat}, {lng} (open in Maps)
                  </a>
                </Row>
              )}
              <Row label="Submitted">
                {new Date(ngo.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </Row>
              {ngo.rejectionReason && <Row label="Rejected for">{ngo.rejectionReason}</Row>}
            </div>
          </div>
        </div>

        {/* Documents */}
        <section>
          <h2 className="font-display text-xl font-semibold text-bark-dark mb-4">
            Verification documents ({ngo.verificationDocuments?.length || 0})
          </h2>
          {ngo.verificationDocuments?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ngo.verificationDocuments.map((doc) => (
                <DocumentCard key={doc._id || doc.url} doc={doc} />
              ))}
            </div>
          ) : (
            <p className="text-text-mid">No documents were uploaded.</p>
          )}
        </section>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        {/* Decision */}
        {ngo.verificationStatus !== "verified" && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={working}
              className="h-12 px-8 bg-rust hover:bg-rust-hover disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
            >
              Approve NGO
            </button>
            {ngo.verificationStatus === "pending" && (
              <button
                onClick={() => setShowReject(true)}
                disabled={working}
                className="h-12 px-8 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 font-medium rounded-xl transition-colors"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReject(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-semibold text-bark-dark mb-2">Reject this NGO?</h3>
            <p className="text-text-mid text-[15px] mb-4">The NGO will be blocked from using NGO features. State the reason.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g. Registration certificate is unreadable"
              className="w-full px-4 py-3 border border-border-brand rounded-xl text-[14px] outline-none focus:border-rust focus:ring-2 focus:ring-rust/20 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 h-11 border border-border-brand rounded-xl font-medium text-bark-dark hover:bg-warm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={working}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
              >
                {working ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}