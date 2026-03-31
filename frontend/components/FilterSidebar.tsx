interface Category {
  name: string;
  count: number;
}

interface FilterSidebarProps {
  categories?: Category[];
}

export default function FilterSidebar({
  categories = [
    { name: "Hair Care", count: 12 },
    { name: "Styling & Finish", count: 8 },
    { name: "Treatments", count: 5 },
    { name: "Tools", count: 3 },
  ],
}: FilterSidebarProps) {
  return (
    <aside className="w-full md:w-64 space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#CF1745E6] mb-6">
          Categories
        </h3>
        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
          {categories.map((category) => (
            <li
              key={category.name}
              className="flex justify-between items-center group cursor-pointer"
            >
              <span className="group-hover:text-[#CF1745E6] transition-colors font-medium">
                {category.name}
              </span>
              <span className="text-[10px] opacity-50">{category.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
