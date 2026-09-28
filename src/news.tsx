import { Icon, BottomNav, Topbar, type Screen } from "./ui";

/** Một bài viết (dùng chung cho Tin tức - Sự kiện và Giới thiệu phường).
 *  Khi tích hợp, dữ liệu lấy từ hệ thống quản trị nội dung để cán bộ tự đăng bài. */
export type NewsItem = {
  title: string;
  date: string;
  tone: string;
  image?: string;
  category: string;
  summary: string;
  /** Mỗi phần tử là một đoạn văn; dòng bắt đầu bằng "• " hiển thị như gạch đầu dòng, "## " là tiêu đề mục. */
  body: string[];
  /** Người đăng (ví dụ trưởng khu phố). Mặc định là UBND phường. */
  author?: string;
  /** Phạm vi bài viết: "Toàn phường" (UBND phường đăng) hoặc tên khu phố (trưởng khu phố đăng). Mặc định "Toàn phường". */
  scope?: string;
};

export const ALL_WARD = "Toàn phường";

export function ScopeTag({ scope }: { scope?: string }) {
  const s = scope ?? ALL_WARD;
  return <span className={`scope-tag ${s === ALL_WARD ? "all" : "ward"}`}>{s}</span>;
}

export function NewsDetail({ item, onBack, go, topTitle = "Tin tức - Sự kiện", dateLabel }: { item: NewsItem; onBack: () => void; go: (s: Screen) => void; topTitle?: string; dateLabel?: string }) {
  return (
    <div className="screen news-screen">
      <Topbar title={topTitle} onBack={onBack}/>
      <div className="news-detail">
        {item.image ? <img className="news-hero news-hero-img" src={item.image} alt={item.title}/> : <div className={`news-hero ${item.tone}`}><div className="news-building"/><div className="news-tree"/></div>}
        <div className="news-tags"><ScopeTag scope={item.scope} /><span className="news-cat">{item.category}</span></div>
        <h1 className="news-detail-title">{item.title}</h1>
        <div className="news-date"><Icon name="calendar" size={13}/>{dateLabel ? `${dateLabel} ` : ""}{item.date} · {item.author ?? "UBND phường Phú An"}</div>
        <p className="news-summary">{item.summary}</p>
        {item.body.map((para, i) =>
          para.startsWith("## ") ? <h2 className="news-h2" key={i}>{para.slice(3)}</h2>
          : para.startsWith("• ") ? <p className="news-para news-bullet" key={i}>{para.slice(2)}</p>
          : <p className="news-para" key={i}>{para}</p>
        )}
      </div>
      <BottomNav active="Trang chủ" go={go}/>
    </div>
  );
}
