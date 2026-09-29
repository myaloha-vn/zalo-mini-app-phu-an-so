import { useState, type ReactNode } from "react";
import gioiThieuIcon from "./assets/gioi-thieu.png";
import dichVuCongIcon from "./assets/dich-vu-cong.png";
import phanAnhIcon from "./assets/phan-anh-kien-nghi-v3.png";
import chatbotIcon from "./assets/chatbot-ai-v2.png";

export type Screen = "home" | "map" | "social" | "khupho" | "dulich" | "phananh" | "gioithieu" | "thongbao";
export type IconName =
  | "chat"
  | "leaf"
  | "temple"
  | "flag"
  | "ticket"
  | "clock"
  | "route"
  | "share"
  | "compass"
  | "phone"
  | "megaphone"
  | "image"
  | "navigation"
  | "area"
  | "star"
  | "info"
  | "list"
  | "bell"
  | "menu"
  | "search"
  | "home"
  | "map"
  | "people"
  | "alert"
  | "arrow"
  | "document"
  | "briefcase"
  | "book"
  | "health"
  | "grid"
  | "user"
  | "back"
  | "layers"
  | "location"
  | "calendar"
  | "check";

export function Icon({ name, size = 22, color = "currentColor" }: { name: IconName; size?: number; color?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  const paths: Record<IconName, ReactNode> = {
    chat: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" stroke={color} strokeWidth="2.6" strokeLinecap="round"/></>,
    leaf: <><path d="M5 19.5C5 11 10 5 20 4c-.6 10.5-6.5 15.5-15 15.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M5 19.5 13.5 11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    temple: <><path d="M3 9.5h18L12 4 3 9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M5.5 9.5V19m13-9.5V19M10 9.5V19m4-9.5V19M3 20h18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    flag: <><path d="M6 21V4" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><path d="M6 5h11.5l-2.3 4 2.3 4H6" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></>,
    ticket: <><path d="M4 7h16v3.3a1.7 1.7 0 0 0 0 3.4V17H4v-3.3a1.7 1.7 0 0 0 0-3.4V7Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M14.5 7.5v9" stroke={color} strokeWidth="1.6" strokeDasharray="2 2"/></>,
    clock: <><circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8"/><path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    route: <><circle cx="6" cy="18" r="2.2" stroke={color} strokeWidth="1.7"/><circle cx="18" cy="6" r="2.2" stroke={color} strokeWidth="1.7"/><path d="M8.2 18h7.3a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6h7.3" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></>,
    share: <><circle cx="17.5" cy="5.5" r="2.5" stroke={color} strokeWidth="1.7"/><circle cx="6.5" cy="12" r="2.5" stroke={color} strokeWidth="1.7"/><circle cx="17.5" cy="18.5" r="2.5" stroke={color} strokeWidth="1.7"/><path d="m8.7 10.8 6.6-4m-6.6 6.4 6.6 4" stroke={color} strokeWidth="1.7"/></>,
    compass: <><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></>,
    phone: <><path d="M6.2 3.8h3l1.6 4.4-2.2 1.4a11.5 11.5 0 0 0 5.8 5.8l1.4-2.2 4.4 1.6v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.2 6a2 2 0 0 1 2-2.2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></>,
    megaphone: <><path d="M4 10v4a1 1 0 0 0 1 1h2.5l8.5 4.5v-15L7.5 9H5a1 1 0 0 0-1 1Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M19 9.2a3.2 3.2 0 0 1 0 5.6M8 15l1.3 5h2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke={color} strokeWidth="1.8"/><circle cx="9" cy="9.5" r="1.7" stroke={color} strokeWidth="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 4.5 3.5" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></>,
    navigation: <><path d="m3.5 11 17-7.5-7.5 17-2-7.5-7.5-2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></>,
    area: <><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><rect x="8.5" y="8.5" width="7" height="7" rx="1.2" stroke={color} strokeWidth="1.6"/></>,
    star: <><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></>,
    info: <><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><path d="M12 11v5.5m0-9v.1" stroke={color} strokeWidth="2.1" strokeLinecap="round"/></>,
    list: <><path d="M9 6.5h11M9 12h11M9 17.5h11" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><circle cx="4.8" cy="6.5" r="1.2" fill={color}/><circle cx="4.8" cy="12" r="1.2" fill={color}/><circle cx="4.8" cy="17.5" r="1.2" fill={color}/></>,
    bell: <><path d="M6.8 9.5a5.2 5.2 0 0 1 10.4 0c0 5 2.1 5.2 2.1 6.7H4.7c0-1.5 2.1-1.7 2.1-6.7Z" stroke={color} strokeWidth="1.8"/><path d="M9.8 19a2.5 2.5 0 0 0 4.4 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    menu: <><path d="M5 7h14M5 12h14M5 17h14" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" stroke={color} strokeWidth="1.9"/><path d="m15.5 15.5 4 4" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></>,
    home: <><path d="m3.5 11 8.5-7 8.5 7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 9.8V20h12V9.8M10 20v-6h4v6" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/></>,
    map: <><path d="m4 5 5-2 6 2 5-2v16l-5 2-6-2-5 2V5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 3v16m6-14v16" stroke={color} strokeWidth="1.8"/></>,
    people: <><circle cx="12" cy="8" r="3" stroke={color} strokeWidth="1.8"/><path d="M6.5 20v-2a5.5 5.5 0 0 1 11 0v2M5 10a2.5 2.5 0 0 0 0 5m14-5a2.5 2.5 0 0 1 0 5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 9v5m0 3v.1" stroke={color} strokeWidth="2.2" strokeLinecap="round"/></>,
    arrow: <><path d="m9 5 7 7-7 7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></>,
    document: <><path d="M6 3h8l4 4v14H6V3Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v5h4M9 12h6m-6 4h6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="1.8"/><path d="M9 7V4h6v3m-12 5h18M10 12v2h4v-2" stroke={color} strokeWidth="1.8"/></>,
    book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H12v18h4.5a3.5 3.5 0 0 1 3.5 3V5.5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></>,
    health: <><path d="M12 20.5S4 16 4 9.7A4.2 4.2 0 0 1 11.3 7l.7.8.7-.8A4.2 4.2 0 0 1 20 9.7c0 6.3-8 10.8-8 10.8Z" stroke={color} strokeWidth="1.7"/><path d="M8 12h2.5l1-2.5 1.5 5 1-2.5h2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth="1.8"/><rect x="14" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth="1.8"/><rect x="4" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth="1.8"/><rect x="14" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth="1.8"/></>,
    user: <><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    back: <><path d="m15 5-7 7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    layers: <><path d="m12 3-9 5 9 5 9-5-9-5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></>,
    location: <><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" stroke={color} strokeWidth="1.8"/><circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth="1.8"/></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" stroke={color} strokeWidth="1.7"/><path d="M8 3v4m8-4v4M4 10h16" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></>,
    check: <><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><path d="m8 12 2.6 2.6L16.5 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function Tap({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div role="button" tabIndex={0} className={className} onClick={onClick}>{children}</div>;
}

export function DuotoneIcon({ icon, color, small = false }: { icon: IconName; color: string; small?: boolean }) {
  return <div className={`duotone ${color} ${small ? "small" : ""}`}><div className="icon-back"/><Icon name={icon} size={small ? 23 : 29} /></div>;
}

/* ---------------- Menu tiện ích (dùng chung cho thanh điều hướng & trang chủ) ---------------- */

export type Utility = { label: string; icon: IconName; color: string; screen?: Screen; img?: string; url?: string; submenu?: UtilityGroup[]; hideSoon?: boolean };
export type UtilityGroup = { title: string; items: Utility[] };

// Menu con của "Dịch vụ công". Đường dẫn trỏ tới Cổng Dịch vụ công Quốc gia; đổi sang cổng DVC TP.HCM / hệ thống của phường nếu cần.
const DVC_SUBMENU: UtilityGroup[] = [
  {
    title: "",
    items: [
      { label: "Nộp hồ sơ trực tuyến", icon: "document", color: "blue", url: "https://dichvucong.gov.vn" },
      { label: "Tra cứu hồ sơ", icon: "search", color: "green", url: "https://dichvucong.gov.vn" },
    ],
  },
];

export const UTILITY_GROUPS: UtilityGroup[] = [
  {
    title: "Tiện ích nhanh",
    items: [
      { label: "Giới thiệu phường", icon: "info", color: "blue", img: gioiThieuIcon, screen: "gioithieu" },
      { label: "Dịch vụ công", icon: "document", color: "purple", img: dichVuCongIcon, submenu: DVC_SUBMENU },
      { label: "Phản ánh kiến nghị", icon: "alert", color: "orange", img: phanAnhIcon, screen: "phananh" },
      { label: "Chatbot AI", icon: "chat", color: "green", img: chatbotIcon, hideSoon: true },
    ],
  },
];

const isReady = (it: Utility) => Boolean(it.screen || it.url || it.submenu);

export function openUtility(it: Utility, go: (s: Screen) => void, openSubmenu: (it: Utility) => void) {
  if (it.submenu) openSubmenu(it);
  else if (it.screen) go(it.screen);
  else if (it.url) window.open(it.url, "_blank", "noopener");
}

export function UtilityTile({ item, onClick }: { item: Utility; onClick?: () => void }) {
  return (
    <Tap className={`util-tile ${isReady(item) || item.hideSoon ? "" : "soon"}`} onClick={onClick}>
      {item.img ? <img className="util-img" src={item.img} alt="" /> : <DuotoneIcon icon={item.icon} color={item.color} small />}
      <div className="util-label">{item.label}</div>
      {!isReady(item) && !item.hideSoon && <span className="util-soon">Sắp có</span>}
    </Tap>
  );
}

export function UtilitySheet({ onClose, go, title = "Tiện ích", groups = UTILITY_GROUPS }: { onClose: () => void; go: (s: Screen) => void; title?: string; groups?: UtilityGroup[] }) {
  const [sub, setSub] = useState<Utility | null>(null);
  if (sub?.submenu) return <UtilitySheet onClose={() => setSub(null)} go={go} title={sub.label} groups={sub.submenu} />;
  return (
    <div className="util-backdrop" onClick={onClose}>
      <div className="util-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="util-head">
          <span>{title}</span>
          <Tap className="util-close" onClick={onClose}>×</Tap>
        </div>
        <div className="util-scroll">
          {groups.map((g) => (
            <div className="util-group" key={g.title || "main"}>
              {g.title && <div className="util-group-title">{g.title}</div>}
              <div className="util-grid">
                {g.items.map((it) => (
                  <UtilityTile key={it.label} item={it} onClick={() => openUtility(it, (s) => { onClose(); go(s); }, setSub)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const navItems: { label: string; icon: IconName; screen?: Screen }[] = [
  { label: "Trang chủ", icon: "home", screen: "home" },
  { label: "Tiện ích", icon: "grid" },
  { label: "Bản đồ", icon: "map", screen: "map" },
  { label: "Cá nhân", icon: "user", screen: "home" },
];

export function BottomNav({ active, go }: { active: string; go: (screen: Screen) => void }) {
  const [utils, setUtils] = useState(false);
  return (
    <>
      <div className="bottom-nav">
        {navItems.map((item) => {
          const on = utils ? item.label === "Tiện ích" : item.label === active;
          return (
            <Tap key={item.label} className={`nav-item ${on ? "active" : ""}`} onClick={() => (item.screen ? go(item.screen) : setUtils(!utils))}>
              <Icon name={item.icon} size={21} />
              <span>{item.label}</span>
            </Tap>
          );
        })}
      </div>
      {utils && <UtilitySheet onClose={() => setUtils(false)} go={go} />}
    </>
  );
}

export function Topbar({ title, onBack, end }: { title: string; onBack: () => void; end?: ReactNode }) {
  return (
    <div className="topbar">
      <Tap className="topbar-action" onClick={onBack}><Icon name="back"/></Tap>
      <div className="topbar-title">{title}</div>
      <div className="topbar-action">{end}</div>
    </div>
  );
}
