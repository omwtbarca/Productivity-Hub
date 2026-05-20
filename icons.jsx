/* Lucide-style line icons, kept tiny + consistent stroke */
const Icon = ({ d, size = 16, stroke = 1.6, fill = "none", children, ...p }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  Home: (p) => <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon>,
  Timer: (p) => <Icon {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5" /><path d="M9 2h6" /></Icon>,
  Check: (p) => <Icon {...p}><path d="M3 6h13" /><path d="M3 12h10" /><path d="M3 18h7" /><path d="M19 4l2 2-4 4" /></Icon>,
  Note: (p) => <Icon {...p}><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4" /><path d="M9 12h6M9 16h4" /></Icon>,
  Card: (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></Icon>,
  Habit: (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="7" cy="6" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="17" cy="18" r="1.6" fill="currentColor" /></Icon>,
  Stats: (p) => <Icon {...p}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></Icon>,
  Wave: (p) => <Icon {...p}><path d="M2 12c2 0 2-4 4-4s2 8 4 8 2-8 4-8 2 8 4 8 2-4 4-4" /></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>,
  Sun: (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></Icon>,
  Moon: (p) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7z" /><path d="M10 19a2 2 0 0 0 4 0" /></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>,
  Play: (p) => <Icon {...p}><path d="M6 4v16l14-8z" fill="currentColor" /></Icon>,
  Pause: (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /></Icon>,
  Skip: (p) => <Icon {...p}><path d="M5 4v16l11-8zM18 4v16" /></Icon>,
  Arrow: (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7" /></Icon>,
  Rain: (p) => <Icon {...p}><path d="M8 17v3M12 17v4M16 17v3" /><path d="M6 14a5 5 0 0 1 .5-9.9A6 6 0 0 1 18 6a4 4 0 0 1 .5 7.9" /></Icon>,
  Cafe: (p) => <Icon {...p}><path d="M4 8h14v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" /><path d="M18 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 4v2M12 4v2" /></Icon>,
  Fire: (p) => <Icon {...p}><path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 3 3 3 5a6 6 0 1 1-12 0c0-5 6-5 6-9z" /></Icon>,
  Pin: (p) => <Icon {...p}><path d="M12 2l4 4-2 2 3 5-3 1-2-2-4 4-1-1 4-4-2-2 1-3 2-2z" fill="currentColor" stroke="none" /></Icon>,
  Drag: (p) => <Icon {...p}><circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/></Icon>,
  Leaf: (p) => <Icon {...p}><path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16a4 4 0 0 1-2-2z" /><path d="M4 20c4-4 8-6 12-8" /></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Icon>,
};

window.I = I;
