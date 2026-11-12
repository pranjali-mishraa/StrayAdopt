import MediaThumb from "./MediaThumb";

export default function HighlightsRow({ items, onOpen, onAdd }) {
  if (!items.length && !onAdd) return null;

  return (
    <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {onAdd && (
        <button type="button" onClick={onAdd} className="flex flex-col items-center gap-2 w-20 flex-shrink-0 group">
          <span className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-border-brand group-hover:border-rust flex items-center justify-center text-3xl leading-none text-text-light group-hover:text-rust transition-colors">
            +
          </span>
          <span className="text-[12px] text-text-mid">New</span>
        </button>
      )}

      {items.map((item, i) => (
        <button
          key={item._id}
          type="button"
          onClick={() => onOpen(i)}
          className="flex flex-col items-center gap-2 w-20 flex-shrink-0 group"
        >
          <span className="w-[72px] h-[72px] rounded-full p-[2px] bg-border-brand group-hover:bg-rust transition-colors">
            <span className="block w-full h-full rounded-full border-2 border-cream overflow-hidden bg-warm">
              <MediaThumb item={item} />
            </span>
          </span>
          <span className="text-[12px] text-text-mid w-full truncate">{item.caption || "Highlight"}</span>
        </button>
      ))}
    </div>
  );
}