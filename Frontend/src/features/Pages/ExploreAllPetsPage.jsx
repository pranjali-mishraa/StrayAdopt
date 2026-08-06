import { useEffect, useState } from "react";
import { getAllPosts } from "../home/services/postService";
import PetCard from "../Components/PetCard";
import { useInView } from "../about/components/useInView";

function FadeSection({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllPosts(page, 12);
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load pets.");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Banner */}
      <section className="relative h-[260px] sm:h-[320px] overflow-hidden">
        <img
          src="/ManyPets.png"
          alt="Adoptable pets"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-bark-dark text-[23px] font-medium uppercase tracking-widest mb-3">
            Explore
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold text-bark-dark">
            Available Pets
          </h1>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-3xl bg-warm animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-text-mid py-20">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-text-mid py-20">No pets available right now.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <FadeSection key={post._id} delay={(i % 6) * 80}>
                  <PetCard post={post} />
                </FadeSection>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-16">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full border border-border-brand flex items-center justify-center text-bark-dark hover:border-rust disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-rust text-white"
                        : "border border-border-brand text-bark-dark hover:border-rust"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border border-border-brand flex items-center justify-center text-bark-dark hover:border-rust disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}