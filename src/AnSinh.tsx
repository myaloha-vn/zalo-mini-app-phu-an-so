import { useState } from "react";
import { Icon, Tap, DuotoneIcon, BottomNav, Topbar, type Screen, type IconName } from "./ui";
import { DEMO_RESIDENT } from "./PhanAnh";
import { WARD_NAMES } from "./wardNames";

/* ---------------- Dữ liệu mẫu (thay bằng API khi tích hợp) ---------------- */

const GROUPS = ["Tất cả", "Người có công", "Bảo trợ xã hội", "Y tế", "Giáo dục", "Việc làm", "Nhà ở"] as const;
type Group = Exclude<(typeof GROUPS)[number], "Tất cả">;

const GROUP_STYLE: Record<Group, { color: string; icon: IconName }> = {
  "Người có công": { color: "red", icon: "star" },
  "Bảo trợ xã hội": { color: "blue", icon: "people" },
  "Y tế": { color: "green", icon: "health" },
  "Giáo dục": { color: "orange", icon: "book" },
  "Việc làm": { color: "purple", icon: "briefcase" },
  "Nhà ở": { color: "teal", icon: "home" },
};

type Status = "Đang áp dụng" | "Đang tiếp nhận" | "Mới";
const STATUS_TONE: Record<Status, string> = { "Đang áp dụng": "ok", "Đang tiếp nhận": "open", "Mới": "new" };

type Policy = { group: Group; status: Status; title: string; audience: string; desc: string };
type Program = { group: Group; title: string; time: string; place: string; audience: string; desc: string };

const POLICIES: Policy[] = [
  { group: "Người có công", status: "Đang áp dụng", title: "Trợ cấp ưu đãi hằng tháng cho người có công", audience: "Thương binh, thân nhân liệt sĩ, người có công với cách mạng", desc: "Chi trả trợ cấp, phụ cấp ưu đãi hằng tháng và các chế độ đi kèm theo quy định." },
  { group: "Người có công", status: "Đang tiếp nhận", title: "Hỗ trợ cải thiện nhà ở cho người có công", audience: "Hộ người có công có nhà ở xuống cấp", desc: "Hỗ trợ kinh phí xây mới hoặc sửa chữa nhà ở cho gia đình người có công." },
  { group: "Bảo trợ xã hội", status: "Đang tiếp nhận", title: "Trợ cấp xã hội hằng tháng", audience: "Người cao tuổi, người khuyết tật, trẻ em mồ côi", desc: "Tiếp nhận hồ sơ và chi trả trợ cấp xã hội hằng tháng tại phường." },
  { group: "Bảo trợ xã hội", status: "Đang áp dụng", title: "Hỗ trợ khẩn cấp khi gặp rủi ro, thiên tai", audience: "Hộ gia đình gặp khó khăn đột xuất", desc: "Hỗ trợ lương thực, chi phí sinh hoạt và sửa chữa nhà ở khi gặp sự cố." },
  { group: "Y tế", status: "Đang áp dụng", title: "Hỗ trợ bảo hiểm y tế hộ cận nghèo", audience: "Thành viên hộ cận nghèo trên địa bàn", desc: "Hỗ trợ chi phí tham gia BHYT, đảm bảo quyền lợi khám chữa bệnh." },
  { group: "Giáo dục", status: "Đang áp dụng", title: "Miễn, giảm học phí năm học 2025 – 2026", audience: "Học sinh thuộc diện chính sách, hộ nghèo", desc: "Miễn, giảm học phí và hỗ trợ chi phí học tập theo quy định hiện hành." },
  { group: "Việc làm", status: "Mới", title: "Kết nối việc làm và đào tạo nghề miễn phí", audience: "Người lao động từ 18 tuổi", desc: "Tư vấn, giới thiệu việc làm và hỗ trợ học nghề ngắn hạn miễn phí." },
  { group: "Nhà ở", status: "Đang tiếp nhận", title: "Hỗ trợ tiếp cận nhà ở xã hội", audience: "Người có thu nhập thấp, công nhân lao động", desc: "Hướng dẫn thủ tục đăng ký mua, thuê nhà ở xã hội và vay vốn ưu đãi." },
];

const PROGRAMS: Program[] = [
  { group: "Y tế", title: "Khám sức khoẻ miễn phí cho người cao tuổi", time: "05/07 – 06/07/2025", place: "Trạm Y tế phường Phú An", audience: "Người từ 60 tuổi trở lên", desc: "Khám tổng quát, đo huyết áp, đường huyết và tư vấn dinh dưỡng miễn phí." },
  { group: "Bảo trợ xã hội", title: "Trao quà hỗ trợ hộ gia đình khó khăn", time: "10/07/2025", place: "Nhà văn hoá Khu phố Tân An 5", audience: "Hộ nghèo, hộ cận nghèo", desc: "Trao quà nhu yếu phẩm và tiền hỗ trợ cho các hộ có hoàn cảnh khó khăn." },
  { group: "Việc làm", title: "Ngày hội việc làm phường Phú An 2025", time: "12/07/2025", place: "Hội trường UBND phường", audience: "Người lao động từ 18 tuổi", desc: "Kết nối trực tiếp với doanh nghiệp đang tuyển dụng trên địa bàn." },
  { group: "Người có công", title: "Thăm hỏi, tặng quà gia đình chính sách dịp 27/7", time: "20/07 – 27/07/2025", place: "Tại gia đình", audience: "Người có công và thân nhân", desc: "Lãnh đạo phường thăm hỏi, tặng quà các gia đình chính sách trên địa bàn." },
  { group: "Giáo dục", title: "Trao học bổng “Tiếp sức đến trường”", time: "15/08/2025", place: "Nhà văn hoá phường", audience: "Học sinh có hoàn cảnh khó khăn", desc: "Trao học bổng, dụng cụ học tập cho học sinh vượt khó học tốt." },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

/* ---------------- Thành phần ---------------- */

function PolicyCard({ p, onDetail }: { p: Policy; onDetail: () => void }) {
  const st = GROUP_STYLE[p.group];
  return (
    <div className="policy-card">
      <div className="policy-badges"><span className={`category ${st.color}`}>{p.group}</span><span className={`status ${STATUS_TONE[p.status]}`}><i />{p.status}</span></div>
      <div className="policy-main">
        <DuotoneIcon icon={st.icon} color={st.color} />
        <div className="policy-copy">
          <div className="policy-title">{p.title}</div>
          <div className="audience">Đối tượng: <b>{p.audience}</b></div>
        </div>
      </div>
      <div className="policy-desc">{p.desc}</div>
      <Tap className="detail-link" onClick={onDetail}>Xem chi tiết và đăng ký tham gia <span>→</span></Tap>
    </div>
  );
}

function ProgramImage({ group }: { group: Group }) {
  const st = GROUP_STYLE[group];
  return (
    <div className={`as-prog-img ${st.color}`}>
      <div className="as-prog-sun" />
      <div className="as-prog-hill" />
      <div className="as-prog-icon"><Icon name={st.icon} size={34} color="#fff" /></div>
      <span className={`category ${st.color} as-prog-tag`}>{group}</span>
    </div>
  );
}

function ProgramCard({ p, onDetail, wide = false }: { p: Program; onDetail: () => void; wide?: boolean }) {
  return (
    <div className={`as-prog ${wide ? "wide" : ""}`}>
      <ProgramImage group={p.group} />
      <div className="as-prog-body">
        <div className="as-prog-title">{p.title}</div>
        <div className="as-prog-row"><Icon name="calendar" size={13} />{p.time}</div>
        <div className="as-prog-row"><Icon name="location" size={13} />{p.place}</div>
        <div className="as-prog-row"><Icon name="people" size={13} />{p.audience}</div>
        <Tap className="kp-btn solid as-prog-btn" onClick={onDetail}>Xem chi tiết và đăng ký<Icon name="arrow" size={14} /></Tap>
      </div>
    </div>
  );
}

type Detail = { kind: "policy"; item: Policy } | { kind: "program"; item: Program };

function DetailSheet({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  const st = GROUP_STYLE[detail.item.group];
  // Bước đăng ký: xem thông tin → xác nhận họ tên, SĐT (tự điền từ tài khoản) → thành công.
  // Bản demo: chưa gửi lên hệ thống; khi tích hợp, lấy thông tin người dùng đã đăng nhập và gửi qua API.
  const [step, setStep] = useState<"info" | "confirm" | "done">("info");
  const [name, setName] = useState(DEMO_RESIDENT.name);
  const [phone, setPhone] = useState(DEMO_RESIDENT.phone);
  const [wardId, setWardId] = useState(DEMO_RESIDENT.wardId);
  const [tried, setTried] = useState(false);
  const phoneOk = /^0\d{9}$/.test(phone.replace(/\s/g, ""));
  const nameOk = name.trim().length >= 2;
  const rows: [IconName, string, string][] =
    detail.kind === "policy"
      ? [["people", "Đối tượng", detail.item.audience], ["check", "Trạng thái", detail.item.status], ["location", "Nơi tiếp nhận", "Bộ phận Một cửa – UBND phường Phú An"]]
      : [["calendar", "Thời gian", detail.item.time], ["location", "Địa điểm", detail.item.place], ["people", "Đối tượng", detail.item.audience]];
  const submit = () => { setTried(true); if (nameOk && phoneOk) setStep("done"); };
  return (
    <div className="as-backdrop" onClick={onClose}>
      <div className="as-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="as-sheet-head">
          <DuotoneIcon icon={st.icon} color={st.color} />
          <div>
            <span className={`category ${st.color}`}>{detail.item.group}</span>
            <div className="as-sheet-title">{detail.item.title}</div>
          </div>
        </div>

        {step === "info" && (
          <>
            <div className="as-sheet-rows">
              {rows.map(([icon, label, value]) => (
                <div className="as-sheet-row" key={label}><Icon name={icon} size={16} color="#1677d2" /><span>{label}</span><b>{value}</b></div>
              ))}
            </div>
            <div className="as-sheet-desc">{detail.item.desc}</div>
            <Tap className="primary-button" onClick={() => setStep("confirm")}>Đăng ký tham gia</Tap>
          </>
        )}

        {step === "confirm" && (
          <div className="rg-confirm">
            <div className="rg-title">Xác nhận thông tin đăng ký</div>
            <div className="rg-hint"><Icon name="check" size={13} />Đã tự điền từ tài khoản của bạn. Sửa lại nếu chưa đúng.</div>
            <label>Họ và tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên" />
            {tried && !nameOk && <div className="pa-error"><Icon name="alert" size={13} />Vui lòng nhập họ tên</div>}
            <label>Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" inputMode="tel" />
            {tried && !phoneOk && <div className="pa-error"><Icon name="alert" size={13} />Số điện thoại gồm 10 chữ số, bắt đầu bằng 0</div>}
            <label>Khu phố</label>
            <div className="pa-select">
              <select value={wardId} onChange={(e) => setWardId(Number(e.target.value))}>
                {WARD_NAMES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </div>
            <p className="rg-note">Thông tin chỉ dùng để cán bộ phường liên hệ về {detail.kind === "policy" ? "chính sách" : "chương trình"} này.</p>
            <div className="rg-actions">
              <Tap className="as-btn ghost" onClick={() => setStep("info")}>Quay lại</Tap>
              <Tap className="as-btn solid" onClick={submit}>Xác nhận đăng ký</Tap>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="rg-done">
            <div className="pa-done-icon"><Icon name="check" size={30} color="#fff" /></div>
            <div className="rg-title">Đăng ký thành công</div>
            <p>Cảm ơn <b>{name.trim()}</b>. Đăng ký thuộc <b>{WARD_NAMES[wardId - 1]}</b>. Cán bộ phường sẽ liên hệ qua số <b>{phone.trim()}</b> để hướng dẫn các bước tiếp theo.</p>
            <p className="rg-note">(Bản demo – đăng ký chưa được gửi lên hệ thống.)</p>
            <Tap className="primary-button" onClick={onClose}>Đóng</Tap>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Module ---------------- */

export default function AnSinhModule({ go }: { go: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("Tất cả");
  const [allPrograms, setAllPrograms] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);

  const q = norm(query);
  const match = (x: { group: Group; title: string; audience: string; desc: string }) =>
    (group === "Tất cả" || x.group === group) && (!q || norm(`${x.title} ${x.audience} ${x.desc} ${x.group}`).includes(q));
  const policies = POLICIES.filter(match);
  const programs = PROGRAMS.filter(match);

  if (allPrograms) {
    return (
      <div className="screen social-screen">
        <Topbar title="Chương trình an sinh" onBack={() => setAllPrograms(false)} end={<Icon name="search" />} />
        <div className="kp-body">
          <div className="policy-count"><span>Đang diễn ra</span><small>{PROGRAMS.length} chương trình</small></div>
          <div className="as-prog-list">
            {PROGRAMS.map((p) => <ProgramCard key={p.title} p={p} wide onDetail={() => setDetail({ kind: "program", item: p })} />)}
          </div>
        </div>
        <BottomNav active="Trang chủ" go={go} />
        {detail && <DetailSheet detail={detail} onClose={() => setDetail(null)} />}
      </div>
    );
  }

  return (
    <div className="screen social-screen">
      <Topbar title="An sinh xã hội" onBack={() => go("home")} end={<Icon name="bell" />} />
      <div className="kp-body">
        <div className="kp-search">
          <Icon name="search" size={18} color="#7890A6" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm chính sách, quyền lợi, nhu cầu hỗ trợ..." />
          {query && <Tap className="kp-clear" onClick={() => setQuery("")}>×</Tap>}
        </div>

        <div className="chips as-group-wrap">
          {GROUPS.map((g) => <Tap key={g} className={`chip ${group === g ? "selected" : ""}`} onClick={() => setGroup(g)}>{g}</Tap>)}
        </div>

        <div className="policy-count"><span>Chính sách an sinh</span><small>{policies.length} chính sách</small></div>
        <div className="policy-list">
          {policies.map((p) => <PolicyCard key={p.title} p={p} onDetail={() => setDetail({ kind: "policy", item: p })} />)}
          {policies.length === 0 && <div className="kp-empty"><Icon name="search" size={26} />Không tìm thấy chính sách phù hợp</div>}
        </div>

        <div className="section-heading"><span>Chương trình an sinh đang diễn ra</span><Tap className="view-all" onClick={() => setAllPrograms(true)}>Xem tất cả <Icon name="arrow" size={13} /></Tap></div>
        {programs.length > 0 ? (
          <div className="as-prog-scroll">
            {programs.map((p) => <ProgramCard key={p.title} p={p} onDetail={() => setDetail({ kind: "program", item: p })} />)}
          </div>
        ) : (
          <div className="kp-empty"><Icon name="calendar" size={26} />Chưa có chương trình phù hợp</div>
        )}
        <Tap className="kp-btn ghost as-all-btn" onClick={() => setAllPrograms(true)}>Xem tất cả chương trình<Icon name="arrow" size={14} /></Tap>
      </div>
      <BottomNav active="Trang chủ" go={go} />
      {detail && <DetailSheet detail={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
