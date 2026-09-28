import { useRef, useState, type ChangeEvent } from "react";
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

export default function PhanAnhModule({ go, initialWardId, onBack }: { go: (s: Screen) => void; initialWardId?: number; onBack?: () => void }) {
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
    setDone(`PA-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getTime()).slice(-4)}`);
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
          <p className="pa-muted">Bạn có thể theo dõi tiến độ xử lý trong mục Cá nhân. (Bản demo – phản ánh chưa được gửi lên hệ thống.)</p>
          <Tap className="pa-submit" onClick={back}>{onBack ? "Quay lại khu phố" : "Về trang chủ"}</Tap>
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
