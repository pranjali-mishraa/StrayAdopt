import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PetCard from "../../../components/PetCard"; // adjust path
import { getNgoHighlights, getNgoPosts, getNgoProfile } from "../services/ngoService";

function MediaTile({ item }) {
  const hoursLeft =
    item.contentType === "story"
      ? Math.max(0, Math.ceil((new Date(item.expiresAt) - Date.now()) / 36e5))
      : null;

  return (
    <div className="bg-white border border-border-brand rounded-2xl overflow-hidden">
      <div className="relative aspect-square bg-warm">
        {item.mediaType === "video" ? (
          <video src={item.mediaUrl} controls className="w-full h-full object-cover" />
        ) : (
          <img src={item.mediaUrl} alt={item.caption || "NGO update"} className="w-full h-full object-cover" />
        )}
        {hoursLeft !== null && (
          <span className="absolute top-3 left-3 text-[11px] uppercase tracking-wide bg-black/60 text-white px-2.5 py-1 rounded-full">
            Story · {hoursLeft}h left
          </span>
        )}
      </div>
      {item.caption && <p className="p-4 text-[14px] text-text-mid">{item.caption}</p>}
    </div>
  );
}

export default function NgoProfile() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getNgoProfile(id), getNgoHighlights(id)])
      .then(([profile, media]) => {
        setNgo(profile.ngo);
        setHighlights(media.highlights || []);
      })
      .catch((err) => setError(err?.response?.data?.message || "Could not load this NGO."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getNgoPosts(id, page)
      .then((data) => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setPosts([]));
  }, [id, page]);

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-text-mid">Loading...</div>;
  }

  if (error || !ngo) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-text-mid">{error || "NGO not found."}</p>
        <Link to="/pets" className="text-rust font-medium hover:underline">Back to Explore</Link>
      </div>
    );
  }

  const stories = highlights.filter((h) => h.contentType === "story");
  const permanent = highlights.filter((h) => h.contentType === "highlight");

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <div className="bg-white border border-border-brand rounded-3xl p-8 flex flex-wrap gap-6 items-start">
          <img src={ngo.image} alt={ngo.name} className="w-28 h-28 rounded-full object-cover border border-border-brand" />
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-semibold text-bark-dark">{ngo.name}</h1>
              <span className="text-[11px] uppercase tracking-wide bg-sage-light text-bark-dark px-3 py-1 rounded-full">Verified NGO</span>
            </div>
            <p className="text-text-mid leading-relaxed mb-4">{ngo.description}</p>
            <div className="text-[14px] text-text-mid space-y-1">
              {ngo.address && <p>{ngo.address}</p>}
              {ngo.contact?.phone && <p>{ngo.contact.phone}</p>}
              {ngo.contact?.website && (
                <a href={ngo.contact.website} target="_blank" rel="noreferrer" className="text-rust hover:underline">
                  {ngo.contact.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {stories.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold text-bark-dark mb-6">Stories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {stories.map((item) => <MediaTile key={item._id} item={item} />)}
            </div>
          </section>
        )}

        {permanent.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold text-bark-dark mb-6">Highlights</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {permanent.map((item) => <MediaTile key={item._id} item={item} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl font-semibold text-bark-dark mb-6">Pets looking for a home</h2>
          {posts.length === 0 ? (
            <p className="text-text-mid">No adoption posts yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {posts.map((post) => <PetCard key={post._id} post={post} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-5 h-10 border border-border-brand rounded-full text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-mid">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-5 h-10 border border-border-brand rounded-full text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
