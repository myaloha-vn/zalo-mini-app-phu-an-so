import { useRef, useState, type ChangeEvent } from "react";
import { Icon, Tap, Topbar } from "./ui";
import { WARDS } from "./KhuPho";
import type { NewsItem } from "./news";

/* ---------------- Trưởng khu phố đăng bài ----------------
   Bản demo: bài đăng chỉ lưu trong bộ nhớ của app (mất khi tải lại trang).
   Khi tích hợp:
   - Chỉ hiện nút đăng bài cho tài khoản có vai trò Trưởng/Phó khu phố (xác thực qua hệ thống quản trị).
   - Bài gửi qua API; nên có bước UBND phường duyệt trước khi hiển thị công khai. */

// Tài khoản minh hoạ – thay bằng thông tin người dùng đã đăng nhập.
const DEMO_AUTHOR_WARD = 8;

const CATEGORIES = ["Tin tức", "Thông báo", "Hoạt động"];
const TONES = ["news-one", "news-two", "news-three", "news-four"];

/** Bài do các khu phố đăng (demo: 2 bài mẫu + bài đăng mới trong phiên làm việc). */
export const userPosts: NewsItem[] = [
  {
    title: "Khu phố 3 tổ chức sinh hoạt hè cho thiếu nhi",
    date: "19/06/2025",
    tone: "news-two",
    category: "Hoạt động",
    scope: "Khu phố 3",
    author: "Trưởng Khu phố 3 – Lê Văn Phúc",
    summary: "Ban điều hành Khu phố 3 phối hợp Chi đoàn khu phố tổ chức các buổi sinh hoạt hè cho thiếu nhi tại nhà văn hoá khu phố.",
    body: [
      "Chương trình gồm các hoạt động kể chuyện, vẽ tranh, trò chơi dân gian và hướng dẫn kỹ năng an toàn khi sử dụng Internet.",
      "Phụ huynh có nhu cầu đăng ký cho con em tham gia vui lòng liên hệ Ban điều hành Khu phố 3.",
    ],
  },
  {
    title: "Khu phố 8 thông báo lịch họp dân định kỳ tháng 7",
    date: "16/06/2025",
    tone: "news-three",
    category: "Thông báo",
    scope: "Khu phố 8",
    author: "Trưởng Khu phố 8 – Bùi Văn Sơn",
    summary: "Ban điều hành Khu phố 8 thông báo lịch họp dân định kỳ tháng 7 để lấy ý kiến bà con về công tác vệ sinh môi trường và an ninh trật tự.",
    body: [
      "Thời gian và địa điểm cụ thể sẽ được thông báo tại nhà văn hoá khu phố và trên ứng dụng Phú An Số.",
      "Rất mong bà con sắp xếp thời gian tham dự đầy đủ.",
    ],
  },
];

/** Sắp xếp bài viết mới nhất lên trước (ngày dạng dd/mm/yyyy). */
export function byDateDesc(a: NewsItem, b: NewsItem) {
  const k = (d: string) => d.split("/").reverse().join("");
  return k(b.date).localeCompare(k(a.date));
}

function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function DangBaiScreen({ onBack, onPublished }: { onBack: () => void; onPublished: (p: NewsItem) => void }) {
  const ward = WARDS[DEMO_AUTHOR_WARD - 1];
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [tried, setTried] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const errors = { title: title.trim().length < 10, body: body.trim().length < 30 };
  const valid = !errors.title && !errors.body;

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) setImage(URL.createObjectURL(f));
    e.target.value = "";
  };

  const publish = () => {
    setTried(true);
    if (!valid) return;
    const paras = body.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const post: NewsItem = {
      title: title.trim(),
      date: today(),
      tone: TONES[userPosts.length % TONES.length],
      image,
      category,
      scope: ward.name,
      summary: summary.trim() || paras[0],
      body: summary.trim() ? paras : paras.slice(1),
      author: `Trưởng ${ward.name} – ${ward.head}`,
    };
    userPosts.unshift(post);
    onPublished(post);
  };

  return (
    <div className="screen pa-screen">
      <Topbar title="Đăng bài" onBack={onBack} />
      <div className="pa-body">
        <div className="db-author">
          <div className="db-avatar">{ward.head.split(" ").slice(-1)[0][0]}</div>
          <div><b>{ward.head}</b><span>Trưởng {ward.name} · đăng lên Tin tức - Sự kiện</span></div>
        </div>

        <section className="pa-card">
          <label className="pa-label">Chuyên mục</label>
          <div className="db-chips">
            {CATEGORIES.map((c) => <Tap key={c} className={`db-chip ${c === category ? "on" : ""}`} onClick={() => setCategory(c)}>{c}</Tap>)}
          </div>
        </section>

        <section className="pa-card">
          <label className="pa-label">Tiêu đề <i>*</i></label>
          <input className="db-input" value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Khu phố 8 ra quân vệ sinh môi trường" />
          {tried && errors.title && <div className="pa-error"><Icon name="alert" size={13} />Tiêu đề cần ít nhất 10 ký tự</div>}
        </section>

        <section className="pa-card">
          <label className="pa-label">Ảnh bìa</label>
          {image ? (
            <div className="db-cover"><img src={image} alt="Ảnh bìa" /><Tap className="pa-photo-x" onClick={() => setImage(undefined)}>✕</Tap></div>
          ) : (
            <Tap className="db-cover-add" onClick={() => fileRef.current?.click()}><Icon name="image" size={22} /><span>Thêm ảnh bìa</span></Tap>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        </section>

        <section className="pa-card">
          <label className="pa-label">Tóm tắt</label>
          <textarea className="pa-textarea db-short" rows={2} maxLength={250} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="1–2 câu tóm tắt nội dung chính (không bắt buộc)" />
        </section>

        <section className="pa-card">
          <label className="pa-label">Nội dung <i>*</i></label>
          <textarea className="pa-textarea" rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Viết nội dung bài. Xuống dòng để tách đoạn." />
          {tried && errors.body && <div className="pa-error"><Icon name="alert" size={13} />Nội dung cần ít nhất 30 ký tự</div>}
        </section>

        <Tap className={`pa-submit ${valid ? "" : "off"}`} onClick={publish}>Đăng bài</Tap>
        <div className="pa-hint db-note">Bài đăng hiển thị công khai cho người dân. Không đăng thông tin cá nhân (tên, địa chỉ, số điện thoại, hoàn cảnh) của người dân khi chưa có sự đồng ý.</div>
      </div>
    </div>
  );
}
