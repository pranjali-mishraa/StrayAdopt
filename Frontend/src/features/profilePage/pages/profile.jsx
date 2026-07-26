import { useAuthService } from "../../auth/hooks/useAuthService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPosts } from "../../home/services/postService";
import PetCard from "../../Components/PetCard";
export default function Profile() {
  const { user, handleLogout } = useAuthService();
  const navigate = useNavigate();

  async function onLogout() {
    await handleLogout();
    navigate("/login");
  }

  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const data = await getMyPosts();
        setMyPosts(data.posts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchMyPosts();
  }, []);


  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      {/* Profile card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border-brand p-8">
        <div className="w-20 h-20 rounded-full bg-rust text-white flex items-center justify-center text-3xl font-semibold mx-auto mb-4">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <h1 className="font-display text-2xl font-bold text-bark-dark text-center mb-1">
          {user?.username}
        </h1>
        <p className="text-text-light text-center text-sm mb-8">{user?.email}</p>
  
        <button
          onClick={onLogout}
          className="w-full h-12 border border-rust text-rust rounded-xl font-medium hover:bg-rust hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
  
      {/* My Posts section */}
      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="font-display text-2xl font-semibold text-bark-dark mb-8">
          My Posts
        </h2>
  
        {loadingPosts ? (
          <p className="text-text-light text-center py-10">Loading your posts...</p>
        ) : myPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border-brand">
            <p className="text-text-mid mb-4">You haven't posted any pets yet.</p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white font-medium px-6 py-3 rounded-full transition-colors"
            >
              Post a Stray
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {myPosts.map((post) => (
              <PetCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}