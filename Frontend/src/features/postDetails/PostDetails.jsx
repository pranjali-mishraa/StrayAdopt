import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostById } from "../home/services/postService"; 
import PostGallery from "../Components/PostGallery"; 
import { useAuthService } from "../auth/hooks/useAuthService";
import { startConversation } from "../chat/service/conversationService";


export default function PostDetails() {

  const { user } = useAuthService();
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingConversation, setStartingConversation] = useState(false);


  const isOwner = user?._id === post?.postBy?._id;


  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError("");
      try {
        const data = await getPostById(id);
        setPost(data.post);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load this post.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-mid">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-text-mid">{error || "Post not found."}</p>
        <Link to="/pets" className="text-rust font-medium hover:underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  const postedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleMessageOwner = async () => {
    if (!user) return navigate("/login");
    setStartingConversation(true);
    setError("");
    try {
      const data = await startConversation(post.postBy._id);
      navigate(`/chat/${data.conversation._id}`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not start a conversation.");
    } finally {
      setStartingConversation(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <PostGallery images={post.images} />

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-sage" />
            <span className="text-sm font-medium text-bark-dark capitalize">
              {post.status || "Available"}
            </span>
          </div>

          <p className="text-bark-dark text-2xl leading-snug mb-6">
            {post.description}
          </p>

          <div className="space-y-4 mb-8">
            <DetailRow label="Location" value={post.location} />
            <DetailRow label="Posted by" value={post.postBy?.username} />
            <DetailRow label="Posted on" value={postedDate} />
          </div>

            {!isOwner && <button
            onClick={handleMessageOwner}
            disabled={startingConversation}
            className="inline-flex items-center justify-center gap-2 bg-rust hover:bg-rust-hover text-white font-medium px-8 py-4 rounded-xl transition-colors w-full sm:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {startingConversation ? "Opening chat..." : "Message Owner"}
          </button>}

          
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-[15px]">
      <span className="text-text-light w-28 flex-shrink-0">{label}</span>
      <span className="text-bark-dark font-medium">{value}</span>
    </div>
  );
}
