import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNgoHighlights, getNgoPosts, getNgoProfile } from "../services/ngoService";
import ProfileHeader from "../components/ProfileHeader";
import HighlightsRow from "../components/HighlightsRow";
import MediaViewer from "../components/MediaViewer";
import PostsGrid from "../components/PostsGrid";
import { useNavigate } from "react-router-dom";
import { useNgoAuth } from "../hooks/useNgoAuth";

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full bg-warm" />
        <div className="flex-1 w-full space-y-3">
          <div className="h-6 w-1/2 bg-warm rounded" />
          <div className="h-4 w-1/3 bg-warm rounded" />
          <div className="h-16 w-full bg-warm rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 sm:gap-3 mt-12">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square bg-warm" />)}
      </div>
    </div>
  );
}

export default function NgoProfile() {
  const { id } = useParams();

  const navigate = useNavigate();
const { ngo: loggedInNgo, loading: authLoading } = useNgoAuth();

useEffect(() => {
  if (!authLoading && loggedInNgo?._id === id) {
    navigate("/ngo/dashboard", { replace: true });
  }
}, [authLoading, loggedInNgo, id, navigate]);

  const [ngo, setNgo] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  const [viewer, setViewer] = useState(null); // { items, index }

  useEffect(() => {
    setLoading(true);
    setError("");
    setPage(1);
    Promise.all([getNgoProfile(id), getNgoHighlights(id)])
      .then(([profile, media]) => {
        setNgo(profile.ngo);
        setHighlights(media.highlights || []);
      })
      .catch((err) => setError(err?.response?.data?.message || "Could not load this NGO."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingPosts(true);
    setPostsError("");
    getNgoPosts(id, page)
      .then((data) => {
        setPosts((prev) => (page === 1 ? data.posts || [] : [...prev, ...(data.posts || [])]));
        setTotalPages(data.totalPages || 1);
        setTotalPosts(data.total || 0);
      })
      .catch((err) => setPostsError(err?.response?.data?.message || "Could not load posts."))
      .finally(() => setLoadingPosts(false));
  }, [id, page]);

  // Server returns newest first; viewers play oldest first, like Instagram
  const stories = useMemo(
    () => highlights.filter((h) => h.contentType === "story").reverse(),
    [highlights]
  );
  const permanent = useMemo(
    () => highlights.filter((h) => h.contentType === "highlight"),
    [highlights]
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <ProfileSkeleton />
      </div>
    );
  }
  if (error || !ngo) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-text-mid">{error || "NGO not found."}</p>
        <Link to="/pets" className="text-rust font-medium hover:underline">Back to Explore</Link>
      </div>
    );
  }

  const joined = new Date(ngo.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  const actions = (
    <>
      {ngo.contact?.website && (
        <a
          href={ngo.contact.website}
          target="_blank"
          rel="noreferrer"
          className="h-9 px-5 inline-flex items-center border border-border-brand text-bark-dark hover:bg-warm rounded-lg text-sm font-medium transition-colors"
        >
          Website
        </a>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <ProfileHeader
          ngo={ngo}
          hasStories={stories.length > 0}
          onAvatarClick={() => setViewer({ items: stories, index: 0 })}
          actions={actions}
          stats={[
            { label: "posts", value: totalPosts },
            { label: "highlights", value: permanent.length },
            { label: "joined", value: joined },
          ]}
        />

        <HighlightsRow items={permanent} onOpen={(i) => setViewer({ items: permanent, index: i })} />

        <section className="border-t border-border-brand pt-6">
          <h2 className="text-center text-[12px] uppercase tracking-[0.2em] text-text-mid mb-6">Pets looking for a home</h2>

          {postsError ? (
            <p className="text-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{postsError}</p>
          ) : loadingPosts && posts.length === 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square bg-warm animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-text-mid py-16">No adoption posts yet.</p>
          ) : (
            <>
              <PostsGrid posts={posts} />
              {page < totalPages && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loadingPosts}
                    className="h-11 px-8 border border-border-brand rounded-full text-sm font-medium text-bark-dark hover:border-rust disabled:opacity-50 transition-colors"
                  >
                    {loadingPosts ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {viewer && (
        <MediaViewer
          items={viewer.items}
          startIndex={viewer.index}
          ngo={ngo}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}