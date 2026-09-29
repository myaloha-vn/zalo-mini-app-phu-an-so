import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BottomNav, Icon, Tap, Topbar, type Screen } from "./ui";
import { KP_SHAPES, POIS, WARD_BOUNDARY, type Poi } from "./mapData";

/* ------------------------------------------------------------------
   BẢN ĐỒ SỐ PHÚ AN — bố cục theo bản đồ số trên chinhquyenso.vn:
   bộ lọc loại địa điểm → tìm kiếm + danh sách → bản đồ (ranh giới phường,
   ranh giới 15 khu phố, ghim địa điểm).
   Nền bản đồ: Esri World Street Map (cần ghi nguồn; dùng chính thức cần
   tài khoản/điều khoản ArcGIS phù hợp).
------------------------------------------------------------------- */

type Cat = { key: string; label: string; color: string };
const CATS: Cat[] = [
  { key: "hanh-chinh", label: "Hành chính", color: "#1f6fb2" },
  { key: "cong-so", label: "Công sở – văn hoá", color: "#0f766e" },
  { key: "truong-hoc", label: "Trường học", color: "#3aa655" },
  { key: "y-te", label: "Y tế", color: "#e0452b" },
  { key: "ton-giao", label: "Tín ngưỡng", color: "#7c3aed" },
  { key: "di-tich", label: "Di tích – du lịch", color: "#f08c00" },
  { key: "tien-ich", label: "Tiện ích – giao lộ", color: "#38b2e0" },
];
const catOf = (k: string) => CATS.find((c) => c.key === k) ?? CATS[0];
const TAG_ICON: Record<string, string> = { "hanh-chinh": "🏛️", "cong-so": "🏢", "truong-hoc": "🎓", "y-te": "⚕️", "ton-giao": "🛕", "di-tich": "📍", "tien-ich": "🛒" };

function pinIcon(p: Poi, active: boolean) {
  const c = catOf(p.cat);
  return L.divIcon({
    className: "ms-pin-wrap",
    html: `<div class="ms-pin${active ? " on" : ""}" style="--c:${c.color}"><span>${p.emoji}</span></div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38],
  });
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
function popupHtml(p: Poi) {
  const c = catOf(p.cat);
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  return `<div class="ms-pop">
    <b>${esc(p.name)}</b>
    <small>${esc(p.address)}</small>
    <span class="ms-tag" style="color:${c.color};background:${c.color}1a">${TAG_ICON[p.cat] ?? ""} ${c.label}</span>
    <a class="ms-dir" href="${dir}" target="_blank" rel="noreferrer">Chỉ đường</a>
  </div>`;
}

export default function MapSoScreen({ go }: { go: (s: Screen) => void }) {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Poi | null>(null);
  const [full, setFull] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<Poi, L.Marker>());
  const homeBounds = useRef<L.LatLngBounds | null>(null);

  const q = query.trim().toLowerCase();
  const items = useMemo(() => POIS.filter((p) =>
    (cat === "all" || p.cat === cat) &&
    (!q || `${p.name} ${p.kp} khu phố ${p.kp} ${p.address}`.toLowerCase().includes(q))
  ), [cat, q]);

  // Khởi tạo bản đồ: nền, ranh giới phường, ranh giới + nhãn 15 khu phố
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const map = L.map(boxRef.current, { zoomControl: true });
    map.attributionControl.setPrefix(false);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles © Esri",
    }).addTo(map);

    KP_SHAPES.forEach((k) => {
      const poly = L.polygon(k.polygon, { color: "#2f7fd0", weight: 1.5, fillColor: "#5aa0e6", fillOpacity: 0.08 }).addTo(map);
      poly.bindTooltip(k.name, { permanent: true, direction: "center", className: "ms-kp-label" });
      poly.bindPopup(`<div class="ms-pop"><b>Khu phố ${esc(k.name)}</b><small>${k.population.toLocaleString("vi-VN")} nhân khẩu · ${k.households.toLocaleString("vi-VN")} hộ · ${k.area.toLocaleString("vi-VN")} km²</small></div>`);
      poly.on("mouseover", () => poly.setStyle({ fillOpacity: 0.2 }));
      poly.on("mouseout", () => poly.setStyle({ fillOpacity: 0.08 }));
    });
    const ward = L.polygon(WARD_BOUNDARY, { color: "#0b4f8a", weight: 3, fill: false, dashArray: "6 4", interactive: false }).addTo(map);
    homeBounds.current = ward.getBounds();
    map.fitBounds(homeBounds.current, { padding: [10, 10] });

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Ghim theo bộ lọc
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markers.current.clear();
    items.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: pinIcon(p, p === selected), title: p.name, zIndexOffset: p === selected ? 1000 : 0 })
        .bindPopup(popupHtml(p))
        .on("click", () => setSelected(p))
        .addTo(layer);
      markers.current.set(p, m);
    });
    if (selected && markers.current.has(selected)) markers.current.get(selected)!.openPopup();
  }, [items, selected]);

  useEffect(() => { setTimeout(() => mapRef.current?.invalidateSize(), 80); }, [full]);

  const focus = (p: Poi) => {
    setSelected(p);
    boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    mapRef.current?.flyTo([p.lat, p.lng], 17, { duration: 0.6 });
  };
  const reset = () => {
    setCat("all"); setQuery(""); setSelected(null);
    mapRef.current?.closePopup();
    if (homeBounds.current) mapRef.current?.fitBounds(homeBounds.current, { padding: [10, 10] });
  };
  const pickCat = (k: string) => { setCat(k); setSelected(null); mapRef.current?.closePopup(); };

  return (
    <div className="screen ms-screen">
      <Topbar title="Bản đồ số Phú An" onBack={() => go("home")} />
      <div className="ms-body">
        <div className="ms-card">
          <div className="ms-chips">
            <Tap className={`ms-chip ${cat === "all" ? "on" : ""}`} onClick={() => pickCat("all")}><i style={{ background: "#9aa9b6" }} />Tất cả</Tap>
            {CATS.map((c) => (
              <Tap key={c.key} className={`ms-chip ${cat === c.key ? "on" : ""}`} onClick={() => pickCat(c.key)}>
                <i style={{ background: c.color }} />{c.label}
              </Tap>
            ))}
          </div>
          <Tap className="ms-reset" onClick={reset}>↺ Đặt lại bản đồ</Tap>
        </div>

        <div className="ms-search">
          <span>🔍</span>
          <input value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); }} placeholder="Tìm địa điểm, khu phố..." />
        </div>
        <div className="ms-count">{items.length} địa điểm</div>
        <div className="ms-list">
          {items.map((p) => {
            const c = catOf(p.cat);
            return (
              <Tap key={p.name + p.lat} className={`ms-item ${selected === p ? "on" : ""}`} onClick={() => focus(p)}>
                <span className="ms-item-pin">📍</span>
                <div className="ms-item-copy">
                  <div className="ms-item-name">{p.name}{p.grade && <em className="ms-grade">{p.grade}</em>}</div>
                  <div className="ms-item-addr">{p.address}</div>
                  {p.accuracy && <div className="ms-verified">📌 {p.accuracy}</div>}
                  <span className="ms-tag" style={{ color: c.color, background: c.color + "1a" }}>{TAG_ICON[p.cat]} {c.label}</span>
                </div>
              </Tap>
            );
          })}
          {!items.length && <div className="kp-empty"><Icon name="search" size={26} />Không tìm thấy địa điểm phù hợp</div>}
        </div>

        <div className={`ms-map-box ${full ? "full" : ""}`}>
          <div ref={boxRef} className="ms-map" />
          <Tap className="ms-full-btn" onClick={() => setFull(!full)}>{full ? "✕ Thu nhỏ" : "⛶ Toàn màn hình"}</Tap>
        </div>
      </div>
      <BottomNav active="Bản đồ" go={go} />
    </div>
  );
}
