import { useState } from "react";
import { Link } from "react-router-dom";

export default function PetCard({ post }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = post.images || [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border-brand flex flex-col">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={images[activeImage]}
          alt={post.description}
          className="w-full h-full object-cover"
        />

        {/* Status badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-sage-light px-4 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-sage" />
          <span className="text-sm font-medium text-bark-dark capitalize">
            {post.status || "Available"}
          </span>
        </div>

        {/* Dots for multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeImage ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
                aria-label={`Show image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <p className="text-bark-dark text-[17px] leading-snug mb-4 line-clamp-3">
          {post.description}
        </p>

        <div className="border-t border-border-brand mb-4" />

        <div className="flex items-center gap-2 mb-2.5 text-text-mid text-[15px]">
          <span className="w-7 h-7 rounded-full bg-rust/10 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C0572A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          {post.location}
        </div>

        <div className="flex items-center gap-2 mb-5 text-text-mid text-[15px]">
          <span className="w-7 h-7 rounded-full bg-rust/10 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C0572A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>
          </span>
          Posted by <span className="font-semibold text-bark-dark">{post.postBy?.username}</span>
        </div>

        <Link
          to={`/chats?with=${post.postBy?._id}&post=${post._id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 bg-rust hover:bg-rust-hover text-white font-medium py-3.5 rounded-xl transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Message Owner
        </Link>
      </div>
    </div>
  );
}