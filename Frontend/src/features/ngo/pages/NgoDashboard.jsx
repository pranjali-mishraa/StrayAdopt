import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useNgoAuth } from "../hooks/useNgoAuth";
import {
  deleteNgoPost,
  getMyNgoPosts,
  getNgoHighlights,
  getNgoMe,
  toggleNgoPostStatus,
} from "../services/ngoService";
import ProfileHeader from "../components/ProfileHeader";
import HighlightsRow from "../components/HighlightsRow";
import MediaViewer from "../components/MediaViewer";
import MediaThumb from "../components/MediaThumb";
import PostsGrid from "../components/PostsGrid";
import PostManageMenu from "../components/PostManageMenu";
import UploadMediaModal from "../components/UploadMediaModal";
import ConfirmModal from "../../createPost/ConfirmModel"; 

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "posts", label: "Posts" },
  { key: "settings", label: "Settings" },
];

const STATUS_LABEL = {
  verified: "Verified",
  pending: "Pending approval",
  rejected: "Rejected",
  suspended: "Suspended",
};

const primaryBtn =
  "h-9 px-5 inline-flex items-center bg-rust hover:bg-rust-hover text-white rounded-lg text-sm font-medium transition-colors";
const secondaryBtn =
  "h-9 px-5 inline-flex items-center border border-border-brand text-bark-dark hover:bg-warm rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

function timeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return "";
  const h = Math.floor(ms / 36e5);
  return h >= 1 ? `${h}h left` : `${Math.max(1, Math.ceil(ms / 6e4))}m left`;
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="text-center bg-red-50 border border-red-100 rounded-xl px-4 py-6">
      <p className="text-sm text-red-600 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="h-9 px-5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function GridSkeleton({ count = 6, className = "aspect-square" }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${className} bg-warm animate-pulse`} />
      ))}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white border border-border-brand rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold text-bark-dark mb-2">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex gap-4 text-[14px] py-2.5 border-b border-border-brand last:border-0">
      <span className="w-28 flex-shrink-0 text-text-light">{label}</span>
      <span className="text-bark-dark break-words min-w-0">
        {children || <span className="text-text-light">Not provided</span>}
      </span>
    </div>
  );
}

function MediaTile({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-warm text-left"
    >
      <MediaThumb item={item} className="transition-transform duration-500 group-hover:scale-105" />

      {item.contentType === "story" && (
        <span className="absolute top-2 left-2 text-[11px] bg-black/60 text-white px-2.5 py-1 rounded-full">
          {timeLeft(item.expiresAt)}
        </span>
      )}

      {item.mediaType === "video" && (
        <span className="absolute top-2 right-2 text-white drop-shadow" aria-label="Video">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      )}

      {item.caption && (
        <span className="absolute bottom-0 inset-x-0 p-3 pt-8 bg-gradient-to-t from-black/70 to-transparent text-white text-[13px] line-clamp-2">
          {item.caption}
        </span>
      )}
    </button>
  );
}

export default function NgoDashboard() {
  const { ngo, logout } = useNgoAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaError, setMediaError] = useState("");

  const [viewer, setViewer] = useState(null); // { items, index }
  const [uploadType, setUploadType] = useState(null); // "story" | "highlight" | null
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  // /me returns the full document; the login response carries only a few fields
  const view = profile || ngo;
  const ngoId = view?._id;
  const isVerified = view?.verificationStatus === "verified";

  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "posts";
  const setTab = (key) => setParams({ tab: key }, { replace: true });

  useEffect(() => {
    let active = true;
    getNgoMe()
      .then((data) => { if (active) setProfile(data.ngo); })
      .catch(() => {}); // keep showing the data we already have from login
    return () => { active = false; };
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    setPostsError("");
    try {
      const data = await getMyNgoPosts();
      setPosts(data.posts || []);
    } catch (err) {
      setPostsError(err?.response?.data?.message || "Could not load your posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const loadMedia = useCallback(async () => {
    // The public endpoint only serves verified NGOs; unverified ones cannot publish anyway
    if (!ngoId || !isVerified) {
      setHighlights([]);
      setLoadingMedia(false);
      return;
    }
    setLoadingMedia(true);
    setMediaError("");
    try {
      const data = await getNgoHighlights(ngoId);
      setHighlights(data.highlights || []);
    } catch (err) {
      setMediaError(err?.response?.data?.message || "Could not load stories and highlights.");
    } finally {
      setLoadingMedia(false);
    }
  }, [ngoId, isVerified]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  // Stories play oldest first, like Instagram; highlights stay newest first
  const activeStories = useMemo(
    () =>
      highlights
        .filter((h) => h.contentType === "story" && new Date(h.expiresAt) > new Date())
        .reverse(),
    [highlights]
  );
  const permanent = useMemo(() => highlights.filter((h) => h.contentType === "highlight"), [highlights]);

  async function handleToggleStatus(post) {
    setActionError("");
    setBusyId(post._id);
    try {
      const data = await toggleNgoPostStatus(post._id);
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, status: data.post.status } : p)));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not update the post.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setActionError("");
    try {
      await deleteNgoPost(toDelete._id);
      setPosts((prev) => prev.filter((p) => p._id !== toDelete._id));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not delete the post.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  function handleUploaded(item) {
    setHighlights((prev) => [item, ...prev]);
    setUploadType(null);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // the local session is cleared either way
    } finally {
      navigate("/ngo/login");
    }
  }

  if (!view) return null; // logout in progress

  const [lng, lat] = view.location?.coordinates || [];
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const actions = (
    <>
      {isVerified ? (
        <Link to="/ngo/create-post" className={primaryBtn}>Post a stray</Link>
      ) : (
        <span aria-disabled="true" className="h-9 px-5 inline-flex items-center bg-rust/50 text-white rounded-lg text-sm font-medium cursor-not-allowed">
          Post a stray
        </span>
      )}
      <button type="button" disabled={!isVerified} onClick={() => setUploadType("story")} className={secondaryBtn}>
        Add story
      </button>
     
    </>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {!isVerified && (
          <div className="bg-warm border border-border-brand rounded-xl px-5 py-4 text-[15px] text-text-mid">
            Your NGO is awaiting admin approval. Posting, stories and highlights unlock once it is approved.
          </div>
        )}

        <ProfileHeader
          ngo={view}
          hasStories={activeStories.length > 0}
          onAvatarClick={() => setViewer({ items: activeStories, index: 0 })}
          actions={actions}
          stats={[
            { label: "posts", value: loadingPosts ? "–" : posts.length },
            { label: "adopted", value: loadingPosts ? "–" : posts.filter((p) => p.status === "adopted").length },
            { label: "highlights", value: permanent.length },
          ]}
        />

        {isVerified && (
          <HighlightsRow
            items={permanent}
            onOpen={(i) => setViewer({ items: permanent, index: i })}
            onAdd={() => setUploadType("highlight")}
          />
        )}

        {/* Navigation */}
        <nav className="border-t border-border-brand flex justify-center gap-6 sm:gap-14" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              className={`h-12 -mt-px text-[12px] uppercase tracking-[0.15em] border-t-2 transition-colors ${
                tab === t.key
                  ? "border-bark-dark text-bark-dark font-semibold"
                  : "border-transparent text-text-light hover:text-bark-dark"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        {tab === "profile" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Contact">
            
              <Row label="Website">
                {view.contact?.website && (
                  <a href={view.contact.website} target="_blank" rel="noreferrer" className="text-rust hover:underline">
                    {view.contact.website}
                  </a>
                )}
              </Row>
            </Card>

            <Card title="Location">
              <Row label="Address">{view.address}</Row>
              <Row label="Coordinates">
                {hasCoords && (
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rust hover:underline"
                  >
                    {lat}, {lng} (open in Maps)
                  </a>
                )}
              </Row>
            </Card>

            <Card title="Verification">
              <Row label="Status">{STATUS_LABEL[view.verificationStatus] || view.verificationStatus}</Row>
              {isVerified && <Row label="Verified on">{formatDate(view.verifiedAt)}</Row>}
              <Row label="Member since">{formatDate(view.createdAt)}</Row>
            </Card>
          </div>
        )}

        {/* Posts */}
        {tab === "posts" && (
          <section>
            {actionError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{actionError}</p>
            )}

            {postsError ? (
              <ErrorBox message={postsError} onRetry={loadPosts} />
            ) : loadingPosts ? (
              <GridSkeleton />
            ) : posts.length === 0 ? (
              <div className="text-center bg-white border border-border-brand rounded-2xl py-16 px-6">
                <p className="font-display text-xl font-semibold text-bark-dark mb-2">No posts yet</p>
                <p className="text-text-mid mb-6">
                  {isVerified
                    ? "Share a stray that needs a home and it will appear here."
                    : "You can post strays once an admin approves your NGO."}
                </p>
                {isVerified && <Link to="/ngo/create-post" className={primaryBtn}>Post a stray</Link>}
              </div>
            ) : (
              <PostsGrid
                posts={posts}
                renderActions={(post) => (
                  <PostManageMenu
                    post={post}
                    busy={busyId === post._id}
                    onToggleStatus={handleToggleStatus}
                    onDelete={setToDelete}
                  />
                )}
              />
            )}
          </section>
        )}


        {/* Settings */}
        {tab === "settings" && (
          <div className="max-w-xl mx-auto space-y-6">
            <Card title="Account">
              <Row label="Email">{view.email}</Row>
              <Row label="Status">{STATUS_LABEL[view.verificationStatus] || view.verificationStatus}</Row>
              <Row label="Member since">{formatDate(view.createdAt)}</Row>
            </Card>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="h-9 px-5 border border-rust text-rust rounded-lg text-sm font-medium hover:bg-rust hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {viewer && (
        <MediaViewer items={viewer.items} startIndex={viewer.index} ngo={view} onClose={() => setViewer(null)} />
      )}

      {uploadType && (
        <UploadMediaModal
          initialType={uploadType}
          onClose={() => setUploadType(null)}
          onUploaded={handleUploaded}
        />
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete this post?"
        message="This action cannot be undone. The post and its photos will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}