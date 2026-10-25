import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, Tap } from "./ui";
import { KP_SHAPES } from "./mapData";
import { shortWard } from "./wardNames";

/* ------------------------------------------------------------------
   HỒ SƠ AN SINH THEO KHU PHỐ — tích hợp bản đồ số
   Danh sách và bản đồ đồng bộ theo 3 cấp:
     1. Toàn khu phố   → danh sách nhóm đối tượng + toàn bộ điểm (màu theo nhóm)
     2. Theo nhóm      → danh sách hồ sơ của nhóm (tìm kiếm, lọc) + chỉ điểm của nhóm
     3. Chi tiết hồ sơ → thông tin hồ sơ + bản đồ bay tới, phóng to, đánh dấu nổi bật

   DỮ LIỆU MINH HOẠ: họ tên, địa chỉ, toạ độ đều là giả định, sinh tự động.
   Hồ sơ an sinh thật là dữ liệu cá nhân (một phần là dữ liệu nhạy cảm, vd tình trạng
   khuyết tật). TODO trước khi dùng dữ liệu thật:
     - chỉ cho cán bộ đã đăng nhập & được phân quyền theo khu phố truy cập;
     - lấy dữ liệu qua API có kiểm soát truy cập + ghi nhật ký truy cập;
     - không trả toạ độ/họ tên cho tài khoản người dân thường.
------------------------------------------------------------------- */

export type GroupKey = "ho-ngheo" | "can-ngheo" | "btxh" | "nct" | "co-cong";
type Group = { key: GroupKey; label: string; color: string; desc: string; support: string[]; amount: string[] };

export const GROUPS: Group[] = [
  { key: "ho-ngheo", label: "Hộ nghèo", color: "#d64545", desc: "Hộ có thu nhập dưới chuẩn nghèo", support: ["Hỗ trợ BHYT, học phí", "Hỗ trợ tiền điện", "Hỗ trợ sửa chữa nhà ở"], amount: ["Theo chính sách", "Theo chính sách", "Chờ khảo sát"] },
  { key: "can-ngheo", label: "Hộ cận nghèo", color: "#e0852f", desc: "Hộ có thu nhập sát chuẩn nghèo", support: ["Hỗ trợ thẻ BHYT", "Vay vốn ưu đãi", "Hỗ trợ học phí"], amount: ["Theo chính sách", "Theo hồ sơ vay", "Theo chính sách"] },
  { key: "btxh", label: "Bảo trợ xã hội", color: "#7451bf", desc: "Đối tượng hưởng trợ cấp xã hội hằng tháng", support: ["Trợ cấp xã hội hằng tháng", "Trợ cấp + thẻ BHYT"], amount: ["Theo mức chuẩn trợ giúp", "Theo mức chuẩn trợ giúp"] },
  { key: "nct", label: "Người cao tuổi", color: "#289c73", desc: "Người từ đủ 75 tuổi / cô đơn không nơi nương tựa", support: ["Trợ cấp hằng tháng", "Thăm hỏi, tặng quà"], amount: ["Theo mức chuẩn trợ giúp", "Theo đợt"] },
  { key: "co-cong", label: "Người có công", color: "#1677d2", desc: "Người có công với cách mạng và thân nhân", support: ["Trợ cấp ưu đãi hằng tháng", "Điều dưỡng, thăm hỏi"], amount: ["Theo chính sách", "Theo đợt"] },
];
const groupOf = (k: GroupKey) => GROUPS.find((g) => g.key === k)!;

type Status = "Đang hỗ trợ" | "Đang theo dõi" | "Chờ xét duyệt";
const STATUSES: Status[] = ["Đang hỗ trợ", "Đang theo dõi", "Chờ xét duyệt"];
const STATUS_COLOR: Record<Status, string> = { "Đang hỗ trợ": "#289c73", "Đang theo dõi": "#8a9aa8", "Chờ xét duyệt": "#d9822f" };

export type Record_ = {
  code: string;
  group: GroupKey;
  name: string;
  address: string;
  status: Status;
  support: string;
  amount: string;
  members: number;
  updated: string;
  lat: number;
  lng: number;
};

/* ---------------- Sinh dữ liệu minh hoạ (ổn định theo khu phố) ---------------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const pick = <T,>(r: () => number, a: readonly T[]) => a[Math.floor(r() * a.length)];

const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Huỳnh", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Phan", "Trương"];
const DEM_NAM = ["Văn", "Minh", "Hữu", "Thành", "Công"];
const DEM_NU = ["Thị", "Thị", "Ngọc", "Thu", "Kim"];
const TEN_NAM = ["Bảy", "Tám", "Hai", "Ba", "Tư", "Lộc", "Phước", "Sang", "Hùng", "Dũng", "Tài", "Hòa"];
const TEN_NU = ["Sáu", "Chín", "Mười", "Lan", "Hoa", "Nga", "Hạnh", "Thu", "Mai", "Xuân", "Cúc", "Hồng"];
const DUONG = ["Nguyễn Chí Thanh", "ĐT 744", "Nguyễn Đức Cảnh", "Quốc lộ 13", "ĐX 127", "Hồ Văn Mên", "Lê Chí Dân"];
const COUNTS: Record<GroupKey, [number, number]> = { "ho-ngheo": [4, 9], "can-ngheo": [6, 12], btxh: [5, 10], nct: [7, 14], "co-cong": [3, 7] };

function inside(lat: number, lng: number, poly: [number, number][]) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

const cache = new Map<number, Record_[]>();
export function welfareRecords(wardId: number, wardName: string): Record_[] {
  if (cache.has(wardId)) return cache.get(wardId)!;
  const shape = KP_SHAPES.find((k) => k.name === shortWard(wardName));
  const r = rng(wardId * 7919);
  const out: Record_[] = [];
  const poly = shape?.polygon ?? [];
  const lats = poly.map((p) => p[0]), lngs = poly.map((p) => p[1]);
  const [la0, la1, ln0, ln1] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const point = (): [number, number] => {
    for (let t = 0; t < 200; t++) {
      const p: [number, number] = [la0 + r() * (la1 - la0), ln0 + r() * (ln1 - ln0)];
      if (inside(p[0], p[1], poly)) return p;
    }
    return [(la0 + la1) / 2, (ln0 + ln1) / 2];
  };
  let n = 0;
  for (const g of GROUPS) {
    const [lo, hi] = COUNTS[g.key];
    const count = lo + Math.floor(r() * (hi - lo + 1));
    for (let i = 0; i < count; i++) {
      const female = g.key === "nct" ? r() < 0.6 : r() < 0.5;
      const person = `${pick(r, HO)} ${pick(r, female ? DEM_NU : DEM_NAM)} ${pick(r, female ? TEN_NU : TEN_NAM)}`;
      const household = g.key === "ho-ngheo" || g.key === "can-ngheo";
      const name = household ? `Hộ ${female ? "bà" : "ông"} ${person}` : `${female ? "Bà" : "Ông"} ${person}`;
      const si = Math.floor(r() * g.support.length);
      const status: Status = r() < 0.62 ? "Đang hỗ trợ" : r() < 0.6 ? "Đang theo dõi" : "Chờ xét duyệt";
      const [lat, lng] = point();
      n++;
      out.push({
        code: `AS-${String(wardId).padStart(2, "0")}-${String(n).padStart(3, "0")}`,
        group: g.key,
        name,
        address: `${10 + Math.floor(r() * 280)}${r() < 0.4 ? `/${1 + Math.floor(r() * 30)}` : ""} ${pick(r, DUONG)}, ${wardName}, Phường Phú An`,
        status,
        support: status === "Chờ xét duyệt" ? `Đề nghị: ${g.support[si].toLowerCase()}` : g.support[si],
        amount: status === "Chờ xét duyệt" ? "Chờ xét duyệt" : g.amount[si],
        members: household ? 2 + Math.floor(r() * 5) : 1,
        updated: `${String(1 + Math.floor(r() * 28)).padStart(2, "0")}/${String(5 + Math.floor(r() * 5)).padStart(2, "0")}/2025`,
        lat,
        lng,
      });
    }
  }
  cache.set(wardId, out);
  return out;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

/* ---------------- Bản đồ ---------------- */

type Level = { group: GroupKey | null; record: Record_ | null };

function dotIcon(color: string, state: "normal" | "picked" | "dim") {
  return L.divIcon({
    className: "hs-dot-wrap",
    html: `<span class="hs-dot ${state}" style="--c:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}
function focusIcon(color: string) {
  return L.divIcon({
    className: "hs-dot-wrap",
    html: `<div class="hs-focus" style="--c:${color}"><i></i><span></span></div>`,
    iconSize: [40, 52],
    iconAnchor: [20, 48],
  });
}

function WelfareMap({ wardName, records, level, picked, onMarker }: {
  wardName: string;
  records: Record_[]; // điểm đang hiển thị (đã lọc theo cấp)
  level: Level;
  picked: Record_ | null;
  onMarker: (r: Record_) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const wardBounds = useRef<L.LatLngBounds | null>(null);
  const onMarkerRef = useRef(onMarker);
  onMarkerRef.current = onMarker;

  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const map = L.map(boxRef.current, { zoomControl: false, attributionControl: true });
    map.attributionControl.setPrefix(false);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Tiles © Esri" }).addTo(map);
    const shape = KP_SHAPES.find((k) => k.name === shortWard(wardName));
    if (shape) {
      const poly = L.polygon(shape.polygon, { color: "#0b4f8a", weight: 2.5, dashArray: "6 4", fillColor: "#5aa0e6", fillOpacity: 0.07, interactive: false }).addTo(map);
      wardBounds.current = poly.getBounds();
      map.fitBounds(wardBounds.current, { padding: [16, 16] });
    }
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [wardName]);

  // Vẽ lại điểm + điều khiển khung nhìn mỗi khi cấp / dữ liệu hiển thị thay đổi
  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const detail = level.record;
    records.forEach((r) => {
      const color = groupOf(r.group).color;
      const isFocus = detail?.code === r.code;
      const state = isFocus ? "normal" : detail ? "dim" : picked?.code === r.code ? "picked" : "normal";
      L.marker([r.lat, r.lng], {
        icon: isFocus ? focusIcon(color) : dotIcon(color, state),
        zIndexOffset: isFocus ? 2000 : state === "picked" ? 1000 : 0,
        title: r.name,
        keyboard: false,
      }).on("click", () => onMarkerRef.current(r)).addTo(layer);
    });
  }, [records, level, picked]);

  // Khung nhìn theo cấp: toàn khu phố → vừa nhóm đang lọc → bay tới hồ sơ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const detail = level.record;
    if (detail) {
      map.flyTo([detail.lat, detail.lng], 18, { duration: 0.7 });
    } else if (records.length) {
      const b = L.latLngBounds(records.map((r) => [r.lat, r.lng] as [number, number]));
      if (!level.group && wardBounds.current) b.extend(wardBounds.current);
      map.flyToBounds(b, { padding: [28, 28], maxZoom: 17, duration: 0.6 });
    } else if (wardBounds.current) {
      map.flyToBounds(wardBounds.current, { padding: [16, 16], duration: 0.6 });
    }
  }, [records, level]);

  // Chọn một hồ sơ trong danh sách → đưa điểm vào giữa bản đồ
  useEffect(() => {
    if (picked && !level.record) mapRef.current?.panTo([picked.lat, picked.lng], { animate: true });
  }, [picked]);

  return <div ref={boxRef} className="hs-map" />;
}

/* ---------------- Màn hình chính ---------------- */

export default function HoSoAnSinhPanel({ wardId, wardName }: { wardId: number; wardName: string }) {
  const all = useMemo(() => welfareRecords(wardId, wardName), [wardId, wardName]);
  const [level, setLevel] = useState<Level>({ group: null, record: null });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [picked, setPicked] = useState<Record_ | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const counts = useMemo(() => {
    const m = new Map<GroupKey, number>();
    all.forEach((r) => m.set(r.group, (m.get(r.group) ?? 0) + 1));
    return m;
  }, [all]);

  // Danh sách theo nhóm, sau tìm kiếm + lọc trạng thái
  const q = norm(query);
  const listed = useMemo(() => level.group
    ? all.filter((r) => r.group === level.group && (status === "all" || r.status === status) && (!q || norm(`${r.name} ${r.code} ${r.address}`).includes(q)))
    : all, [all, level.group, status, q]);

  // Điểm trên bản đồ luôn = dữ liệu đang hiển thị ở danh sách
  const onMap = useMemo(() => level.record ? all.filter((r) => r.group === level.record!.group) : listed, [all, level.record, listed]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openGroup = (g: GroupKey | null) => { setLevel({ group: g, record: null }); setQuery(""); setStatus("all"); setPicked(null); scrollTop(); };
  const openDetail = (r: Record_) => { setLevel({ group: r.group, record: r }); setPicked(r); scrollTop(); };
  const backToList = () => { setLevel({ group: level.group, record: null }); };

  const onMarker = (r: Record_) => {
    if (level.group && !level.record) {
      setPicked(r);
      rowRefs.current.get(r.code)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      openDetail(r);
    }
  };

  const g = level.group ? groupOf(level.group) : null;
  const rec = level.record;

  return (
    <div className="hs-wrap" ref={topRef}>
      <div className="pk-staff-note hs-note"><Icon name="user" size={14} />Chế độ cán bộ (demo, chưa kiểm tra quyền) · dữ liệu minh hoạ</div>

      <div className="hs-crumbs" aria-label="Cấp hiển thị">
        <Tap className={!g ? "on" : ""} onClick={() => openGroup(null)}>Toàn khu phố</Tap>
        {g && <><Icon name="arrow" size={11} /><Tap className={!rec ? "on" : ""} onClick={backToList}>{g.label}</Tap></>}
        {rec && <><Icon name="arrow" size={11} /><span className="on">{rec.code}</span></>}
      </div>

      <div className="hs-map-box">
        <WelfareMap wardName={wardName} records={onMap} level={level} picked={picked} onMarker={onMarker} />
        <div className="hs-map-badge">
          {rec ? <><i style={{ background: g!.color }} />Vị trí hồ sơ {rec.code}</>
            : g ? <><i style={{ background: g.color }} />{onMap.length} điểm · {g.label}</>
            : <>{all.length} điểm · {GROUPS.length} nhóm</>}
        </div>
      </div>
      {!g && (
        <div className="hs-legend">
          {GROUPS.map((x) => <span key={x.key}><i style={{ background: x.color }} />{x.label}</span>)}
        </div>
      )}

      {/* Cấp 1: nhóm đối tượng */}
      {!g && (
        <>
          <div className="hs-head"><b>Nhóm đối tượng an sinh</b><small>{all.length} hồ sơ</small></div>
          <div className="hs-groups">
            {GROUPS.map((x) => (
              <Tap key={x.key} className="hs-group" onClick={() => openGroup(x.key)}>
                <span className="hs-group-dot" style={{ background: x.color }} />
                <div className="hs-group-copy">
                  <div className="hs-group-name">{x.label}</div>
                  <div className="hs-group-desc">{x.desc}</div>
                </div>
                <div className="hs-group-count" style={{ color: x.color }}>{counts.get(x.key) ?? 0}<small>hồ sơ</small></div>
                <Icon name="arrow" size={14} color="#8ca0b2" />
              </Tap>
            ))}
          </div>
        </>
      )}

      {/* Cấp 2: danh sách hồ sơ của nhóm */}
      {g && !rec && (
        <>
          <div className="hs-search">
            <Icon name="search" size={16} color="#7890A6" />
            <input id="hs-search" value={query} onChange={(e) => { setQuery(e.target.value); setPicked(null); }} placeholder="Tìm theo tên, mã hồ sơ, địa chỉ" />
            {query && <Tap className="kp-clear" onClick={() => setQuery("")}>×</Tap>}
          </div>
          <div className="hs-chips">
            {(["all", ...STATUSES] as const).map((s) => (
              <Tap key={s} className={`ms-chip ${status === s ? "on" : ""}`} onClick={() => { setStatus(s); setPicked(null); }}>
                {s !== "all" && <i style={{ background: STATUS_COLOR[s] }} />}{s === "all" ? "Tất cả trạng thái" : s}
              </Tap>
            ))}
          </div>
          <div className="hs-head"><b>{g.label}</b><small>{listed.length} / {counts.get(g.key) ?? 0} hồ sơ</small></div>
          {listed.length ? (
            <div className="hs-list">
              {listed.map((r) => (
                <div
                  key={r.code}
                  ref={(el) => { if (el) rowRefs.current.set(r.code, el); else rowRefs.current.delete(r.code); }}
                  role="button"
                  tabIndex={0}
                  className={`hs-row ${picked?.code === r.code ? "on" : ""}`}
                  onClick={() => setPicked(picked?.code === r.code ? null : r)}
                >
                  <span className="hs-row-dot" style={{ background: g.color }} />
                  <div className="hs-row-copy">
                    <div className="hs-row-name">{r.name}</div>
                    <div className="hs-row-addr">{r.address}</div>
                    <div className="hs-row-meta"><span className="hs-code">{r.code}</span><span className="as-status"><i style={{ background: STATUS_COLOR[r.status] }} />{r.status}</span></div>
                  </div>
                  <button type="button" className="hs-row-go" onClick={(e) => { e.stopPropagation(); openDetail(r); }}>Chi tiết</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="kp-empty"><Icon name="search" size={26} />Không có hồ sơ phù hợp bộ lọc</div>
          )}
        </>
      )}

      {/* Cấp 3: chi tiết hồ sơ */}
      {rec && g && (
        <div className="hs-detail">
          <div className="hs-detail-top">
            <span className="hs-pill" style={{ color: g.color, background: g.color + "1a" }}>{g.label}</span>
            <span className="as-status"><i style={{ background: STATUS_COLOR[rec.status] }} />{rec.status}</span>
          </div>
          <div className="as-name">{rec.name}</div>
          <div className="hs-table">
            {([
              ["Họ tên chủ hộ / đối tượng", rec.name.replace(/^Hộ (ông|bà) /, "")],
              ["Nhóm an sinh", g.label],
              ["Địa chỉ", rec.address],
              ["Tình trạng hỗ trợ", rec.status],
              ["Nội dung hỗ trợ", rec.support],
              ["Mức hỗ trợ", rec.amount],
              ...(rec.members > 1 ? [["Số nhân khẩu", String(rec.members)]] : []),
              ["Mã hồ sơ", rec.code],
              ["Cập nhật lần cuối", rec.updated],
            ] as [string, string][]).map(([k, v]) => <div className="hs-trow" key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
          <div className="as-actions">
            <Tap className="as-btn ghost" onClick={backToList}><Icon name="back" size={16} />Danh sách</Tap>
            <a className="as-btn solid hs-link" href={`https://www.google.com/maps/dir/?api=1&destination=${rec.lat},${rec.lng}`} target="_blank" rel="noreferrer"><Icon name="navigation" size={15} />Chỉ đường</a>
          </div>
        </div>
      )}
    </div>
  );
}
