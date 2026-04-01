export type Page = 'Search' | 'AI Travel Agent' | 'My Dashboard' | 'Settings' | 'Dev' | 'Analytics';

interface Props {
  current: Page;
  onChange: (page: Page) => void;
}

function CompassIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      <path d="M14.5 9.5l-3 6-3-6 6 3z" fill="currentColor" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}


const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'Search',           label: 'Take me anywhere', icon: <CompassIcon /> },
  { page: 'AI Travel Agent',  label: 'Ask Sami',         icon: <ChatIcon /> },
  { page: 'My Dashboard',     label: 'My account',       icon: <PersonIcon /> },
];

export default function Nav({ current, onChange }: Props) {
  return (
    <nav className="w-full bg-[#EEEAE4] border-b border-[#D4D0CB] px-6">
      <div className="max-w-5xl mx-auto flex items-center h-28 gap-4">
        {/* Logo */}
        <button
          onClick={() => onChange('Search')}
          className="shrink-0"
        >
          <img src="/flyai_logo.png" alt="flyai" className="h-24 w-auto" />
        </button>

        {/* Nav items — centered */}
        <div className="flex items-center gap-10 mx-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.page}
              onClick={() => onChange(item.page)}
              className={`flex flex-col items-center gap-0.5 py-1 transition ${
                current === item.page
                  ? 'text-[#1A1A1A]'
                  : 'text-[#999999] hover:text-[#555555]'
              }`}
            >
              {item.icon}
              <span className={`text-xs whitespace-nowrap ${current === item.page ? 'font-semibold underline underline-offset-2' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Settings */}
        <button
          onClick={() => onChange('Settings')}
          className="shrink-0 w-9 h-9 rounded-full border border-[#C8C4BE] flex items-center justify-center text-[#666666] hover:text-[#333333] hover:border-[#999999] transition"
        >
          <GearIcon />
        </button>
      </div>
    </nav>
  );
}
