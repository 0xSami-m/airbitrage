export type Page = 'Search' | 'AI Travel Agent' | 'My Dashboard' | 'Settings' | 'Dev';

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

function FlyaiLogo() {
  return (
    <svg viewBox="0 0 290 58" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Extended baseline swoosh from left */}
      <path d="M0 50 Q30 50 56 47" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round"/>
      {/* flyai text */}
      <text x="54" y="52" fontFamily="'Caveat', cursive" fontWeight="700" fontSize="44" fill="#1A1A1A">flyai</text>
      {/* Ascending line from 'i' up to plane */}
      <path d="M178 46 Q210 28 238 10" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round"/>
      {/* Plane body */}
      <path d="M238 10 Q246 2 254 1 Q261 0 263 7 Q265 14 258 20 Q251 26 238 30 L222 35 L213 38 L222 25 Z"
            stroke="#1A1A1A" strokeWidth="3.5" strokeLinejoin="round" fill="white"/>
      {/* Wing */}
      <path d="M253 14 Q261 5 272 3 Q274 10 268 15 Q263 19 253 19"
            stroke="#1A1A1A" strokeWidth="3.5" strokeLinejoin="round" fill="white"/>
      {/* Tail */}
      <path d="M222 32 Q215 38 212 48 Q218 48 225 41 L228 35"
            stroke="#1A1A1A" strokeWidth="3.5" strokeLinejoin="round" fill="white"/>
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
      <div className="max-w-5xl mx-auto flex items-center h-16 gap-4">
        {/* Logo */}
        <button
          onClick={() => onChange('Search')}
          className="shrink-0"
        >
          <FlyaiLogo />
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
