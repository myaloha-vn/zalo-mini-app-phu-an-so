import { useRef, useState, type ChangeEvent, type ReactElement } from "react";
import { Icon, Tap, Topbar, type Screen } from "./ui";
import { WARDS, WardMap } from "./KhuPho";

/* ---------------- Gửi phản ánh kiến nghị ----------------
   Bản demo: chưa gửi lên máy chủ. Khi tích hợp:
   - Vị trí: dùng getLocation của zmp-sdk (cần xin quyền trên Zalo) thay cho navigator.geolocation.
   - Thông tin người phản ánh: lấy từ khai báo hộ gia đình / tài khoản Zalo đã xác thực.
   - Ảnh + nội dung: gửi qua API tiếp nhận phản ánh (ví dụ nền tảng Chinhquyenso). */

const CATEGORIES = [
  "Môi trường – vệ sinh",
  "Trật tự đô thị – lấn chiếm lòng lề đường",
  "An ninh trật tự",
  "Hạ tầng – giao thông",
  "Điện – chiếu sáng công cộng",
  "Cấp thoát nước – ngập úng",
  "Khác",
];

// Dữ liệu minh hoạ – thay bằng thông tin khai báo hộ gia đình của người dùng đã đăng nhập.
const DEMO_RESIDENT = { name: "Nguyễn Văn An", role: "Chủ hộ", phone: "0900 000 888", address: "12 Đường số 5", wardId: 8 };

const MAX_PHOTOS = 4;

function CameraIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/></svg>;
}
function PlusIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function PenIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/></svg>;
}

type Photo = { id: number; url: string };

export function PhanAnhForm({ go, initialWardId, onBack, backLabel }: { go: (s: Screen) => void; initialWardId?: number; onBack?: () => void; backLabel?: string }) {
  const back = onBack ?? (() => go("home"));
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [pickMap, setPickMap] = useState(false);
  const [wardId, setWardId] = useState(initialWardId ?? DEMO_RESIDENT.wardId);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [resident, setResident] = useState(DEMO_RESIDENT);
  const [editing, setEditing] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const ward = WARDS[wardId - 1];
  const errors = {
    category: !category,
    content: content.trim().length < 10,
    location: !location.trim(),
    photos: photos.length === 0,
    resident: !resident.name.trim() || !resident.phone.trim(),
  };
  const valid = !Object.values(errors).some(Boolean);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { flash("Thiết bị không hỗ trợ lấy vị trí"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocating(false); setLocation(`Vị trí hiện tại (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`); },
      () => { setLocating(false); flash("Không lấy được vị trí. Hãy bật định vị hoặc chọn trên bản đồ."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) flash(`Chỉ được gửi tối đa ${MAX_PHOTOS} ảnh`);
    setPhotos((p) => [...p, ...files.slice(0, room).map((f, i) => ({ id: Date.now() + i, url: URL.createObjectURL(f) }))]);
    e.target.value = "";
  };
  const removePhoto = (id: number) => setPhotos((p) => p.filter((x) => x.id !== id));

  const submit = () => {
    setTried(true);
    if (!valid) { flash("Vui lòng điền đủ các mục bắt buộc"); return; }
    const d = new Date();
    const code = `PA-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getTime()).slice(-4)}`;
    REPORTS.unshift({
      code, category, content: content.trim(), location: location.trim(), wardId, photos: photos.map((p) => p.url),
      reporter: { name: resident.name, phone: resident.phone, address: resident.address }, mine: true,
      status: "Đã tiếp nhận", createdAt: d, history: [{ at: d, status: "Đã tiếp nhận", note: `Hệ thống chuyển tới ${ward.name}` }],
    });
    setDone(code);
  };

  if (done) {
    return (
      <div className="screen pa-screen">
        <Topbar title="Gửi phản ánh" onBack={back} />
        <div className="pa-body pa-done">
          <div className="pa-done-icon"><Icon name="check" size={34} color="#fff" /></div>
          <h2>Đã gửi phản ánh</h2>
          <p>Phản ánh của bạn đã được chuyển tới <b>{ward.name}</b>. Trưởng khu phố <b>{ward.head}</b> sẽ tiếp nhận và xử lý.</p>
          <div className="pa-code"><span>Mã phản ánh</span><b>{done}</b></div>
          <p className="pa-muted">Bạn có thể xem tiến độ trong mục “Theo dõi phản ánh”. (Bản demo – phản ánh chưa được gửi lên hệ thống.)</p>
          <Tap className="pa-submit" onClick={back}>{backLabel ?? (onBack ? "Quay lại khu phố" : "Về trang chủ")}</Tap>
        </div>
      </div>
    );
  }

  const err = (k: keyof typeof errors, msg: string) => tried && errors[k] ? <div className="pa-error"><Icon name="alert" size={13} />{msg}</div> : null;

  return (
    <div className="screen pa-screen">
      <Topbar title="Gửi phản ánh" onBack={back} />
      <div className="pa-body">
        <section className="pa-card">
          <label className="pa-label">Loại phản ánh <i>*</i></label>
          <div className="pa-select">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={category ? "" : "placeholder"}>
              <option value="">-- Chọn loại phản ánh --</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {err("category", "Vui lòng chọn loại phản ánh")}
        </section>

        <section className="pa-card">
          <label className="pa-label">Nội dung phản ánh <i>*</i></label>
          <textarea className="pa-textarea" rows={5} maxLength={1000} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Mô tả chi tiết vấn đề bạn muốn phản ánh..." />
          <div className="pa-counter">{content.length}/1000</div>
          {err("content", "Nội dung cần ít nhất 10 ký tự")}
        </section>

        <section className="pa-card">
          <label className="pa-label">Địa điểm xảy ra sự việc <i>*</i></label>
          <div className="pa-input-icon">
            <Icon name="location" size={16} color="#1677d2" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nhấn «Vị trí hiện tại» hoặc «Chọn trên bản đồ»" />
          </div>
          <div className="pa-two">
            <Tap className="pa-soft" onClick={useCurrentLocation}><Icon name="navigation" size={15} />{locating ? "Đang lấy vị trí..." : "Vị trí hiện tại"}</Tap>
            <Tap className="pa-soft" onClick={() => setPickMap(true)}><Icon name="location" size={15} />Chọn trên bản đồ</Tap>
          </div>
          {err("location", "Vui lòng chọn địa điểm")}
        </section>

        <section className="pa-card">
          <label className="pa-label">Khu phố phát sinh phản ánh <i>*</i></label>
          <div className="pa-hint">Phản ánh sẽ được tự động chuyển tới khu phố bạn chọn để tiếp nhận và xử lý.</div>
          <div className="pa-select">
            <select value={wardId} onChange={(e) => setWardId(Number(e.target.value))}>
              {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          {initialWardId && wardId === initialWardId && wardId !== resident.wardId && <div className="pa-ok"><Icon name="check" size={13} />Đã chọn theo khu phố bạn đang xem. Nếu sự việc xảy ra ở khu phố khác, hãy chọn lại.</div>}
          {wardId === resident.wardId && <div className="pa-ok"><Icon name="check" size={13} />Tự điền theo khu phố bạn đã khai báo hộ gia đình. Nếu sự việc xảy ra ở khu phố khác, hãy chọn lại.</div>}
          <div className="pa-box">
            <div className="pa-box-title"><Icon name="people" size={14} />NƠI TIẾP NHẬN PHẢN ÁNH</div>
            <div className="pa-line"><Icon name="home" size={15} /><b>{ward.name}</b></div>
            <div className="pa-line"><Icon name="user" size={15} />Trưởng khu phố: <b>{ward.head}</b></div>
          </div>
        </section>

        <section className="pa-card">
          <label className="pa-label">Ảnh minh chứng <i>*</i> <span className="pa-sub">(bắt buộc ít nhất 01 ảnh, tối đa {MAX_PHOTOS} ảnh)</span></label>
          <div className="pa-hint">Ảnh giúp cán bộ xác minh nhanh và xử lý chính xác hiện trường.</div>
          <div className="pa-photos">
            {photos.map((p) => (
              <div className="pa-photo" key={p.id}>
                <img src={p.url} alt="Ảnh minh chứng" />
                <Tap className="pa-photo-x" onClick={() => removePhoto(p.id)}>✕</Tap>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <>
                <Tap className={`pa-add camera ${photos.length === 0 ? "need" : ""}`} onClick={() => cameraRef.current?.click()}><CameraIcon /><span>Chụp ảnh</span></Tap>
                <Tap className="pa-add" onClick={() => galleryRef.current?.click()}><PlusIcon /><span>Chọn ảnh</span></Tap>
              </>
            )}
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={addFiles} />
          <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
          {photos.length === 0 && <div className="pa-error"><Icon name="alert" size={13} />Chưa có ảnh minh chứng</div>}
        </section>

        <section className="pa-card">
          <div className="pa-head">
            <span className="pa-label" style={{ margin: 0 }}>Thông tin người phản ánh</span>
            <Tap className="pa-edit" onClick={() => setEditing(!editing)}><PenIcon />{editing ? "Xong" : "Sửa"}</Tap>
          </div>
          {editing ? (
            <div className="pa-form">
              <input value={resident.name} onChange={(e) => setResident({ ...resident, name: e.target.value })} placeholder="Họ và tên" />
              <input value={resident.phone} onChange={(e) => setResident({ ...resident, phone: e.target.value })} placeholder="Số điện thoại" inputMode="tel" />
              <input value={resident.address} onChange={(e) => setResident({ ...resident, address: e.target.value })} placeholder="Địa chỉ" />
            </div>
          ) : (
            <div className="pa-box">
              <div className="pa-box-title"><Icon name="check" size={14} />ĐÃ TỰ ĐIỀN TỪ KHAI BÁO HỘ GIA ĐÌNH</div>
              <div className="pa-line"><Icon name="user" size={15} /><b>{resident.name}</b><span className="pa-muted"> · {resident.role}</span></div>
              <div className="pa-line"><Icon name="phone" size={15} />{resident.phone}</div>
              <div className="pa-line"><Icon name="location" size={15} />{resident.address}</div>
              <div className="pa-line pa-sep"><Icon name="home" size={15} /><b>{WARDS[resident.wardId - 1].name}</b></div>
            </div>
          )}
          {err("resident", "Vui lòng nhập họ tên và số điện thoại")}
          <div className="pa-hint pa-privacy">Thông tin người phản ánh chỉ được dùng để cán bộ liên hệ xác minh và phản hồi kết quả xử lý, không công khai.</div>
        </section>

        <Tap className={`pa-submit ${valid ? "" : "off"}`} onClick={submit}>Gửi phản ánh</Tap>
      </div>

      {pickMap && (
        <div className="as-backdrop" onClick={() => setPickMap(false)}>
          <div className="as-sheet pa-map-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pa-head"><span className="pa-label" style={{ margin: 0 }}>Chọn khu vực trên bản đồ</span><Tap className="as-close" onClick={() => setPickMap(false)}>✕</Tap></div>
            <div className="pa-hint">Chạm vào khu phố nơi xảy ra sự việc.</div>
            <WardMap highlight={wardId} onSelect={(id) => { setWardId(id); setLocation(`${WARDS[id - 1].name}, Phường Phú An (chọn trên bản đồ)`); setPickMap(false); }} className="pa-map" />
          </div>
        </div>
      )}
      {toast && <div className="pa-toast">{toast}</div>}
    </div>
  );
}


/* ================= Kho phản ánh (demo, lưu trong bộ nhớ) ================= */

export type ReportStatus = "Đã tiếp nhận" | "Đang xử lý" | "Đã xử lý";
export type Report = {
  code: string;
  category: string;
  content: string;
  location: string;
  wardId: number;
  photos: string[];
  reporter: { name: string; phone: string; address: string };
  mine: boolean; // do người dùng hiện tại gửi
  status: ReportStatus;
  createdAt: Date;
  history: { at: Date; status: ReportStatus; note: string }[];
};

const now = new Date();
const daysAgo = (n: number, h = 9) => { const d = new Date(now); d.setDate(d.getDate() - n); d.setHours(h, 15, 0, 0); return d; };

// Dữ liệu minh hoạ – khi tích hợp thay bằng API tiếp nhận phản ánh.
export const REPORTS: Report[] = [
  {
    code: "PA-DEMO-0412", category: "Điện – chiếu sáng công cộng", wardId: 8, mine: true, photos: [],
    content: "Đèn chiếu sáng đầu hẻm 12 bị hỏng nhiều ngày, buổi tối rất tối, người dân đi lại khó khăn.",
    location: "Đầu hẻm 12, Khu phố 8, Phường Phú An",
    reporter: { name: DEMO_RESIDENT.name, phone: DEMO_RESIDENT.phone, address: DEMO_RESIDENT.address },
    status: "Đã tiếp nhận", createdAt: daysAgo(2, 8),
    history: [{ at: daysAgo(2, 8), status: "Đã tiếp nhận", note: "Hệ thống chuyển tới Khu phố 8" }],
  },
  {
    code: "PA-DEMO-1033", category: "Môi trường – vệ sinh", wardId: 8, mine: true, photos: [],
    content: "Rác thải tập kết không đúng nơi quy định ở đầu hẻm, bốc mùi vào buổi trưa.",
    location: "Hẻm 5, Khu phố 8, Phường Phú An",
    reporter: { name: DEMO_RESIDENT.name, phone: DEMO_RESIDENT.phone, address: DEMO_RESIDENT.address },
    status: "Đã tiếp nhận", createdAt: daysAgo(1, 10),
    history: [{ at: daysAgo(1, 10), status: "Đã tiếp nhận", note: "Hệ thống chuyển tới Khu phố 8" }],
  },
];

const STATUS_CLS: Record<ReportStatus, string> = { "Đã tiếp nhận": "blue", "Đang xử lý": "orange", "Đã xử lý": "green" };
const NEXT: Partial<Record<ReportStatus, ReportStatus>> = { "Đã tiếp nhận": "Đang xử lý", "Đang xử lý": "Đã xử lý" };
const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

function Chevron() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b3c0cb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}

function MenuIcon({ kind }: { kind: "send" | "track" | "handle" | "guide" }) {
  const paths: Record<string, ReactElement> = {
    send: <><path d="M7 3h7l4 4v14H7z" fill="#fff" opacity=".95"/><path d="M14 3v4h4" fill="none" stroke="#9cc3ee" strokeWidth="1.5"/><path d="M9.5 11h5M9.5 14h3" stroke="#9cc3ee" strokeWidth="1.5" strokeLinecap="round"/><path d="m12 19 6.5-6.5 1.8 1.8L13.8 21H12z" fill="#ff8a3d"/></>,
    track: <><circle cx="10.5" cy="10.5" r="5.5" fill="#bdf0ff" stroke="#fff" strokeWidth="2"/><path d="m15 15 5 5" stroke="#ff5a7a" strokeWidth="3" strokeLinecap="round"/></>,
    handle: <><circle cx="12" cy="12" r="4" fill="#fff"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/><circle cx="12" cy="12" r="1.6" fill="#ff8a3d"/></>,
    guide: <><path d="M4 6c3-1 5-1 8 1v12c-3-2-5-2-8-1z" fill="#fff"/><path d="M20 6c-3-1-5-1-8 1v12c3-2 5-2 8-1z" fill="#e6ddff"/></>,
  };
  return <span className={`pk-icon ${kind}`}><svg width="26" height="26" viewBox="0 0 24 24">{paths[kind]}</svg></span>;
}

function StatusBadge({ s }: { s: ReportStatus }) {
  return <span className={`category ${STATUS_CLS[s]}`}>{s}</span>;
}

function ReportList({ items, onOpen, empty }: { items: Report[]; onOpen: (r: Report) => void; empty: string }) {
  if (!items.length) return <div className="pk-empty">{empty}</div>;
  return (
    <div className="pk-list">
      {items.map((r) => (
        <Tap className="pk-report" key={r.code} onClick={() => onOpen(r)}>
          <div className="pk-report-top"><b>{r.code}</b><StatusBadge s={r.status} /></div>
          <div className="pk-report-cat">{r.category}</div>
          <div className="pk-report-text">{r.content}</div>
          <div className="pk-report-meta"><Icon name="location" size={12} />{WARDS[r.wardId - 1].name}<span>·</span><Icon name="clock" size={12} />{fmtTime(r.createdAt)}</div>
        </Tap>
      ))}
    </div>
  );
}

function ReportDetail({ r, staff, onChange }: { r: Report; staff: boolean; onChange: () => void }) {
  const [note, setNote] = useState("");
  const next = NEXT[r.status];
  const advance = () => {
    if (!next) return;
    const at = new Date();
    r.status = next;
    r.history.push({ at, status: next, note: note.trim() || (next === "Đang xử lý" ? "Cán bộ đã tiếp nhận và đang xử lý" : "Đã xử lý xong") });
    setNote("");
    onChange();
  };
  const ward = WARDS[r.wardId - 1];
  return (
    <div className="pa-body">
      <section className="pa-card">
        <div className="pk-report-top"><b>{r.code}</b><StatusBadge s={r.status} /></div>
        <div className="pk-report-cat">{r.category}</div>
        <p className="pk-detail-text">{r.content}</p>
        <div className="pa-line"><Icon name="location" size={15} />{r.location}</div>
        <div className="pa-line"><Icon name="home" size={15} />{ward.name} · Trưởng KP: <b>{ward.head}</b></div>
        {r.photos.length > 0 && <div className="pa-photos pk-photos">{r.photos.map((u) => <div className="pa-photo" key={u}><img src={u} alt="Ảnh minh chứng" /></div>)}</div>}
      </section>
      {staff && (
        <section className="pa-card">
          <label className="pa-label">Người phản ánh</label>
          <div className="pa-line"><Icon name="user" size={15} /><b>{r.reporter.name}</b></div>
          <div className="pa-line"><Icon name="phone" size={15} />{r.reporter.phone}</div>
          <div className="pa-line"><Icon name="location" size={15} />{r.reporter.address}</div>
        </section>
      )}
      <section className="pa-card">
        <label className="pa-label">Tiến độ xử lý</label>
        <div className="pk-timeline">
          {[...r.history].reverse().map((h, i) => (
            <div className={`pk-step ${i === 0 ? "now" : ""}`} key={i}>
              <i className={STATUS_CLS[h.status]} />
              <div><b>{h.status}</b><span>{fmtTime(h.at)}</span><p>{h.note}</p></div>
            </div>
          ))}
        </div>
      </section>
      {staff && next && (
        <section className="pa-card">
          <label className="pa-label">Cập nhật xử lý</label>
          <textarea className="pa-textarea db-short" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú kết quả / hướng xử lý (hiển thị cho người phản ánh)" />
          <Tap className="pa-submit pk-advance" onClick={advance}>{next === "Đang xử lý" ? "Tiếp nhận & chuyển sang Đang xử lý" : "Đánh dấu Đã xử lý"}</Tap>
        </section>
      )}
    </div>
  );
}

function Guide() {
  const steps = [
    ["Chọn loại phản ánh", "Môi trường, trật tự đô thị, an ninh, hạ tầng, chiếu sáng, cấp thoát nước…"],
    ["Mô tả sự việc", "Viết rõ vấn đề, thời gian xảy ra, mức độ ảnh hưởng."],
    ["Xác định vị trí và khu phố", "Dùng «Vị trí hiện tại» hoặc «Chọn trên bản đồ». Phản ánh được chuyển tới khu phố tương ứng."],
    ["Chụp ảnh minh chứng", "Ít nhất 01 ảnh, tối đa 04 ảnh để cán bộ xác minh nhanh."],
    ["Gửi và nhận mã theo dõi", "Lưu mã phản ánh để tra cứu tiến độ trong mục «Theo dõi phản ánh»."],
  ];
  const flow = ["Đã tiếp nhận", "Đang xử lý", "Đã xử lý"] as ReportStatus[];
  return (
    <div className="pa-body">
      <section className="pa-card">
        <label className="pa-label">5 bước gửi phản ánh</label>
        {steps.map(([t, d], i) => (
          <div className="pk-guide-step" key={t}><span>{i + 1}</span><div><b>{t}</b><p>{d}</p></div></div>
        ))}
      </section>
      <section className="pa-card">
        <label className="pa-label">Quy trình xử lý</label>
        <div className="pk-flow">{flow.map((f, i) => <span key={f}><StatusBadge s={f} />{i < flow.length - 1 && <em>→</em>}</span>)}</div>
        <p className="pk-detail-text">Phản ánh được chuyển tới Ban điều hành khu phố. Nội dung vượt thẩm quyền khu phố sẽ được chuyển lên UBND phường. Người phản ánh nhận kết quả xử lý trên ứng dụng.</p>
      </section>
      <section className="pa-card">
        <label className="pa-label">Thời hạn xử lý</label>
        <p className="pk-detail-text">[cần cập nhật: thời hạn tiếp nhận và xử lý theo quy định của UBND phường Phú An]</p>
      </section>
    </div>
  );
}

type View = { name: "hub" | "form" | "track" | "handle" | "guide" } | { name: "detail"; report: Report; staff: boolean; from: "track" | "handle" };

export default function PhanAnhModule({ go }: { go: (s: Screen) => void }) {
  const [view, setView] = useState<View>({ name: "hub" });
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const hub = () => setView({ name: "hub" });

  if (view.name === "form") return <PhanAnhForm go={go} onBack={hub} backLabel="Về Phản ánh kiến nghị" />;

  const month = new Date();
  const inMonth = REPORTS.filter((r) => r.createdAt.getMonth() === month.getMonth() && r.createdAt.getFullYear() === month.getFullYear());
  const pending = REPORTS.filter((r) => r.status !== "Đã xử lý");
  const titles: Record<string, string> = { hub: "Phản ánh kiến nghị", track: "Theo dõi phản ánh", handle: "Xử lý phản ánh", guide: "Hướng dẫn gửi phản ánh", detail: view.name === "detail" ? view.report.code : "" };
  const back = view.name === "hub" ? () => go("home") : view.name === "detail" ? () => setView({ name: view.from }) : hub;

  return (
    <div className="screen pa-screen">
      <Topbar title={titles[view.name]} onBack={back} />
      {view.name === "hub" && (
        <div className="pa-body">
          {([
            ["send", "Gửi phản ánh", "Gửi kiến nghị, phản ánh đến chính quyền phường", () => setView({ name: "form" }), 0],
            ["track", "Theo dõi phản ánh", "Tra cứu tiến độ xử lý phản ánh của bạn", () => setView({ name: "track" }), 0],
            ["handle", "Xử lý phản ánh", "Danh sách phản ánh đang chờ cán bộ xử lý", () => setView({ name: "handle" }), pending.length],
            ["guide", "Hướng dẫn gửi phản ánh", "5 bước gửi phản ánh, quy trình và thời hạn xử lý", () => setView({ name: "guide" }), 0],
          ] as const).map(([k, t, d, fn, badge]) => (
            <Tap className="pk-menu" key={k} onClick={fn}>
              <div className="pk-icon-wrap"><MenuIcon kind={k} />{badge > 0 && <em className="pk-badge">{badge}</em>}</div>
              <div className="pk-menu-copy"><b>{t}</b><span>{d}</span></div>
              <Chevron />
            </Tap>
          ))}
          <div className="pk-stats">
            <div className="pk-stats-title"><Icon name="grid" size={14} color="#fff" />Thống kê tháng {month.getMonth() + 1}/{month.getFullYear()}</div>
            <div className="pk-stats-row">
              <div><b>{inMonth.length}</b><span>Tiếp nhận</span></div>
              <div><b className="green">{inMonth.filter((r) => r.status === "Đã xử lý").length}</b><span>Đã xử lý</span></div>
              <div><b className="yellow">{inMonth.filter((r) => r.status === "Đang xử lý").length}</b><span>Đang xử lý</span></div>
            </div>
          </div>
        </div>
      )}
      {view.name === "track" && (
        <div className="pa-body">
          <ReportList items={REPORTS.filter((r) => r.mine)} onOpen={(r) => setView({ name: "detail", report: r, staff: false, from: "track" })} empty="Bạn chưa gửi phản ánh nào." />
        </div>
      )}
      {view.name === "handle" && (
        <div className="pa-body">
          <div className="pk-staff-note"><Icon name="user" size={14} />Dành cho cán bộ khu phố / phường (bản demo chưa kiểm tra quyền).</div>
          <ReportList items={pending} onOpen={(r) => setView({ name: "detail", report: r, staff: true, from: "handle" })} empty="Không còn phản ánh chờ xử lý." />
        </div>
      )}
      {view.name === "guide" && <Guide />}
      {view.name === "detail" && <ReportDetail r={view.report} staff={view.staff} onChange={refresh} />}
    </div>
  );
}
