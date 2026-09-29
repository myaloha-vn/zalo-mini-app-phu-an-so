import { useState } from "react";
import { Icon, BottomNav, Topbar, Tap, type Screen } from "./ui";
import { DEMO_RESIDENT } from "./PhanAnh";
import { WARD_NAMES } from "./wardNames";

/* Trang cá nhân – xem và chỉnh sửa thông tin hộ gia đình (họ tên, điện thoại, địa chỉ, khu phố).
   Bản demo lưu ngay vào DEMO_RESIDENT (dùng chung với module Phản ánh);
   khi tích hợp: gọi API cập nhật khai báo hộ gia đình / tài khoản Zalo đã xác thực. */

type Resident = typeof DEMO_RESIDENT;

const WARD_OPTIONS = WARD_NAMES.map((name, i) => ({ id: i + 1, name }));

function PenIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>;
}

export default function CaNhanScreen({ go }: { go: (s: Screen) => void }) {
  const [resident, setResident] = useState<Resident>({ ...DEMO_RESIDENT });
  const [draft, setDraft] = useState<Resident>({ ...DEMO_RESIDENT });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = resident.name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("");
  const valid = draft.name.trim() !== "" && draft.phone.trim() !== "";

  const startEdit = () => {
    setDraft({ ...resident });
    setEditing(true);
    setSaved(false);
  };

  const save = () => {
    if (!valid) return;
    const next: Resident = { ...resident, name: draft.name.trim(), phone: draft.phone.trim(), address: draft.address.trim(), wardId: draft.wardId };
    Object.assign(DEMO_RESIDENT, next); // đồng bộ để các module khác (vd. Phản ánh) dùng thông tin mới
    setResident(next);
    setEditing(false);
    setSaved(true);
  };

  return (
    <div className="screen pa-screen">
      <Topbar title="Cá nhân" onBack={() => go("home")} />
      <div className="pa-body cn-body">
        <div className="cn-simple">
          <div className="cn-avatar">{initials}</div>
          {editing ? (
            <div className="cn-form">
              <label className="cn-input">
                <span>Họ và tên</span>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Họ và tên" />
              </label>
              <label className="cn-input">
                <span>Số điện thoại</span>
                <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="Số điện thoại" inputMode="tel" />
              </label>
              <label className="cn-input">
                <span>Địa chỉ</span>
                <input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Số nhà, tên đường" />
              </label>
              <label className="cn-input">
                <span>Khu phố</span>
                <div className="cn-select">
                  <select value={draft.wardId} onChange={(e) => setDraft({ ...draft, wardId: Number(e.target.value) })}>
                    {WARD_OPTIONS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </label>
            </div>
          ) : (
            <>
              <div className="cn-field"><Icon name="user" size={16} color="#1677d2" /><span>Họ và tên</span><b>{resident.name}</b></div>
              <div className="cn-field"><Icon name="phone" size={16} color="#1677d2" /><span>Số điện thoại</span><b>{resident.phone}</b></div>
              <div className="cn-field"><Icon name="navigation" size={16} color="#1677d2" /><span>Địa chỉ</span><b>{resident.address}</b></div>
              <div className="cn-field"><Icon name="location" size={16} color="#1677d2" /><span>Khu phố</span><b>{WARD_NAMES[resident.wardId - 1]}</b></div>
            </>
          )}
        </div>

        {editing ? (
          <div className="cn-actions">
            <Tap className="cn-btn ghost" onClick={() => setEditing(false)}>Hủy</Tap>
            <Tap className={`cn-btn primary ${valid ? "" : "off"}`} onClick={save}>Lưu thay đổi</Tap>
          </div>
        ) : (
          <Tap className="cn-edit" onClick={startEdit}><PenIcon />Chỉnh sửa thông tin</Tap>
        )}

        {saved && !editing && <div className="cn-saved"><Icon name="check" size={14} />Đã lưu thông tin cá nhân.</div>}
      </div>
      <BottomNav active="Cá nhân" go={go} />
    </div>
  );
}
