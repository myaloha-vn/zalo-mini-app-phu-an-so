import { useState, type ReactNode } from "react";
import { Icon, Tap, DuotoneIcon, BottomNav, Topbar, type Screen, type IconName } from "./ui";

/* ---------------- Dữ liệu mẫu (thay bằng dữ liệu thật của phường) ---------------- */

const CATS = ["Sinh thái", "Văn hóa", "Lịch sử", "Vui chơi", "Gia đình"] as const;
type Cat = (typeof CATS)[number];
const CAT_STYLE: Record<Cat, { color: string; ink: string; icon: IconName }> = {
  "Sinh thái": { color: "green", ink: "#289c73", icon: "leaf" },
  "Văn hóa": { color: "orange", ink: "#e07f2c", icon: "temple" },
  "Lịch sử": { color: "red", ink: "#d64b4b", icon: "flag" },
  "Vui chơi": { color: "purple", ink: "#835ad4", icon: "ticket" },
  "Gia đình": { color: "blue", ink: "#1677d2", icon: "people" },
};

type Place = { id: number; name: string; ward: string; cat: Cat; x: number; y: number; intro: string; exps: [string, string][] };

const PLACES: Place[] = [
  { id: 1, name: "Công viên ven sông Phú An", ward: "Khu phố Tân An 5", cat: "Sinh thái", x: 205, y: 186, intro: "Không gian xanh dọc bờ sông với đường đi bộ, đường đạp xe và bãi cỏ dã ngoại.", exps: [["Đi bộ, chạy bộ ven sông", "45 phút"], ["Đạp xe dọc bờ sông", "60 phút"], ["Dã ngoại bãi cỏ", "90 phút"], ["Ngắm hoàng hôn", "30 phút"]] },
  { id: 2, name: "Vườn trái cây sinh thái", ward: "Khu phố An Thuận", cat: "Sinh thái", x: 300, y: 228, intro: "Nhà vườn mở cửa đón khách tham quan, hái và thưởng thức trái cây theo mùa.", exps: [["Hái trái cây tại vườn", "60 phút"], ["Thưởng thức đặc sản vườn", "30 phút"], ["Tìm hiểu kỹ thuật trồng cây", "30 phút"]] },
  { id: 3, name: "Đình làng Phú An", ward: "Khu phố Tân An 8", cat: "Văn hóa", x: 150, y: 110, intro: "Công trình tín ngưỡng của cộng đồng, nơi diễn ra các lễ hội truyền thống hằng năm.", exps: [["Tham quan kiến trúc đình", "30 phút"], ["Tìm hiểu lễ hội truyền thống", "30 phút"], ["Nghe thuyết minh lịch sử", "20 phút"]] },
  { id: 4, name: "Làng nghề thủ công", ward: "Khu phố Hiệp An 4", cat: "Văn hóa", x: 252, y: 96, intro: "Các hộ làm nghề thủ công truyền thống, du khách có thể xem và tự tay làm sản phẩm.", exps: [["Xem nghệ nhân làm nghề", "30 phút"], ["Tự tay làm sản phẩm", "60 phút"], ["Mua sản phẩm lưu niệm", "20 phút"], ["Chụp ảnh không gian làng nghề", "20 phút"]] },
  { id: 5, name: "Nhà truyền thống phường", ward: "Khu phố Tân An 1", cat: "Lịch sử", x: 108, y: 160, intro: "Nơi lưu giữ hình ảnh, hiện vật về quá trình hình thành và phát triển của địa phương.", exps: [["Tham quan phòng trưng bày", "45 phút"], ["Nghe kể chuyện truyền thống", "30 phút"]] },
  { id: 6, name: "Đài tưởng niệm", ward: "Khu phố Hiệp An 3", cat: "Lịch sử", x: 188, y: 72, intro: "Công trình tưởng nhớ các anh hùng liệt sĩ, điểm giáo dục truyền thống cho thế hệ trẻ.", exps: [["Dâng hương tưởng niệm", "20 phút"], ["Sinh hoạt giáo dục truyền thống", "40 phút"]] },
  { id: 7, name: "Khu vui chơi thể thao", ward: "Khu phố Hiệp An 5", cat: "Vui chơi", x: 308, y: 148, intro: "Tổ hợp sân thể thao, khu trò chơi vận động và không gian sự kiện cuối tuần.", exps: [["Chơi cầu lông, bóng đá mini", "60 phút"], ["Trò chơi vận động", "45 phút"], ["Sự kiện cuối tuần", "90 phút"], ["Leo tường cho thiếu niên", "30 phút"], ["Cà phê thư giãn", "30 phút"]] },
  { id: 8, name: "Công viên thiếu nhi", ward: "Khu phố Tân An 3", cat: "Gia đình", x: 92, y: 222, intro: "Sân chơi an toàn cho trẻ em với khu cát, cầu trượt và thảm cỏ cho cả gia đình.", exps: [["Khu vui chơi trẻ em", "60 phút"], ["Góc đọc sách ngoài trời", "30 phút"], ["Dã ngoại gia đình", "60 phút"]] },
  { id: 9, name: "Phố ẩm thực Phú An", ward: "Khu phố Hiệp An 1", cat: "Gia đình", x: 238, y: 246, intro: "Tuyến phố tập trung các món ăn địa phương, sôi động nhất vào buổi chiều tối.", exps: [["Thưởng thức món địa phương", "60 phút"], ["Chợ đêm cuối tuần", "60 phút"], ["Nhạc sống đường phố", "45 phút"]] },
  { id: 10, name: "Hồ sinh thái Phú An", ward: "Khu phố Tân An 7", cat: "Sinh thái", x: 78, y: 104, intro: "Hồ nước rộng bao quanh bởi hàng cây xanh, lý tưởng để tản bộ buổi sáng.", exps: [["Tản bộ quanh hồ", "45 phút"], ["Ngắm bình minh", "30 phút"], ["Chụp ảnh thiên nhiên", "30 phút"]] },
];
const P = (id: number) => PLACES.find((p) => p.id === id)!;

type Stop = { place: number; time: string; activity: string; duration: string };
type Tour = { id: number; name: string; intro: string; cat: Cat; duration: string; distance: string; audience: string; level: string; bestTime: string; stops: Stop[] };

const TOURS: Tour[] = [
  {
    id: 1, name: "Hành trình khám phá sinh thái Phú An", cat: "Sinh thái",
    intro: "Bắt đầu ngày mới giữa không gian xanh: tản bộ quanh hồ, đạp xe ven sông, hái trái cây tại vườn và kết thúc bằng bữa ăn đặc sản.",
    duration: "4,5 giờ", distance: "8 km", audience: "Gia đình, nhóm bạn", level: "Dễ", bestTime: "Sáng sớm, 06:30 – 11:00",
    stops: [
      { place: 10, time: "06:30", activity: "Tản bộ quanh hồ, ngắm bình minh và chụp ảnh.", duration: "60 phút" },
      { place: 1, time: "07:45", activity: "Đạp xe dọc bờ sông, nghỉ chân tại bãi cỏ.", duration: "60 phút" },
      { place: 2, time: "09:00", activity: "Tham quan nhà vườn, tự tay hái trái cây theo mùa.", duration: "90 phút" },
      { place: 9, time: "10:45", activity: "Thưởng thức món ăn địa phương trước khi kết thúc.", duration: "45 phút" },
    ],
  },
  {
    id: 2, name: "Hành trình văn hóa – lịch sử Phú An", cat: "Lịch sử",
    intro: "Tìm hiểu quá trình hình thành địa phương, tưởng nhớ các anh hùng liệt sĩ và trải nghiệm nghề thủ công truyền thống.",
    duration: "4 giờ", distance: "5,5 km", audience: "Học sinh, người lớn tuổi", level: "Dễ", bestTime: "Buổi sáng, 08:00 – 12:00",
    stops: [
      { place: 5, time: "08:00", activity: "Tham quan phòng trưng bày, nghe kể chuyện truyền thống.", duration: "60 phút" },
      { place: 6, time: "09:15", activity: "Dâng hương tưởng niệm, sinh hoạt giáo dục truyền thống.", duration: "30 phút" },
      { place: 3, time: "10:00", activity: "Tham quan kiến trúc đình, tìm hiểu lễ hội truyền thống.", duration: "45 phút" },
      { place: 4, time: "11:00", activity: "Xem nghệ nhân làm nghề và tự tay làm sản phẩm.", duration: "60 phút" },
    ],
  },
  {
    id: 3, name: "Chiều cuối tuần vui chơi cùng gia đình", cat: "Gia đình",
    intro: "Lịch trình nhẹ nhàng cho gia đình có trẻ nhỏ: sân chơi, thể thao, hoàng hôn ven sông và phố ẩm thực buổi tối.",
    duration: "6 giờ", distance: "9 km", audience: "Gia đình có trẻ nhỏ", level: "Trung bình", bestTime: "Cuối tuần, 14:00 – 20:00",
    stops: [
      { place: 8, time: "14:00", activity: "Cho bé vui chơi tại sân chơi và góc đọc sách.", duration: "75 phút" },
      { place: 7, time: "15:30", activity: "Trò chơi vận động, thể thao cho cả gia đình.", duration: "90 phút" },
      { place: 1, time: "17:15", activity: "Dạo bộ ven sông, ngắm hoàng hôn.", duration: "60 phút" },
      { place: 9, time: "18:30", activity: "Ăn tối và dạo chợ đêm cuối tuần.", duration: "90 phút" },
    ],
  },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

/* ---------------- Thành phần dùng chung ---------------- */

function Cover({ cat, big = false, children }: { cat: Cat; big?: boolean; children?: ReactNode }) {
  const st = CAT_STYLE[cat];
  return (
    <div className={`as-prog-img ${st.color} ${big ? "dl-cover-big" : ""}`}>
      <div className="as-prog-sun" />
      <div className="as-prog-hill" />
      <div className="as-prog-icon"><Icon name={st.icon} size={big ? 40 : 30} color="#fff" /></div>
      {children}
    </div>
  );
}

function CatTag({ cat, className = "" }: { cat: Cat; className?: string }) {
  return <span className={`category ${CAT_STYLE[cat].color} ${className}`}>{cat}</span>;
}

const BOUNDARY = "M42 62C72 26 150 16 212 28s120 2 145 44 14 98-8 146-78 66-150 60S72 284 44 232 20 102 42 62Z";

function ExploreMap({ places, selected, onSelect, route, zoomTo, activeStep, height = 250 }: {
  places?: Place[]; selected?: number; onSelect?: (id: number) => void; route?: Place[]; zoomTo?: Place; activeStep?: number; height?: number;
}) {
  const vb = zoomTo ? `${zoomTo.x - 110} ${zoomTo.y - 70} 220 140` : "0 0 390 300";
  const line = route?.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join("");
  return (
    <div className="kp-map dl-map" style={{ height }}>
      <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" aria-label="Bản đồ khám phá Phú An">
        <rect x="-80" y="-80" width="550" height="460" fill="#EEF3EC" />
        <path d={BOUNDARY} fill="#E3F0DF" stroke="#1677d2" strokeWidth="2" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
        <path d="M30 140h330M200 20v270M60 250 330 80" stroke="#fff" strokeWidth="6" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M-10 205C80 172 140 232 222 196s120-70 190-54" fill="none" stroke="#fff" strokeWidth="10" vectorEffect="non-scaling-stroke" />
        <path d="M-10 205C80 172 140 232 222 196s120-70 190-54" fill="none" stroke="#8DBFE0" strokeWidth="4" vectorEffect="non-scaling-stroke" />
        {!zoomTo && <text x="200" y="152" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2c5a7e" opacity=".55" fontFamily="Inter, sans-serif" letterSpacing="1.5">PHƯỜNG PHÚ AN</text>}
        {line && <>
          <path d={line} fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={line} fill="none" stroke="#1677d2" strokeWidth="3" strokeDasharray="7 5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </>}
        {route
          ? route.map((p, i) => {
              const on = activeStep === undefined || activeStep === i;
              return (
                <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
                  <circle r={on && activeStep !== undefined ? 15 : 12} fill={on ? "#1677d2" : "#9db6cc"} stroke="#fff" strokeWidth="3" />
                  <text y="4.3" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">{i + 1}</text>
                </g>
              );
            })
          : (places ?? []).map((p) => {
              const st = CAT_STYLE[p.cat];
              const sel = p.id === selected;
              return (
                <g key={p.id} transform={`translate(${p.x} ${p.y})`} style={{ cursor: onSelect ? "pointer" : undefined }} onClick={() => onSelect?.(p.id)}>
                  {sel && <circle r="20" fill={st.ink} opacity=".18" />}
                  <path d="M0 14C-8 5-12 0-12-6a12 12 0 0 1 24 0c0 6-4 11-12 20Z" transform="translate(0 -8)" fill={st.ink} stroke="#fff" strokeWidth="2.2" />
                  <g transform="translate(-7 -21)" pointerEvents="none"><Icon name={st.icon} size={14} color="#fff" /></g>
                  {onSelect && <circle className="dl-hit" cy="-10" r="18" fill="#000" opacity="0" />}
                </g>
              );
            })}
      </svg>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return <div className="dl-toast"><Icon name="check" size={16} color="#fff" />{text}</div>;
}

/* ---------------- Thẻ điểm đến & hành trình ---------------- */

function PlaceCard({ p, onOpen, wide = false }: { p: Place; onOpen: () => void; wide?: boolean }) {
  return (
    <div className={`as-prog ${wide ? "wide" : ""}`}>
      <Cover cat={p.cat}><CatTag cat={p.cat} className="as-prog-tag" /></Cover>
      <div className="as-prog-body">
        <div className="as-prog-title">{p.name}</div>
        <div className="as-prog-row"><Icon name="location" size={13} />{p.ward}, phường Phú An</div>
        <div className="as-prog-row"><Icon name="star" size={13} />{p.exps.length} trải nghiệm</div>
        <Tap className="kp-btn solid as-prog-btn" onClick={onOpen}><Icon name="compass" size={15} />Khám phá</Tap>
      </div>
    </div>
  );
}

function TourCard({ t, onOpen }: { t: Tour; onOpen: () => void }) {
  return (
    <div className="as-prog wide">
      <Cover cat={t.cat}><span className="dl-cover-chip"><Icon name="route" size={12} />{t.stops.length} điểm đến</span></Cover>
      <div className="as-prog-body">
        <div className="as-prog-title">{t.name}</div>
        <div className="dl-tour-intro">{t.intro}</div>
        <div className="dl-tour-meta">
          <span><Icon name="clock" size={13} />{t.duration}</span>
          <span><Icon name="location" size={13} />{t.stops.length} điểm</span>
          <span><Icon name="people" size={13} />{t.audience}</span>
        </div>
        <Tap className="kp-btn solid as-prog-btn" onClick={onOpen}>Xem hành trình<Icon name="arrow" size={14} /></Tap>
      </div>
    </div>
  );
}

/* ---------------- Màn hình ---------------- */

type View = { name: "explore" } | { name: "places" } | { name: "place"; id: number } | { name: "tour"; id: number };

function ExploreScreen({ go, open, tab, setTab }: { go: (s: Screen) => void; open: (v: View) => void; tab: "mood" | "tours"; setTab: (t: "mood" | "tours") => void }) {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<"Tất cả" | Cat>("Tất cả");
  const [mapCats, setMapCats] = useState<Cat[]>([...CATS]);
  const [picked, setPicked] = useState<number | undefined>(1);

  const q = norm(query);
  const places = PLACES.filter((p) => (mood === "Tất cả" || p.cat === mood) && (!q || norm(`${p.name} ${p.ward} ${p.cat} ${p.exps.map((e) => e[0]).join(" ")}`).includes(q)));
  const mapPlaces = PLACES.filter((p) => mapCats.includes(p.cat));
  const pick = picked ? P(picked) : undefined;
  const totalExp = PLACES.reduce((s, p) => s + p.exps.length, 0);
  const toggleCat = (c: Cat) => {
    const next = mapCats.includes(c) ? mapCats.filter((x) => x !== c) : [...mapCats, c];
    setMapCats(next);
    if (pick && !next.includes(pick.cat)) setPicked(undefined);
  };

  return (
    <div className="screen social-screen">
      <Topbar title="Du lịch Phú An" onBack={() => go("home")} end={<Icon name="bell" />} />
      <div className="kp-body">
        <div className="kp-hero dl-hero">
          <div className="kp-hero-title">Khám phá Phú An</div>
          <div className="dl-hero-text">Điểm đến xanh, văn hoá đậm đà và những hành trình trọn vẹn ngay trong lòng phường.</div>
          <div className="kp-hero-deco" aria-hidden="true"><Icon name="compass" size={62} color="rgba(22,119,210,.14)" /></div>
        </div>

        <div className="kp-search dl-search">
          <Icon name="search" size={18} color="#7890A6" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm điểm đến, địa danh, trải nghiệm..." />
          {query && <Tap className="kp-clear" onClick={() => setQuery("")}>×</Tap>}
        </div>

        <div className="dl-stats">
          <div className="dl-stat"><DuotoneIcon icon="location" color="blue" small /><b>{PLACES.length}</b><span>Điểm đến</span></div>
          <div className="dl-stat"><DuotoneIcon icon="star" color="orange" small /><b>{totalExp}</b><span>Trải nghiệm</span></div>
          <div className="dl-stat"><DuotoneIcon icon="route" color="green" small /><b>{TOURS.length}</b><span>Hành trình gợi ý</span></div>
        </div>

        <div className="kp-toggle dl-tabs">
          <Tap className={tab === "mood" ? "on" : ""} onClick={() => setTab("mood")}><Icon name="compass" size={16} />Khám phá điểm đến</Tap>
          <Tap className={tab === "tours" ? "on" : ""} onClick={() => setTab("tours")}><Icon name="route" size={16} />Gợi ý hành trình</Tap>
        </div>

        {tab === "mood" ? (
          <>
            <div className="chips dl-chips">
              {(["Tất cả", ...CATS] as const).map((c) => <Tap key={c} className={`chip ${mood === c ? "selected" : ""}`} onClick={() => setMood(c)}>{c}</Tap>)}
            </div>

            <div className="section-heading"><span>Điểm đến nổi bật</span><Tap className="view-all" onClick={() => open({ name: "places" })}>Xem tất cả <Icon name="arrow" size={13} /></Tap></div>
            {places.length > 0 ? (
              <div className="as-prog-scroll">{places.map((p) => <PlaceCard key={p.id} p={p} onOpen={() => open({ name: "place", id: p.id })} />)}</div>
            ) : (
              <div className="kp-empty"><Icon name="search" size={26} />Không tìm thấy điểm đến phù hợp</div>
            )}

            <div className="section-heading"><span>Bản đồ khám phá Phú An</span></div>
            <div className="dl-map-filter">
              {CATS.map((c) => (
                <Tap key={c} className={`dl-mf ${mapCats.includes(c) ? "on" : ""}`} onClick={() => toggleCat(c)}>
                  <i style={{ background: CAT_STYLE[c].ink }} />{c}
                </Tap>
              ))}
            </div>
            <ExploreMap places={mapPlaces} selected={picked} onSelect={setPicked} />
            {pick ? (
              <div className="dl-quick">
                <div className="dl-quick-thumb"><Cover cat={pick.cat} /></div>
                <div className="dl-quick-copy">
                  <CatTag cat={pick.cat} />
                  <div className="dl-quick-name">{pick.name}</div>
                  <div className="dl-quick-sub"><Icon name="location" size={12} />{pick.ward} · {pick.exps.length} trải nghiệm</div>
                  <div className="dl-quick-exps">{pick.exps.slice(0, 2).map((e) => <span key={e[0]}>{e[0]}</span>)}</div>
                </div>
                <Tap className="dl-quick-go" onClick={() => open({ name: "place", id: pick.id })}><Icon name="arrow" size={18} /></Tap>
              </div>
            ) : (
              <div className="result-box"><div className="result-icon"><Icon name="location" size={20} /></div><div><div className="result-title">Chọn một điểm trên bản đồ</div><div className="result-text">Chạm vào biểu tượng để xem nhanh địa điểm và trải nghiệm.</div></div></div>
            )}
          </>
        ) : (
          <>
            <div className="policy-count"><span>Hành trình gợi ý</span><small>{TOURS.length} hành trình</small></div>
            <div className="as-prog-list">{TOURS.map((t) => <TourCard key={t.id} t={t} onOpen={() => open({ name: "tour", id: t.id })} />)}</div>
          </>
        )}
      </div>
      <BottomNav active="Trang chủ" go={go} />
    </div>
  );
}

function PlacesScreen({ go, open, back }: { go: (s: Screen) => void; open: (v: View) => void; back: () => void }) {
  const [cat, setCat] = useState<"Tất cả" | Cat>("Tất cả");
  const list = PLACES.filter((p) => cat === "Tất cả" || p.cat === cat);
  return (
    <div className="screen social-screen">
      <Topbar title="Tất cả điểm đến" onBack={back} end={<Icon name="search" />} />
      <div className="kp-body">
        <div className="chips dl-chips" style={{ marginTop: 0 }}>
          {(["Tất cả", ...CATS] as const).map((c) => <Tap key={c} className={`chip ${cat === c ? "selected" : ""}`} onClick={() => setCat(c)}>{c}</Tap>)}
        </div>
        <div className="policy-count"><span>Điểm đến</span><small>{list.length} địa điểm</small></div>
        <div className="as-prog-list">{list.map((p) => <PlaceCard key={p.id} p={p} wide onOpen={() => open({ name: "place", id: p.id })} />)}</div>
      </div>
      <BottomNav active="Trang chủ" go={go} />
    </div>
  );
}

function PlaceScreen({ place, go, open, back }: { place: Place; go: (s: Screen) => void; open: (v: View) => void; back: () => void }) {
  const tours = TOURS.filter((t) => t.stops.some((s) => s.place === place.id));
  return (
    <div className="screen social-screen">
      <Topbar title="Chi tiết điểm đến" onBack={back} end={<Icon name="share" />} />
      <div className="kp-body dl-detail">
        <div className="dl-cover-wrap"><Cover cat={place.cat} big /></div>
        <div className="dl-title-block">
          <div className="dl-badges"><CatTag cat={place.cat} /><span className="dl-ward"><Icon name="location" size={12} />{place.ward}</span></div>
          <div className="dl-title">{place.name}</div>
          <p className="dl-intro">{place.intro}</p>
        </div>

        <div className="section-heading"><span>Trải nghiệm ({place.exps.length})</span></div>
        <div className="kp-panel dl-exps">
          {place.exps.map(([name, time]) => (
            <div className="dl-exp" key={name}><DuotoneIcon icon={CAT_STYLE[place.cat].icon} color={CAT_STYLE[place.cat].color} small /><b>{name}</b><span><Icon name="clock" size={12} />{time}</span></div>
          ))}
        </div>

        <div className="section-heading"><span>Vị trí</span></div>
        <div className="kp-panel kp-map-card">
          <ExploreMap places={[place]} selected={place.id} zoomTo={place} height={150} />
          <Tap className="primary-button kp-map-btn"><Icon name="navigation" size={17} />Chỉ đường đến đây</Tap>
        </div>

        {tours.length > 0 && <>
          <div className="section-heading"><span>Có trong hành trình</span></div>
          <div className="news-list">
            {tours.map((t) => (
              <Tap className="news-item dl-mini-tour" key={t.id} onClick={() => open({ name: "tour", id: t.id })}>
                <DuotoneIcon icon="route" color={CAT_STYLE[t.cat].color} small />
                <div className="news-copy"><div className="news-title">{t.name}</div><div className="news-date"><Icon name="clock" size={12} />{t.duration} · {t.stops.length} điểm đến</div></div>
                <Icon name="arrow" size={16} color="#8CA0B2" />
              </Tap>
            ))}
          </div>
        </>}
      </div>
      <BottomNav active="Trang chủ" go={go} />
    </div>
  );
}

function TourScreen({ tour, go, open, back }: { tour: Tour; go: (s: Screen) => void; open: (v: View) => void; back: () => void }) {
  const [step, setStep] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const stops = tour.stops.map((s) => ({ ...s, p: P(s.place) }));
  const flash = (t: string) => { setToast(t); window.setTimeout(() => setToast(null), 2200); };

  const share = async () => {
    const text = `${tour.name} – ${tour.duration}, ${stops.length} điểm đến. Xem trên Phú An Số.`;
    try {
      if (navigator.share) { await navigator.share({ title: tour.name, text }); return; }
      await navigator.clipboard.writeText(text);
      flash("Đã sao chép thông tin hành trình");
    } catch { flash("Đã sao chép thông tin hành trình"); }
  };
  const startOrNext = () => {
    if (step === null) { setStep(0); flash(`Bắt đầu! Điểm 1: ${stops[0].p.name}`); return; }
    if (step < stops.length - 1) { setStep(step + 1); flash(`Điểm ${step + 2}: ${stops[step + 1].p.name}`); return; }
    setStep(null); flash("Hoàn thành hành trình. Cảm ơn bạn!");
  };

  const facts: [IconName, string, string][] = [
    ["clock", "Thời lượng", tour.duration], ["location", "Số điểm đến", `${stops.length} điểm`], ["route", "Quãng đường", tour.distance],
    ["people", "Phù hợp", tour.audience], ["star", "Mức độ", tour.level], ["calendar", "Thời gian đề xuất", tour.bestTime],
  ];

  return (
    <div className="screen social-screen">
      <Topbar title="Chi tiết hành trình" onBack={back} end={<Tap onClick={share}><Icon name="share" /></Tap>} />
      <div className="kp-body dl-detail dl-tour-body">
        <div className="dl-cover-wrap"><Cover cat={tour.cat} big><span className="dl-cover-chip"><Icon name="route" size={12} />Hành trình gợi ý</span></Cover></div>
        <div className="dl-title-block">
          <div className="dl-title">{tour.name}</div>
          <p className="dl-intro">{tour.intro}</p>
        </div>

        <div className="dl-facts">
          {facts.map(([icon, label, value]) => (
            <div className="dl-fact" key={label}><Icon name={icon} size={15} color="#1677d2" /><span>{label}</span><b>{value}</b></div>
          ))}
        </div>

        <div className="section-heading"><span>Bản đồ lộ trình</span><small className="dl-muted">{stops.map((_, i) => i + 1).join(" → ")}</small></div>
        <div className="kp-panel kp-map-card"><ExploreMap route={stops.map((s) => s.p)} activeStep={step ?? undefined} height={210} /></div>

        <div className="section-heading"><span>Lịch trình</span></div>
        <div className="dl-timeline">
          {stops.map((s, i) => (
            <div className={`dl-tl ${step === i ? "now" : ""} ${step !== null && i < step ? "done" : ""}`} key={s.place}>
              <div className="dl-tl-time">{s.time}</div>
              <div className="dl-tl-rail"><i>{i + 1}</i></div>
              <Tap className="dl-tl-card" onClick={() => open({ name: "place", id: s.p.id })}>
                <div className="dl-tl-thumb"><Cover cat={s.p.cat} /></div>
                <div className="dl-tl-copy">
                  <div className="dl-tl-name">{s.p.name}</div>
                  <div className="dl-tl-act">{s.activity}</div>
                  <div className="dl-tl-dur"><Icon name="clock" size={11} />{s.duration}</div>
                </div>
              </Tap>
            </div>
          ))}
        </div>

        <Tap className="kp-btn ghost as-all-btn" onClick={() => open({ name: "places" })}>Xem tất cả điểm đến<Icon name="arrow" size={14} /></Tap>
      </div>

      <div className="dl-action-bar">
        <Tap className="kp-btn ghost" onClick={share}><Icon name="share" size={15} />Chia sẻ</Tap>
        <Tap className="kp-btn solid" onClick={startOrNext}>
          <Icon name="navigation" size={15} />
          {step === null ? "Bắt đầu hành trình" : step < stops.length - 1 ? `Đang ở điểm ${step + 1}/${stops.length} · Tiếp theo` : "Hoàn thành hành trình"}
        </Tap>
      </div>
      {toast && <Toast text={toast} />}
      <BottomNav active="Trang chủ" go={go} />
    </div>
  );
}

/* ---------------- Module ---------------- */

export default function DuLichModule({ go }: { go: (s: Screen) => void }) {
  const [stack, setStack] = useState<View[]>([{ name: "explore" }]);
  const [tab, setTab] = useState<"mood" | "tours">("mood");
  const view = stack[stack.length - 1];
  const open = (v: View) => setStack([...stack, v]);
  const back = () => setStack(stack.length > 1 ? stack.slice(0, -1) : stack);

  if (view.name === "places") return <PlacesScreen go={go} open={open} back={back} />;
  if (view.name === "place") return <PlaceScreen key={`p${view.id}`} place={P(view.id)} go={go} open={open} back={back} />;
  if (view.name === "tour") return <TourScreen key={`t${view.id}`} tour={TOURS.find((t) => t.id === view.id)!} go={go} open={open} back={back} />;
  return <ExploreScreen go={go} open={open} tab={tab} setTab={setTab} />;
}
