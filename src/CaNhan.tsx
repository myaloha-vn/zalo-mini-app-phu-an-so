import { useState } from "react";
import { Icon, Tap, BottomNav, Topbar, type Screen, type IconName } from "./ui";
import { WARDS } from "./KhuPho";
import { DEMO_RESIDENT, REPORTS } from "./PhanAnh";
import DangBaiScreen, { userPosts, DEMO_AUTHOR_WARD } from "./DangBai";
import { REGISTRATIONS } from "./AnSinh";
import { NewsDetail, type NewsItem } from "./news";

/* ---------------- Trang cá nhân ----------------
   Bản demo: thông tin lấy từ tài khoản mẫu. Công tắc "Vai trò" chỉ để trình diễn;
   khi tích hợp, vai trò do hệ thống cấp (xác thực Zalo + phân quyền của phường), người dùng không tự đổi. */

type Role = "resident" | "leader";
let demoRole: Role = "resident"; // giữ vai trò khi chuyển màn hình trong phiên demo

function Row({ icon, label, value, onClick, badge, color = "blue" }: { icon: IconName; label: string; value?: string; onClick?: () => void; badge?: number; color?: string }) {
  return (
    <Tap className="cn-row" onClick={onClick}>
      <span className={`cn-row-ic ${color}`}><Icon name={icon} size={17} /></span>
      <span className="cn-row-label">{label}</span>
      {badge ? <em className="cn-badge">{badge}</em> : null}
      {value && <span className="cn-row-value">{value}</span>}
      {onClick && <Icon name="arrow" size={14} color="#b3c0cb" />}
    </Tap>
  );
}

export default function CaNhanScreen({ go }: { go: (s: Screen) => void }) {
  const [role, setRoleState] = useState<Role>(demoRole);
  const [composing, setComposing] = useState(false);
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [showRegs, setShowRegs] = useState(false);
  const [notify, setNotify] = useState(true);
  const setRole = (r: Role) => { demoRole = r; setRoleState(r); };

  if (composing) return <DangBaiScreen onBack={() => setComposing(false)} onPublished={(p) => { setComposing(false); setArticle(p); }} />;
  if (article) return <NewsDetail item={article} onBack={() => setArticle(null)} go={go} />;

  const leaderWard = WARDS[DEMO_AUTHOR_WARD - 1];
  const residentWard = WARDS[DEMO_RESIDENT.wardId - 1];
  const isLeader = role === "leader";
  const person = isLeader
    ? { name: leaderWard.head, phone: leaderWard.headPhone, ward: leaderWard.name, title: `Trưởng ${leaderWard.name}` }
    : { name: DEMO_RESIDENT.name, phone: DEMO_RESIDENT.phone, ward: residentWard.name, title: `${DEMO_RESIDENT.role} · ${residentWard.name}` };
  const initials = person.name.split(" ").slice(-2).map((w) => w[0]).join("");

  const myReports = REPORTS.filter((r) => r.mine);
  const myOpen = myReports.filter((r) => r.status !== "Đã xử lý").length;
  const wardPending = REPORTS.filter((r) => r.wardId === DEMO_AUTHOR_WARD && r.status !== "Đã xử lý").length;
  const myPosts = userPosts.filter((p) => p.scope === leaderWard.name);

  return (
    <div className="screen pa-screen">
      <Topbar title="Cá nhân" onBack={() => go("home")} />
      <div className="pa-body cn-body">
        <div className="cn-hero">
          <div className="cn-avatar">{initials}</div>
          <div className="cn-hero-copy">
            <b>{person.name}</b>
            <span>{person.title}</span>
            <span className="cn-verified"><Icon name="check" size={12} />Đã xác thực qua Zalo (demo)</span>
          </div>
        </div>

        <div className="cn-role">
          <span>Vai trò (demo)</span>
          <div className="cn-seg">
            <Tap className={!isLeader ? "on" : ""} onClick={() => setRole("resident")}>Người dân</Tap>
            <Tap className={isLeader ? "on" : ""} onClick={() => setRole("leader")}>Trưởng khu phố</Tap>
          </div>
        </div>

        <div className="cn-stats">
          <Tap onClick={() => go("phananh:track")}><b>{myReports.length}</b><span>Phản ánh đã gửi</span></Tap>
          <Tap onClick={() => setShowRegs(!showRegs)}><b>{REGISTRATIONS.length}</b><span>Đăng ký an sinh</span></Tap>
          {isLeader ? <Tap onClick={() => go("phananh:handle")}><b className="orange">{wardPending}</b><span>Chờ xử lý</span></Tap>
            : <Tap onClick={() => go("phananh:track")}><b className="orange">{myOpen}</b><span>Đang xử lý</span></Tap>}
        </div>

        {isLeader && (
          <section className="cn-card">
            <div className="cn-card-title">Công việc khu phố</div>
            <Row icon="alert" color="orange" label="Xử lý phản ánh" badge={wardPending} onClick={() => go("phananh:handle")} />
            <Row icon="megaphone" color="blue" label="Đăng bài lên Tin tức" onClick={() => setComposing(true)} />
            <Row icon="document" color="green" label="Bài đã đăng" value={`${myPosts.length} bài`} onClick={myPosts[0] ? () => setArticle(myPosts[0]) : undefined} />
            <Row icon="home" color="purple" label="Trang khu phố" value={leaderWard.name.replace("Khu phố ", "")} onClick={() => go("khupho")} />
          </section>
        )}

        <section className="cn-card">
          <div className="cn-card-title">Hoạt động của tôi</div>
          <Row icon="search" color="green" label="Theo dõi phản ánh" badge={myOpen} onClick={() => go("phananh:track")} />
          <Row icon="health" color="orange" label="Đăng ký an sinh của tôi" value={`${REGISTRATIONS.length}`} onClick={() => setShowRegs(!showRegs)} />
          {showRegs && (
            <div className="cn-regs">
              {REGISTRATIONS.length === 0 ? <p>Chưa có đăng ký. Vào <b>An sinh xã hội</b> để đăng ký tham gia chính sách.</p> :
                REGISTRATIONS.map((r, i) => <div className="cn-reg" key={i}><b>{r.title}</b><span>{r.group} · {r.ward} · {r.date} · Chờ cán bộ liên hệ</span></div>)}
            </div>
          )}
        </section>

        <section className="cn-card">
          <div className="cn-card-title">Thông tin hộ gia đình</div>
          <Row icon="user" label="Họ và tên" value={person.name} />
          <Row icon="phone" label="Số điện thoại" value={person.phone} />
          <Row icon="home" label="Khu phố" value={person.ward.replace("Khu phố ", "")} />
          {!isLeader && <Row icon="location" label="Địa chỉ" value={DEMO_RESIDENT.address} />}
          <p className="cn-note">Thông tin lấy từ khai báo hộ gia đình. Cần sửa, vui lòng liên hệ Ban điều hành khu phố.</p>
        </section>

        <section className="cn-card">
          <div className="cn-card-title">Cài đặt & hỗ trợ</div>
          <Tap className="cn-row" onClick={() => setNotify(!notify)}>
            <span className="cn-row-ic blue"><Icon name="bell" size={17} /></span>
            <span className="cn-row-label">Nhận thông báo</span>
            <span className={`cn-switch ${notify ? "on" : ""}`}><i /></span>
          </Tap>
          <Row icon="book" color="purple" label="Hướng dẫn sử dụng" onClick={() => go("phananh")} />
          <Row icon="info" color="blue" label="Giới thiệu phường" onClick={() => go("gioithieu")} />
          <Row icon="check" color="green" label="Chính sách bảo mật" value="Đang cập nhật" />
        </section>

        <div className="cn-version">Phú An Số · phiên bản 1.0.0 (demo)</div>
      </div>
      <BottomNav active="Cá nhân" go={go} />
    </div>
  );
}
