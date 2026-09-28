import { useState } from "react";
import { WARD_NAMES } from "./wardNames";
import { Icon, Tap, DuotoneIcon, BottomNav, Topbar, type Screen, type IconName } from "./ui";
import { PhanAnhForm, ReportList, ReportDetail, REPORTS, type Report } from "./PhanAnh";
import { userPosts, byDateDesc } from "./DangBai";
import { NewsDetail, type NewsItem } from "./news";

/* ---------------- Dữ liệu mẫu (thay bằng API khi tích hợp) ---------------- */

export type Ward = {
  id: number;
  name: string;
  cluster: string;
  population: number;
  households: number;
  area: number; // km²
  residentRate: number; // %
  head: string;
  headPhone: string;
  deputy: string;
  deputyPhone: string;
};

const RAW: [number, number, number, number][] = [
  [3245, 912, 0.82, 88], [4120, 1158, 1.05, 91], [2876, 804, 0.64, 86], [3590, 1011, 0.93, 90], [4812, 1342, 1.21, 84],
  [3964, 1105, 0.88, 87], [2710, 768, 0.57, 92], [5230, 1466, 1.36, 81], [3388, 947, 0.79, 89], [4055, 1127, 0.98, 85],
  [3102, 871, 0.71, 90], [4467, 1250, 1.12, 83], [2954, 826, 0.68, 93], [3821, 1069, 0.9, 88], [4390, 1224, 1.08, 86],
];
const HEADS = ["Nguyễn Văn Hùng", "Trần Thị Mai", "Lê Văn Phúc", "Phạm Minh Tuấn", "Võ Thị Hạnh", "Huỳnh Văn Lộc", "Đặng Thị Thu", "Bùi Văn Sơn", "Ngô Thị Lan", "Đỗ Văn Tài", "Hồ Thị Ngọc", "Dương Văn Khải", "Lý Thị Hoa", "Phan Văn Đức", "Trương Thị Hương"];
const DEPUTIES = ["Lê Thị Bích", "Nguyễn Văn Nam", "Phạm Thị Yến", "Trần Văn Bình", "Nguyễn Thị Hồng", "Lê Văn Tâm", "Võ Văn Thành", "Trần Thị Kim", "Huỳnh Thị Nga", "Phạm Văn Long", "Nguyễn Văn Dũng", "Đặng Thị Liên", "Bùi Văn Hải", "Ngô Văn Toàn", "Đỗ Thị Thảo"];

const CLUSTERS = ["Cụm 1", "Cụm 2", "Cụm 3"];

export const WARDS: Ward[] = RAW.map(([population, households, area, residentRate], i) => ({
  id: i + 1,
  name: WARD_NAMES[i],
  cluster: CLUSTERS[Math.floor(i / 5)],
  population,
  households,
  area,
  residentRate,
  head: HEADS[i],
  headPhone: `0900 000 ${101 + i}`,
  deputy: DEPUTIES[i],
  deputyPhone: `0900 000 ${201 + i}`,
}));

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtArea = (n: number) => n.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pad = (n: number) => String(n).padStart(2, "0");
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

/* ---------------- Bản đồ khu phố (sơ đồ minh hoạ) ---------------- */

const COLS = 5;
const ROWS = 3;
const jit = (r: number, c: number, k: number) => (((r * 7 + c * 13 + k * 5) % 11) - 5) * 1.8;
const vx = (r: number, c: number) => 12 + c * 73.2 + (c > 0 && c < COLS ? jit(r, c, 1) : 0);
const vy = (r: number, c: number) => 12 + r * 92 + (r > 0 && r < ROWS ? jit(r, c, 2) : 0);

const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  const pts = [[vx(r, c), vy(r, c)], [vx(r, c + 1), vy(r, c + 1)], [vx(r + 1, c + 1), vy(r + 1, c + 1)], [vx(r + 1, c), vy(r + 1, c)]];
  return {
    id: i + 1,
    row: r,
    d: `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z`,
    cx: pts.reduce((s, p) => s + p[0], 0) / 4,
    cy: pts.reduce((s, p) => s + p[1], 0) / 4,
  };
});

const CLUSTER_FILL = ["#D6E8F9", "#D7EEDF", "#F7E5CB"];
const CLUSTER_INK = ["#1677d2", "#289c73", "#d9822f"];

export function WardMap({ highlight, onSelect, zoom = false, dimCluster, className = "" }: { highlight?: number; onSelect?: (id: number) => void; zoom?: boolean; dimCluster?: string; className?: string }) {
  const focus = highlight ? CELLS[highlight - 1] : undefined;
  const viewBox = zoom && focus ? `${(focus.cx - 130).toFixed(1)} ${(focus.cy - 80).toFixed(1)} 260 160` : "0 0 390 300";
  const ordered = [...CELLS].sort((a, b) => (a.id === highlight ? 1 : 0) - (b.id === highlight ? 1 : 0));
  return (
    <div className={`kp-map ${className}`}>
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" aria-label="Bản đồ khu phố phường Phú An">
        <rect x="-60" y="-60" width="510" height="420" fill="#EAF1E8" />
        {ordered.map((cell) => {
          const active = cell.id === highlight;
          const dim = dimCluster && dimCluster !== "Tất cả" && CLUSTERS[cell.row] !== dimCluster;
          return (
            <path
              key={cell.id}
              d={cell.d}
              fill={active ? "#BFDDFB" : CLUSTER_FILL[cell.row]}
              stroke={active ? "#1677d2" : "#fff"}
              strokeWidth={active ? 3 : 2.5}
              vectorEffect="non-scaling-stroke"
              opacity={dim ? 0.35 : 1}
              style={{ cursor: onSelect ? "pointer" : undefined }}
              onClick={() => onSelect?.(cell.id)}
            />
          );
        })}
        <path d="M-20 205C60 180 110 230 190 196s150-70 230-40" fill="none" stroke="#fff" strokeWidth="9" vectorEffect="non-scaling-stroke" pointerEvents="none" />
        <path d="M-20 205C60 180 110 230 190 196s150-70 230-40" fill="none" stroke="#86B6D8" strokeWidth="3" vectorEffect="non-scaling-stroke" pointerEvents="none" />
        <path d="M150 -10c10 90-20 170 8 320" fill="none" stroke="#fff" strokeWidth="6" vectorEffect="non-scaling-stroke" pointerEvents="none" />
        {CELLS.map((cell) => {
          const active = cell.id === highlight;
          const dim = dimCluster && dimCluster !== "Tất cả" && CLUSTERS[cell.row] !== dimCluster;
          if (active) {
            return (
              <g key={cell.id} transform={`translate(${cell.cx} ${cell.cy})`} pointerEvents="none">
                <path d="M0 6C-9-4-12-8-12-13a12 12 0 0 1 24 0c0 5-3 9-12 19Z" fill="#1677d2" stroke="#fff" strokeWidth="2" />
                <text y="-9" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">{cell.id}</text>
              </g>
            );
          }
          return (
            <g key={cell.id} transform={`translate(${cell.cx} ${cell.cy})`} opacity={dim ? 0.4 : 1} pointerEvents="none">
              <circle r="10.5" fill="#fff" stroke={CLUSTER_INK[cell.row]} strokeWidth="1.6" />
              <text y="3.6" textAnchor="middle" fontSize="10" fontWeight="700" fill={CLUSTER_INK[cell.row]} fontFamily="Inter, sans-serif">{cell.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Màn hình 1: Danh sách khu phố ---------------- */

type ListState = { query: string; cluster: string; view: "list" | "map"; focusId?: number };

function Metric({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="kp-metric">
      <div className="kp-metric-label"><Icon name={icon} size={12} />{label}</div>
      <div className="kp-metric-value">{value}</div>
    </div>
  );
}

function WardCard({ ward, onLocate, onDetail }: { ward: Ward; onLocate: () => void; onDetail: () => void }) {
  const tone = ["blue", "green", "orange"][CLUSTERS.indexOf(ward.cluster)];
  return (
    <div className="kp-card">
      <div className="kp-card-head">
        <div className={`kp-num ${tone}`}>{pad(ward.id)}</div>
        <div className="kp-card-copy">
          <div className="kp-card-name">{ward.name}</div>
          <div className="kp-card-sub"><span className={`category ${tone}`}>{ward.cluster}</span><span className="status"><i />Khu phố số</span></div>
        </div>
      </div>
      <div className="kp-metrics">
        <Metric icon="people" label="Dân số" value={fmt(ward.population)} />
        <Metric icon="home" label="Hộ dân" value={fmt(ward.households)} />
        <Metric icon="area" label="Diện tích" value={`${fmtArea(ward.area)} km²`} />
      </div>
      <div className="kp-actions">
        <Tap className="kp-btn ghost" onClick={onLocate}><Icon name="navigation" size={15} />Định vị</Tap>
        <Tap className="kp-btn solid" onClick={onDetail}>Xem chi tiết<Icon name="arrow" size={14} /></Tap>
      </div>
    </div>
  );
}

function WardTile({ ward, onLocate, onDetail }: { ward: Ward; onLocate: () => void; onDetail: () => void }) {
  const tone = ["blue", "green", "orange"][CLUSTERS.indexOf(ward.cluster)];
  return (
    <Tap className="kp-tile" onClick={onDetail}>
      <span
        className="kp-tile-locate"
        role="button"
        aria-label={`Định vị ${ward.name}`}
        onClick={(e) => { e.stopPropagation(); onLocate(); }}
      >
        <Icon name="navigation" size={12} />
      </span>
      <div className={`duotone ${tone} kp-tile-icon`}>
        <div className="icon-back" />
        <Icon name="home" size={26} />
        <b className="kp-tile-num"><span>{pad(ward.id)}</span></b>
      </div>
      <div className="kp-tile-name">{ward.name}</div>
      <div className="kp-tile-sub">{fmt(ward.households)} hộ</div>
    </Tap>
  );
}

function WardListScreen({ state, setState, go, openDetail }: { state: ListState; setState: (s: ListState) => void; go: (s: Screen) => void; openDetail: (id: number) => void }) {

  const q = norm(state.query);
  const shown = WARDS.filter((w) =>
    (state.cluster === "Tất cả" || w.cluster === state.cluster) &&
    (!q || norm(w.name).includes(q) || norm(`kp ${w.id}`).includes(q) || String(w.id) === q),
  );
  const focus = state.focusId ? WARDS[state.focusId - 1] : undefined;

  return (
    <div className="screen kp-screen">
      <Topbar title="Khu phố số" onBack={() => go("home")} end={<Icon name="bell" />} />
      <div className="kp-body">
        <div className="kp-search">
          <Icon name="search" size={18} color="#7890A6" />
          <input value={state.query} onChange={(e) => setState({ ...state, query: e.target.value })} placeholder="Tìm khu phố (vd: Tân An 5)" />
          {state.query && <Tap className="kp-clear" onClick={() => setState({ ...state, query: "" })}>×</Tap>}
        </div>

        <div className="kp-toolbar">
          <div className="kp-toggle">
            <Tap className={state.view === "list" ? "on" : ""} onClick={() => setState({ ...state, view: "list" })}><Icon name="list" size={15} />Danh sách</Tap>
            <Tap className={state.view === "map" ? "on" : ""} onClick={() => setState({ ...state, view: "map" })}><Icon name="map" size={15} />Bản đồ</Tap>
          </div>
        </div>

        <div className="policy-count"><span>{state.view === "list" ? "Danh sách khu phố" : "Bản đồ khu phố"}</span><small>{shown.length} khu phố</small></div>

        {state.view === "list" ? (
          shown.length > 0 ? (
            <div className="kp-grid">
              {shown.map((w) => (
                <WardTile key={w.id} ward={w} onLocate={() => setState({ ...state, view: "map", focusId: w.id })} onDetail={() => openDetail(w.id)} />
              ))}
            </div>
          ) : (
            <div className="kp-empty"><Icon name="search" size={26} />Không tìm thấy khu phố phù hợp</div>
          )
        ) : (
          <>
            <WardMap className="kp-map-full" highlight={state.focusId} dimCluster={state.cluster} onSelect={(id) => setState({ ...state, focusId: id })} />
            <div className="kp-legend">
              {CLUSTERS.map((c, i) => <span key={c}><i style={{ background: CLUSTER_FILL[i], borderColor: CLUSTER_INK[i] }} />{c}</span>)}
            </div>
            {focus ? (
              <WardCard ward={focus} onLocate={() => setState({ ...state, focusId: focus.id })} onDetail={() => openDetail(focus.id)} />
            ) : (
              <div className="result-box"><div className="result-icon"><Icon name="location" size={20} /></div><div><div className="result-title">Chọn khu phố trên bản đồ</div><div className="result-text">Chạm vào một khu phố để xem nhanh thông tin và định vị.</div></div></div>
            )}
          </>
        )}
      </div>
      <BottomNav active="Trang chủ" go={go} />
    </div>
  );
}

/* ---------------- Màn hình 2: Chi tiết khu phố ---------------- */

type Post = { title: string; date: string; tag: string; icon: IconName; color: string };

function spaceData(w: Ward): Record<string, Post[]> {
  return {
    "Tin tức": [
      { title: `${w.name} triển khai nhóm Zalo kết nối cư dân`, date: "21/06/2025", tag: "Khu phố số", icon: "document", color: "blue" },
      { title: "Tổng kết phong trào xây dựng đời sống văn hoá 6 tháng đầu năm", date: "16/06/2025", tag: "Văn hoá", icon: "document", color: "green" },
      { title: "Lắp đặt thêm camera an ninh tại các tuyến hẻm", date: "12/06/2025", tag: "An ninh", icon: "document", color: "purple" },
    ],
    "Thông báo": [
      { title: `Họp ${w.name} định kỳ tháng 7/2025 lúc 19h00`, date: "24/06/2025", tag: "Quan trọng", icon: "megaphone", color: "purple" },
      { title: "Tạm ngưng cấp điện để bảo trì lưới điện khu vực", date: "20/06/2025", tag: "Điện lực", icon: "megaphone", color: "orange" },
      { title: "Thu phí vệ sinh môi trường quý III/2025", date: "17/06/2025", tag: "Thu phí", icon: "megaphone", color: "blue" },
    ],
    "Hồ sơ an sinh": [],
    "Phản ánh": [],
  };
}

/* ---------------- Hồ sơ an sinh trên bản đồ ---------------- */
// DỮ LIỆU MINH HOẠ (tên, hoàn cảnh là giả định). Hồ sơ an sinh thật là dữ liệu cá nhân nhạy cảm:
// TODO trước khi dùng dữ liệu thật: chỉ hiển thị cho cán bộ đã đăng nhập & được phân quyền, lấy qua API có kiểm soát truy cập.

type WelfareStatus = "Đang hỗ trợ" | "Đang theo dõi" | "Chờ xét duyệt";
type Welfare = {
  code: string;
  group: string;
  groupColor: string;
  status: WelfareStatus;
  name: string;
  address: string;
  support: string;
  note: string;
  amount: string;
  officer: string;
  updated: string;
  x: number; // vị trí ghim trên bản đồ (%)
  y: number;
};

const WELFARE_SEED = [
  { group: "Người cao tuổi", groupColor: "green", status: "Đang theo dõi", name: "Bà Trần Thị Sáu", support: "Trợ cấp hàng tháng", note: "Sống cùng cháu nhỏ, không có nguồn thu nhập ổn định.", amount: "500.000đ/tháng", x: 34, y: 38 },
  { group: "Hộ cận nghèo", groupColor: "orange", status: "Đang hỗ trợ", name: "Hộ ông Lê Văn Bảy", support: "Hỗ trợ thẻ BHYT, học phí", note: "Lao động chính làm nghề tự do, thu nhập không ổn định.", amount: "Theo chính sách", x: 62, y: 30 },
  { group: "Người khuyết tật", groupColor: "purple", status: "Đang hỗ trợ", name: "Ông Nguyễn Văn Tám", support: "Trợ cấp xã hội hàng tháng", note: "Khuyết tật vận động, cần hỗ trợ đi lại khi làm thủ tục.", amount: "720.000đ/tháng", x: 46, y: 64 },
  { group: "Hộ nghèo", groupColor: "blue", status: "Chờ xét duyệt", name: "Hộ bà Phạm Thị Chín", support: "Đề nghị hỗ trợ sửa chữa nhà", note: "Nhà xuống cấp, đang chờ khảo sát thực tế.", amount: "Chờ xét duyệt", x: 70, y: 60 },
] as const;

function welfareData(w: Ward): Welfare[] {
  return WELFARE_SEED.map((r, i) => ({
    ...r,
    status: r.status as WelfareStatus,
    code: `AS-${pad(w.id)}-${String(i + 1).padStart(3, "0")}`,
    address: `${w.name}, Phường Phú An`,
    officer: `Cán bộ LĐ-TB&XH phụ trách ${w.name}`,
    updated: ["22/06/2025", "18/06/2025", "12/06/2025", "20/06/2025"][i],
  }));
}

const STATUS_DOT: Record<WelfareStatus, string> = { "Đang hỗ trợ": "#289c73", "Đang theo dõi": "#8a9aa8", "Chờ xét duyệt": "#d9822f" };
const PIN_COLOR: Record<string, string> = { green: "#289c73", orange: "#e0852f", purple: "#7451bf", blue: "#1677d2" };

function openDirections(address: string) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address + ", TP. Hồ Chí Minh")}`, "_blank", "noopener");
}

function WelfareCard({ item, onDetail, onClose }: { item: Welfare; onDetail: () => void; onClose?: () => void }) {
  return (
    <div className="as-card">
      <div className="as-card-top">
        <span className={`category ${item.groupColor}`}>{item.group}</span>
        <span className="as-status"><i style={{ background: STATUS_DOT[item.status] }} />{item.status}</span>
        {onClose && <Tap className="as-close" onClick={onClose}>✕</Tap>}
      </div>
      <div className="as-name">{item.name}</div>
      <div className="as-row"><b>Địa chỉ</b><span>{item.address}</span></div>
      <div className="as-row"><b>Hỗ trợ</b><span>{item.support}</span></div>
      <div className="as-note">{item.note}</div>
      <div className="as-actions">
        <Tap className="as-btn solid" onClick={onDetail}>Xem chi tiết</Tap>
        <Tap className="as-btn ghost" onClick={() => openDirections(item.address)}>Chỉ đường</Tap>
      </div>
    </div>
  );
}

function WelfareDetail({ item, onBack }: { item: Welfare; onBack: () => void }) {
  const rows: [string, string][] = [
    ["Mã hồ sơ", item.code],
    ["Nhóm đối tượng", item.group],
    ["Trạng thái", item.status],
    ["Địa chỉ", item.address],
    ["Nội dung hỗ trợ", item.support],
    ["Mức hỗ trợ", item.amount],
    ["Cán bộ phụ trách", item.officer],
    ["Cập nhật lần cuối", item.updated],
  ];
  return (
    <div className="as-detail">
      <div className="as-detail-head">
        <Tap className="as-back" onClick={onBack}><Icon name="back" size={18} /></Tap>
        <div><div className="as-name">{item.name}</div><span className={`category ${item.groupColor}`}>{item.group}</span></div>
      </div>
      <div className="as-table">{rows.map(([k, v]) => <div className="as-row" key={k}><b>{k}</b><span>{v}</span></div>)}</div>
      <div className="as-note">{item.note}</div>
      <div className="as-actions">
        <Tap className="as-btn ghost" onClick={() => openDirections(item.address)}>Chỉ đường</Tap>
      </div>
    </div>
  );
}

function WelfareMapPanel({ ward }: { ward: Ward }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState(false);
  const items = welfareData(ward);
  const cur = selected !== null ? items[selected] : null;



  const close = () => { setSelected(null); setDetail(false); };
  return (
    <div className="as-wrap">
      <div className="as-map-box">
        <div className="as-demo">Dữ liệu minh hoạ</div>
        <WardMap highlight={ward.id} zoom className="as-map" />
        {items.map((it, i) => (
          <Tap key={it.code} className={`as-pin ${selected === i ? "on" : ""}`} onClick={() => { setSelected(i); setDetail(false); }}>
            <svg viewBox="0 0 24 30" width="26" height="32" aria-label={it.name} style={{ left: `${it.x}%`, top: `${it.y}%` }}>
              <path d="M12 29C4 19 1 15 1 11a11 11 0 0 1 22 0c0 4-3 8-11 18Z" fill={PIN_COLOR[it.groupColor]} stroke="#fff" strokeWidth="2" />
              <circle cx="12" cy="11" r="4" fill="#fff" />
            </svg>
          </Tap>
        ))}
      </div>
      <div className="as-count"><b>{items.length}</b> hồ sơ an sinh tại {ward.name}</div>
      <div className="news-list kp-posts as-list">
        {items.map((it, i) => (
          <Tap className={`news-item ${selected === i ? "on" : ""}`} key={it.code} onClick={() => { setSelected(i); setDetail(false); }}>
            <span className="as-list-pin" style={{ background: PIN_COLOR[it.groupColor] }}><Icon name="location" size={15} color="#fff" /></span>
            <div className="news-copy">
              <div className="news-title">{it.name}</div>
              <div className="news-date"><span className={`category ${it.groupColor}`}>{it.group}</span><span className="as-status"><i style={{ background: STATUS_DOT[it.status] }} />{it.status}</span></div>
            </div>
          </Tap>
        ))}
      </div>
      {cur && (
        <div className="as-backdrop" onClick={close}>
          <div className="as-sheet" onClick={(e) => e.stopPropagation()}>
            {detail ? <WelfareDetail item={cur} onBack={() => setDetail(false)} /> : <WelfareCard item={cur} onDetail={() => setDetail(true)} onClose={close} />}
          </div>
        </div>
      )}
    </div>
  );
}

const PHOTOS = [
  { caption: "Ra quân Ngày Chủ nhật xanh", date: "22/06/2025", tone: "news-one" },
  { caption: "Lớp kỹ năng số cho người cao tuổi", date: "19/06/2025", tone: "news-two" },
  { caption: "Sinh hoạt hè thiếu nhi", date: "15/06/2025", tone: "news-three" },
  { caption: "Trao quà hộ gia đình khó khăn", date: "10/06/2025", tone: "news-four" },
];

function initials(name: string) {
  const parts = name.split(" ");
  return (parts[parts.length - 2]?.[0] ?? "") + parts[parts.length - 1][0];
}

function WardDetailScreen({ ward, onBack, go, openFullMap }: { ward: Ward; onBack: () => void; go: (s: Screen) => void; openFullMap: () => void }) {
  const [tab, setTab] = useState("Tin tức");
  const [reporting, setReporting] = useState(false);
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [, setTick] = useState(0);
  const wardReports = REPORTS.filter((r) => r.wardId === ward.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const wardPosts = userPosts.filter((p) => p.scope === ward.name).sort(byDateDesc);
  const space = spaceData(ward);
  const tone = ["blue", "green", "orange"][CLUSTERS.indexOf(ward.cluster)];
  const leaders = [
    { role: "Trưởng khu phố", name: ward.head, phone: ward.headPhone },
    { role: "Phó khu phố", name: ward.deputy, phone: ward.deputyPhone },
  ];

  if (report) {
    return (
      <div className="screen pa-screen">
        <Topbar title={report.code} onBack={() => setReport(null)} />
        <div className="pk-staff-note pk-kp-note"><Icon name="user" size={14} />Chế độ Trưởng {ward.name} (demo, chưa kiểm tra quyền)</div>
        <ReportDetail r={report} staff onChange={() => setTick((x) => x + 1)} />
      </div>
    );
  }
  if (article) return <NewsDetail item={article} onBack={() => setArticle(null)} go={go} />;
  if (reporting) return <PhanAnhForm go={go} initialWardId={ward.id} onBack={() => setReporting(false)} />;

  return (
    <div className="screen kp-screen">
      <Topbar title="Chi tiết khu phố" onBack={onBack} end={<Icon name="bell" />} />
      <div className="kp-body">
        <div className="kp-detail-hero">
          <div className="kp-detail-num"><small>KHU PHỐ</small>{pad(ward.id)}</div>
          <div className="kp-detail-copy">
            <div className="kp-detail-name">{ward.name}</div>
            <div className="kp-detail-sub">{ward.cluster} · Phường Phú An</div>
            <span className="kp-detail-chip"><Icon name="check" size={12} />Khu phố số</span>
          </div>
        </div>

        <div className="section-heading"><span>Giới thiệu chung</span></div>
        <div className="kp-panel kp-intro">
          <Icon name="info" size={18} color="#1677d2" />
          <p>{ward.name} thuộc {ward.cluster.toLowerCase()} phường Phú An, gồm {fmt(ward.households)} hộ với {fmt(ward.population)} nhân khẩu trên diện tích {fmtArea(ward.area)} km². Khu phố triển khai mô hình “Khu phố số”: thông báo, tiếp nhận phản ánh và kết nối cư dân trực tuyến qua Phú An Số.</p>
        </div>

        <div className="section-heading"><span>Các chỉ số</span></div>
        <div className="kp-kpis">
          <div className="kp-kpi"><DuotoneIcon icon="people" color="blue" small /><b>{fmt(ward.population)}</b><span>Dân số (người)</span></div>
          <div className="kp-kpi"><DuotoneIcon icon="home" color="green" small /><b>{fmt(ward.households)}</b><span>Số hộ dân</span></div>
        </div>

        <div className="section-heading"><span>Ban điều hành khu phố</span></div>
        <div className="kp-panel kp-leaders">
          {leaders.map((l) => (
            <div className="kp-leader" key={l.role}>
              <div className={`kp-avatar ${tone}`}>{initials(l.name)}</div>
              <div className="kp-leader-copy">
                <div className="kp-leader-role">{l.role}</div>
                <div className="kp-leader-name">{l.name}</div>
                <div className="kp-leader-phone">{l.phone}</div>
              </div>
              <a className="kp-call" href={`tel:${l.phone.replace(/\s/g, "")}`} aria-label={`Gọi ${l.role}`}><Icon name="phone" size={17} /></a>
            </div>
          ))}
        </div>

        <div className="section-heading"><span>Bản đồ khu phố</span></div>
        <div className="kp-panel kp-map-card">
          <WardMap highlight={ward.id} zoom className="kp-map-mini" />
          <Tap className="primary-button kp-map-btn" onClick={openFullMap}><Icon name="map" size={17} />Xem bản đồ đầy đủ</Tap>
        </div>

        <div className="section-heading"><span>Không gian khu phố</span></div>
        <div className="kp-tabs">
          {Object.keys(space).map((t) => <Tap key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</Tap>)}
        </div>
        {tab === "Phản ánh" && (
          <Tap className="kp-report-btn" onClick={() => setReporting(true)}>
            <Icon name="megaphone" size={18} />
            <div><b>Gửi phản ánh</b><span>Phản ánh sẽ được chuyển tới Ban điều hành {ward.name}</span></div>
            <Icon name="arrow" size={15} />
          </Tap>
        )}
        {tab === "Phản ánh" ? <ReportList items={wardReports} onOpen={setReport} empty="Khu phố chưa có phản ánh nào." /> : tab === "Hồ sơ an sinh" ? <WelfareMapPanel ward={ward} /> : <div className="news-list kp-posts">
          {tab === "Tin tức" && wardPosts.map((p) => (
            <Tap className="news-item" key={p.title} onClick={() => setArticle(p)}>
              {p.image ? <img className="news-thumb news-thumb-img kp-post-thumb" src={p.image} alt="" /> : <div className={`news-thumb kp-post-thumb ${p.tone}`}><div className="news-building" /><div className="news-tree" /></div>}
              <div className="news-copy">
                <div className="news-title">{p.title}</div>
                <div className="news-date"><span className="category blue">{p.category}</span><Icon name="calendar" size={12} />{p.date}</div>
              </div>
            </Tap>
          ))}
          {space[tab].map((p) => (
            <Tap className="news-item" key={p.title}>
              <DuotoneIcon icon={p.icon} color={p.color} small />
              <div className="news-copy">
                <div className="news-title">{p.title}</div>
                <div className="news-date"><span className={`category ${p.color}`}>{p.tag}</span><Icon name="calendar" size={12} />{p.date}</div>
              </div>
            </Tap>
          ))}
        </div>}

        <div className="section-heading"><span>Hình ảnh hoạt động cộng đồng</span><Tap className="view-all">Xem tất cả <Icon name="arrow" size={13} /></Tap></div>
        <div className="kp-gallery">
          {PHOTOS.map((p) => (
            <Tap className="kp-photo" key={p.caption}>
              <div className={`news-thumb ${p.tone}`}><div className="news-building" /><div className="news-tree" /><span className="kp-photo-icon"><Icon name="image" size={13} color="#fff" /></span></div>
              <div className="kp-photo-cap">{p.caption}</div>
              <div className="news-date"><Icon name="calendar" size={11} />{p.date}</div>
            </Tap>
          ))}
        </div>
      </div>
      <BottomNav active="Trang chủ" go={go} />
    </div>
  );
}

/* ---------------- Module ---------------- */

export default function KhuPhoModule({ go }: { go: (s: Screen) => void }) {
  const [listState, setListState] = useState<ListState>({ query: "", cluster: "Tất cả", view: "list" });
  const [detailId, setDetailId] = useState<number | null>(null);

  if (detailId) {
    return (
      <WardDetailScreen
        key={detailId}
        ward={WARDS[detailId - 1]}
        go={go}
        onBack={() => setDetailId(null)}
        openFullMap={() => { setListState({ ...listState, view: "map", focusId: detailId, cluster: "Tất cả", query: "" }); setDetailId(null); }}
      />
    );
  }
  return <WardListScreen state={listState} setState={setListState} go={go} openDetail={setDetailId} />;
}
