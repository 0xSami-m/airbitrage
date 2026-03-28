export type Page = 'Search' | 'Discover' | 'AI Travel Agent' | 'My Dashboard' | 'Settings' | 'Dev';

const NAV_ITEMS: Page[] = ['Search', 'Discover', 'AI Travel Agent', 'My Dashboard', 'Settings', 'Dev'];

interface Props {
  current: Page;
  onChange: (page: Page) => void;
}

export default function Nav({ current, onChange }: Props) {
  return (
    <nav className="w-full bg-white border-b border-[#dddddd] px-6">
      <div className="max-w-5xl mx-auto flex items-center gap-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`px-4 py-4 text-sm font-medium transition border-b-2 whitespace-nowrap ${
              current === item
                ? 'border-[#aaaaaa] text-[#444444]'
                : 'border-transparent text-[#aaaaaa] hover:text-[#666666]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}
