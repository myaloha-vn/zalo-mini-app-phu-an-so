import { Icon, BottomNav, Topbar, type Screen } from "./ui";
import { DEMO_RESIDENT } from "./PhanAnh";

/* Trang cá nhân – chỉ hiển thị họ tên và số điện thoại.
   Bản demo dùng tài khoản mẫu; khi tích hợp lấy từ tài khoản Zalo của người dùng. */

export default function CaNhanScreen({ go }: { go: (s: Screen) => void }) {
  const { name, phone } = DEMO_RESIDENT;
  const initials = name.split(" ").slice(-2).map((w) => w[0]).join("");
  return (
    <div className="screen pa-screen">
      <Topbar title="Cá nhân" onBack={() => go("home")} />
      <div className="pa-body cn-body">
        <div className="cn-simple">
          <div className="cn-avatar">{initials}</div>
          <div className="cn-field"><Icon name="user" size={16} color="#1677d2" /><span>Họ và tên</span><b>{name}</b></div>
          <div className="cn-field"><Icon name="phone" size={16} color="#1677d2" /><span>Số điện thoại</span><b>{phone}</b></div>
        </div>
      </div>
      <BottomNav active="Cá nhân" go={go} />
    </div>
  );
}
