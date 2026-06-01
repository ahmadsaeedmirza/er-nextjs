interface FilterSidebarProps {
  sortBy: string;
  onSortChange: (val: string) => void;
  availability: string;
  onAvailabilityChange: (val: string) => void;
}

export default function FilterSidebar({
  sortBy,
  onSortChange,
  availability,
  onAvailabilityChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-full md:w-64 space-y-8 md:sticky md:top-28 h-fit">
      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-800">
          Sort By
        </h3>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] text-sm text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="default">Default Sorting</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-800">
          Availability
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="availability"
              value="all"
              checked={availability === "all"}
              onChange={() => onAvailabilityChange("all")}
              className="w-4 h-4 text-[#CF1745] border-slate-300 focus:ring-[#CF1745] focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
              All Products
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="availability"
              value="in-stock"
              checked={availability === "in-stock"}
              onChange={() => onAvailabilityChange("in-stock")}
              className="w-4 h-4 text-[#CF1745] border-slate-300 focus:ring-[#CF1745] focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
              In Stock Only
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
}
