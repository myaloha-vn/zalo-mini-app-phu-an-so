import { useMemo, useRef, useState } from "react";
import { Icon, Tap, deepLink, DVC_SUBMENU, type Screen } from "./ui";
import type { NewsItem } from "./news";
import { WARD_NAMES } from "./wardNames";
import { PLACES } from "./DuLich";
import { POLICIES, PROGRAMS } from "./AnSinh";

/* Tìm kiếm toàn app: chức năng, khu phố, tin tức, chính sách an sinh, điểm du lịch.
   Không phân biệt dấu (gõ "tan an 5" vẫn ra "Tân An 5"). */

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

type Hit = { group: string; title: string; sub?: string; keywords?: string; run: () => void };

const SUGGEST = ["Khu phố Tân An 5", "Phản ánh", "Nộp hồ sơ", "Người cao tuổi", "Đình làng", "Quy hoạch"];

export default function HomeSearch({ go, news, openArticle }: { go: (s: Screen) => void; news: NewsItem[]; openArticle: (n: NewsItem) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<Hit[]>(() => {
    const open = (url: string) => () => window.open(url, "_blank", "noopener");
    const dvc = DVC_SUBMENU.flatMap((g) => g.items);
    return [
      { group: "Chức năng", title: "Khu phố số", sub: "Danh sách 15 khu phố, tin tức, phản ánh", keywords: "khu pho so", run: () => go("khupho") },
      { group: "Chức năng", title: "Bản đồ số Phú An", sub: "Bản đồ các khu phố", keywords: "ban do map", run: () => go("bando") },
      { group: "Chức năng", title: "Tra cứu quy hoạch", sub: "Bản đồ quy hoạch đô thị", keywords: "quy hoach ban do dat dai", run: () => go("map") },
      { group: "Chức năng", title: "An sinh xã hội", sub: "Chính sách và chương trình hỗ trợ", keywords: "an sinh tro cap ho tro chinh sach", run: () => go("social") },
      { group: "Chức năng", title: "Du lịch Phú An", sub: "Điểm đến, hành trình gợi ý", keywords: "du lich tham quan", run: () => go("dulich") },
      { group: "Chức năng", title: "Giới thiệu phường", sub: "Thông tin chung về phường Phú An", keywords: "gioi thieu phuong", run: () => go("gioithieu") },
      { group: "Chức năng", title: "Gửi phản ánh kiến nghị", sub: "Phản ánh sự việc tới chính quyền", keywords: "phan anh kien nghi gop y khieu nai", run: () => go("phananh") },
      { group: "Chức năng", title: "Theo dõi phản ánh", sub: "Xem tiến độ phản ánh đã gửi", keywords: "phan anh tien do", run: () => go("phananh:track") },
      { group: "Chức năng", title: "Thông báo", sub: "Tin mới và phản ánh chờ xử lý", keywords: "thong bao", run: () => go("thongbao") },
      { group: "Chức năng", title: "Thông tin cá nhân", sub: "Họ tên, số điện thoại", keywords: "ca nhan tai khoan", run: () => go("canhan") },
      ...dvc.map((it) => ({ group: "Dịch vụ công", title: it.label, sub: "Cổng Dịch vụ công quốc gia", keywords: "dich vu cong ho so thu tuc", run: it.url ? open(it.url) : () => {} })),
      ...WARD_NAMES.map((n, i) => ({ group: "Khu phố", title: n, sub: "Xem chi tiết khu phố", run: () => { deepLink.ward = i + 1; go("khupho"); } })),
      ...news.map((n) => ({ group: "Tin tức", title: n.title, sub: `${n.date} · ${n.scope ?? n.category}`, keywords: `${n.category} ${n.summary}`, run: () => openArticle(n) })),
      ...POLICIES.map((p) => ({ group: "An sinh xã hội", title: p.title, sub: p.audience, keywords: `${p.group} ${p.desc}`, run: () => { deepLink.policy = p.title; go("social"); } })),
      ...PROGRAMS.map((p) => ({ group: "An sinh xã hội", title: p.title, sub: `${p.time} · ${p.place}`, keywords: `${p.group} ${p.desc} ${p.audience}`, run: () => { deepLink.policy = p.title; go("social"); } })),
      ...PLACES.map((p) => ({ group: "Du lịch", title: p.name, sub: `${p.ward} · ${p.cat}`, keywords: p.intro, run: () => { deepLink.place = p.id; go("dulich"); } })),
    ];
  }, [go, news, openArticle]);

  const q = norm(query);
  const words = q.split(/\s+/).filter(Boolean);
  const results = useMemo(() => {
    if (!words.length) return [];
    const text = (h: Hit) => `${norm(h.title)} ${norm(h.sub ?? "")} ${norm(h.keywords ?? "")}`;
    // Ưu tiên khớp nguyên cụm; nếu không có kết quả nào mới khớp từng từ
    const phrase = index.some((h) => text(h).includes(q));
    return index
      .map((h) => {
        const title = norm(h.title);
        const all = text(h);
        if (phrase ? !all.includes(q) : !words.every((w) => all.includes(w))) return null;
        const score = (title.includes(q) ? 0 : 1) + (words.every((w) => title.includes(w)) ? 0 : 1);
        return { h, score };
      })
      .filter((x): x is { h: Hit; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.h);
  }, [index, q]);

  const groups = [...new Set(results.map((r) => r.group))];
  const open = focused || words.length > 0;
  const close = () => { setQuery(""); setFocused(false); inputRef.current?.blur(); };
  const run = (r: Hit) => { close(); r.run(); };

  return (
    <div className={`hs-wrap ${open ? "open" : ""}`}>
      {open && <div className="hs-backdrop" onClick={close} />}
      <div className="search-bar hs-bar">
        <Icon name="search" size={19} color="#7890A6" />
        <input ref={inputRef} value={query} onFocus={() => setFocused(true)} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm dịch vụ, thông tin..." />
        {query && <Tap className="sr-clear" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>×</Tap>}
      </div>
      {open && (
        <div className="hs-panel">
          {!words.length && (
            <>
              <div className="sr-label">Gợi ý tìm kiếm</div>
              <div className="sr-suggest">
                {SUGGEST.map((s) => <Tap key={s} className="sr-chip" onClick={() => { setQuery(s); inputRef.current?.focus(); }}>{s}</Tap>)}
              </div>
            </>
          )}
          {words.length > 0 && !results.length && (
            <div className="kp-empty"><Icon name="search" size={26} />Không tìm thấy kết quả cho “{query.trim()}”</div>
          )}
          {groups.map((g) => (
            <div key={g} className="sr-group">
              <div className="sr-label">{g} <span>{results.filter((r) => r.group === g).length}</span></div>
              {results.filter((r) => r.group === g).slice(0, 6).map((r) => (
                <Tap key={g + r.title} className="sr-item" onClick={() => run(r)}>
                  <div className="sr-item-copy">
                    <b>{r.title}</b>
                    {r.sub && <small>{r.sub}</small>}
                  </div>
                  <Icon name="arrow" size={14} color="#9aabb9" />
                </Tap>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
