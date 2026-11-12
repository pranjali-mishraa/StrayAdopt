import { Link } from "react-router-dom";

export default function PostsGrid({ posts, renderActions }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-3">
      {posts.map((post) => (
        <div key={post._id} className="group relative aspect-square overflow-hidden bg-warm">
          <Link to={`/pets/${post._id}`} className="absolute inset-0 block">
            <img
              src={post.images?.[0]}
              alt={post.description}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {post.images?.length > 1 && (
              <span className="absolute top-2 right-2 text-white drop-shadow" aria-label="Multiple photos">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="7" width="14" height="14" rx="2" />
                  <path d="M7 3h12a2 2 0 0 1 2 2v12" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            )}

            {post.status === "adopted" && (
              <span className="absolute bottom-2 left-2 text-[10px] sm:text-[11px] uppercase tracking-wide bg-sage-light text-bark-dark px-2 py-0.5 rounded-full">
                Adopted
              </span>
            )}

            <div className="absolute inset-0 bg-bark-dark/65 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col items-center justify-center text-center p-4 text-cream">
              <p className="text-sm line-clamp-3">{post.description}</p>
              <p className="text-xs mt-2 text-cream/80">{post.location}</p>
            </div>
          </Link>

          {renderActions && <div className="absolute top-2 left-2 z-10">{renderActions(post)}</div>}
        </div>
      ))}
    </div>
  );
}