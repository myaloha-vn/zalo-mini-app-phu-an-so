import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BottomNav, Icon, Tap, Topbar, type Screen } from "./ui";
import { WARD_NAMES, shortWard } from "./wardNames";

/* ------------------------------------------------------------------
   BẢN ĐỒ SỐ PHÚ AN
   DỮ LIỆU MINH HOẠ: toạ độ các địa điểm là ước lượng để demo, CHƯA được
   xác minh ngoài thực địa (trừ những điểm có verified = true).
   TODO: thay bằng dữ liệu địa điểm & ranh giới khu phố chính thức của phường.
   Nền bản đồ dùng OpenStreetMap (cần ghi nguồn; khi chạy thật nên dùng
   máy chủ tile riêng hoặc nhà cung cấp có hợp đồng, không dùng tile.openstreetmap.org
   cho lưu lượng lớn).
------------------------------------------------------------------- */

type Cat = { key: string; label: string; color: string; emoji: string };
export const MAP_CATS: Cat[] = [
  { key: "hc", label: "Hành chính", color: "#1f6fb2", emoji: "🏛️" },
  { key: "cs", label: "Công sở – văn hoá", color: "#0f766e", emoji: "🏢" },
  { key: "th", label: "Trường học", color: "#3aa655", emoji: "🎓" },
  { key: "yt", label: "Y tế", color: "#e0452b", emoji: "🏥" },
  { key: "tn", label: "Tín ngưỡng", color: "#7c3aed", emoji: "🛕" },
  { key: "dt", label: "Di tích – du lịch", color: "#f08c00", emoji: "📍" },
  { key: "ti", label: "Tiện ích – giao lộ", color: "#38b2e0", emoji: "🛒" },
];
const catOf = (k: string) => MAP_CATS.find((c) => c.key === k)!;

// Tâm ước lượng của từng khu phố (minh hoạ), theo thứ tự WARD_NAMES.
const WARD_CENTERS: [number, number][] = [
  [11.0405, 106.6035], [11.0445, 106.6085], [11.0365, 106.6105], [11.0330, 106.6040], [11.0290, 106.6100],
  [11.0360, 106.6245], [11.0310, 106.6290], [11.0405, 106.6300], [11.0255, 106.6225], [11.0215, 106.6300],
  [11.0560, 106.5905], [11.0520, 106.6000], [11.0495, 106.5820], [11.0440, 106.5930], [11.0610, 106.5810],
];

type Place = { name: string; ward: number; cat: string; lat: number; lng: number; address?: string; verified?: boolean };
const off = (w: number, dLat: number, dLng: number): [number, number] => [WARD_CENTERS[w][0] + dLat, WARD_CENTERS[w][1] + dLng];
const P = (name: string, ward: number, cat: string, dLat = 0, dLng = 0, extra: Partial<Place> = {}): Place => {
  const [lat, lng] = off(ward, dLat, dLng);
  return { name, ward, cat, lat, lng, ...extra };
};

export const PLACES: Place[] = [
  P("UBND phường Phú An", 2, "hc", 0.0010, 0.0010),
  P("Công an phường Phú An", 2, "hc", -0.0012, 0.0016),
  P("Phòng Kinh tế, Hạ tầng và Đô thị", 2, "hc", 0.0018, -0.0012),
  P("Bộ phận tiếp nhận & trả kết quả", 2, "hc", -0.0004, -0.0018),
  P("Nhà văn hoá khu phố Tân An 1", 0, "cs"),
  P("Nhà văn hoá khu phố Hiệp An 3", 6, "cs"),
  P("Trung tâm Văn hoá – Thể thao phường", 7, "cs", 0.0012, -0.0015),
  P("Bưu điện văn hoá phường", 1, "cs", -0.0015, 0.0010),
  P("Trường Mầm non Tân An", 1, "th", 0.0012, -0.0020),
  P("Trường Tiểu học Tân An", 3, "th", 0.0010, 0.0012),
  P("Trường THCS Tân An", 4, "th", -0.0008, -0.0010),
  P("Trường Tiểu học Hiệp An", 8, "th", 0.0008, 0.0010),
  P("Trường Mầm non Hiệp An", 5, "th", -0.0010, -0.0012),
  P("Trường Tiểu học Phú An", 11, "th", 0.0006, 0.0012),
  P("Trạm Y tế phường Phú An", 2, "yt", -0.0020, -0.0002),
  P("Phòng khám đa khoa khu vực", 7, "yt", -0.0012, 0.0012),
  P("Nhà thuốc khu phố Bến Liễu", 14, "yt", 0.0008, 0.0010),
  P("Chùa khu phố Tân An 3", 1, "tn", 0.0004, 0.0014),
  P("Miếu khu phố Tân An 7", 3, "tn", 0.0012, -0.0008),
  P("Đình Phú Thứ", 13, "tn"),
  P("Nhà thờ Hiệp An", 9, "tn", 0.0010, -0.0010),
  P("Miếu Bà khu phố Bến Giảng", 12, "tn"),
  P("Khu du lịch Đại Nam", 7, "dt", 0.0050, -0.0080, { address: "1765A Quốc lộ 13", verified: true }),
  P("Bến đò Bến Giảng", 12, "dt", -0.0010, -0.0020),
  P("Vườn cây ăn trái Phú Thuận", 11, "dt", -0.0012, -0.0015),
  P("Chợ Tân An", 0, "ti", -0.0010, 0.0012),
  P("Chợ Hiệp An", 6, "ti", 0.0012, -0.0006),
  P("Siêu thị mini khu phố Tân An 8", 4, "ti", 0.0008, 0.0010),
  P("Ngã tư Hiệp An", 5, "ti", 0.0016, 0.0012),
  P("Giao lộ An Thuận", 10, "ti", -0.0010, 0.0014),
  P("Điểm thu gom rác Phú Thứ", 13, "ti", 0.0012, 0.0012),
];

const DEFAULT_VIEW: { center: [number, number]; zoom: number } = { center: [11.0410, 106.6060], zoom: 13 };

function pinIcon(c: Cat, active = false) {
  return L.divIcon({
    className: "ms-pin-wrap",
    html: `<div class="ms-pin${active ? " on" : ""}" style="--c:${c.color}"><span>${c.emoji}</span></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
  });
}

function placeAddress(p: Place) {
  return `${p.address ? p.address + ", " : ""}${WARD_NAMES[p.ward]}, Phường Phú An`;
}

export default function MapSoScreen({ go }: { go: (s: Screen) => void }) {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [full, setFull] = useState(false);
  const [tileError, setTileError] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<Place, L.Marker>());

  const q = query.trim().toLowerCase();
  const items = useMemo(() => PLACES.filter((p) =>
    (cat === "all" || p.cat === cat) &&
    (!q || p.name.toLowerCase().includes(q) || WARD_NAMES[p.ward].toLowerCase().includes(q) || shortWard(WARD_NAMES[p.ward]).toLowerCase().includes(q))
  ), [cat, q]);

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true }).setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    let errors = 0;
    tiles.on("tileerror", () => { errors += 1; if (errors > 3) setTileError(true); });
    tiles.on("tileload", () => setTileError(false));
    map.attributionControl.setPrefix(false); // bỏ chữ "Leaflet"; giữ ghi nguồn OSM (bắt buộc theo giấy phép ODbL)
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Vẽ lại marker khi bộ lọc đổi
  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    markersRef.current.clear();
    items.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: pinIcon(catOf(p.cat), p === selected), title: p.name })
        .on("click", () => setSelected(p))
        .addTo(layer);
      markersRef.current.set(p, m);
    });
    if (items.length && !selected) map.fitBounds(L.latLngBounds(items.map((p) => [p.lat, p.lng])), { padding: [28, 28], maxZoom: 15 });
  }, [items, selected]);

  useEffect(() => { setTimeout(() => mapRef.current?.invalidateSize(), 60); }, [full]);

  const focus = (p: Place) => {
    setSelected(p);
    mapRef.current?.flyTo([p.lat, p.lng], 16, { duration: 0.6 });
    boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const reset = () => {
    setCat("all"); setQuery(""); setSelected(null);
    mapRef.current?.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
  };

  return (
    <div className="screen ms-screen">
      <Topbar title="Bản đồ số Phú An" onBack={() => go("home")} />
      <div className="ms-body">
        <div className="ms-chips">
          <Tap className={`ms-chip ${cat === "all" ? "on" : ""}`} onClick={() => { setCat("all"); setSelected(null); }}><i style={{ background: "#9aa9b6" }} />Tất cả</Tap>
          {MAP_CATS.map((c) => (
            <Tap key={c.key} className={`ms-chip ${cat === c.key ? "on" : ""}`} onClick={() => { setCat(c.key); setSelected(null); }}>
              <i style={{ background: c.color }} />{c.label}
            </Tap>
          ))}
        </div>
        <Tap className="ms-reset" onClick={reset}>↺ Đặt lại bản đồ</Tap>

        <div className={`ms-map-box ${full ? "full" : ""}`}>
          <div ref={boxRef} className="ms-map" />
          <Tap className="ms-full-btn" onClick={() => setFull(!full)}>{full ? "✕ Thu nhỏ" : "⛶ Toàn màn hình"}</Tap>
          <div className="ms-demo-badge">Vị trí minh hoạ</div>
          {tileError && <div className="ms-tile-note">Không tải được nền bản đồ trong bản xem trước này. Các điểm vẫn hiển thị đúng vị trí tương đối.</div>}
          {selected && (
            <div className="ms-popup">
              <div className="ms-popup-head">
                <span className="ms-popup-emoji" style={{ background: catOf(selected.cat).color }}>{catOf(selected.cat).emoji}</span>
                <div>
                  <b>{selected.name}</b>
                  <small>{placeAddress(selected)}</small>
                </div>
                <Tap className="ms-popup-x" onClick={() => setSelected(null)}>✕</Tap>
              </div>
              <div className="ms-popup-actions">
                <span className="ms-tag" style={{ color: catOf(selected.cat).color, background: catOf(selected.cat).color + "1a" }}>{catOf(selected.cat).emoji} {catOf(selected.cat).label}</span>
                <a className="ms-dir" href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer"><Icon name="map" size={14} />Chỉ đường</a>
              </div>
            </div>
          )}
        </div>

        <div className="ms-search">
          <Icon name="search" size={18} color="#7890A6" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); }} placeholder="Tìm địa điểm, khu phố..." />
        </div>
        <div className="ms-count">{items.length} địa điểm</div>

        <div className="ms-list">
          {items.map((p) => {
            const c = catOf(p.cat);
            return (
              <Tap key={p.name} className={`ms-item ${selected === p ? "on" : ""}`} onClick={() => focus(p)}>
                <span className="ms-item-pin">📍</span>
                <div className="ms-item-copy">
                  <div className="ms-item-name">{p.name}</div>
                  <div className="ms-item-addr">{placeAddress(p)}</div>
                  {p.verified && <div className="ms-verified">📌 Vị trí đã xác minh</div>}
                  <span className="ms-tag" style={{ color: c.color, background: c.color + "1a" }}>{c.emoji} {c.label}</span>
                </div>
              </Tap>
            );
          })}
          {!items.length && <div className="kp-empty"><Icon name="search" size={26} />Không tìm thấy địa điểm phù hợp</div>}
        </div>
      </div>
      <BottomNav active="Bản đồ" go={go} />
    </div>
  );
}
