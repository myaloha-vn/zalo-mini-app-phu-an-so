import { useState } from "react";
import { Icon, Tap, DuotoneIcon, BottomNav, Topbar, UtilitySheet, UtilityTile, UTILITY_GROUPS, openUtility, type Screen, type IconName, type Utility } from "./ui";
import KhuPhoModule from "./KhuPho";
import AnSinhModule from "./AnSinh";
import DuLichModule from "./DuLich";
import PhanAnhModule from "./PhanAnh";
import GioiThieuModule from "./GioiThieu";
import DangBaiScreen, { userPosts } from "./DangBai";
import { NewsDetail, type NewsItem } from "./news";
import quocHuy from "./assets/quoc-huy.png";
import khuPhoIcon from "./assets/khu-pho-so-v2.png";
import quyHoachIcon from "./assets/tra-cuu-quy-hoach.png";
import anSinhIcon from "./assets/an-sinh-xa-hoi.png";
import bannerImg from "./assets/banner-phu-an-so.jpg";
import tinChuyenDoiSo from "./assets/tin-chuyen-doi-so.jpg";
import tinKhuPhoSo from "./assets/tin-khu-pho-so.jpg";
import tinTiepCongDan from "./assets/tin-tiep-cong-dan.jpg";
import tinChuNhatXanh from "./assets/tin-chu-nhat-xanh.jpg";
import duLichIcon from "./assets/du-lich-phu-an-v2.png";

function Logo() {
  return (
    <div className="logo">
      <img src={quocHuy} alt="Quốc huy Việt Nam" />
    </div>
  );
}

function Header() {
  return (
    <div className="home-header">
      <div className="brand">
        <Logo />
        <div><div className="brand-name">Phú An Số</div><div className="brand-sub">Kết nối chính quyền – Người dân – Công nghệ số</div></div>
      </div>
      <div className="header-actions">
        <Tap className="round-action"><Icon name="bell" /></Tap>
      </div>
    </div>
  );
}

function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 150 105" aria-hidden="true">
      <defs><linearGradient id="building" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#A9D9FF"/><stop offset="1" stopColor="#D8EEFF"/></linearGradient></defs>
      <circle cx="112" cy="25" r="15" fill="#fff" opacity=".72"/>
      <path d="M17 86V57h20v29M40 86V41h26v45M70 86V51h22v35M96 86V32h25v54M124 86V61h15v25" fill="url(#building)" stroke="#78BFFF" strokeWidth="1"/>
      <path d="M49 41V28h9v13M106 32V20h5v12" stroke="#5EAFF2" strokeWidth="3"/>
      <g fill="#fff" opacity=".78"><path d="M45 50h6v5h-6zm10 0h6v5h-6zM45 60h6v5h-6zm10 0h6v5h-6zM101 40h6v5h-6zm9 0h6v5h-6zM101 50h6v5h-6zm9 0h6v5h-6z"/></g>
      <path d="M4 86h143" stroke="#68B5EE" strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 86c7-16 13-16 20 0M77 86c6-13 12-13 18 0" fill="#8FD3B1" opacity=".8"/>
    </svg>
  );
}

const featureCards = [
  { title: "Khu phố số", desc: "Kết nối cộng đồng\nvăn minh, hiện đại", icon: "home" as IconName, img: khuPhoIcon, color: "blue", screen: "khupho" as Screen },
  { title: "Tra cứu quy hoạch", desc: "Thông tin bản đồ\nquy hoạch đô thị", icon: "map" as IconName, img: quyHoachIcon, color: "green", screen: "map" as Screen },
  { title: "An sinh xã hội", desc: "Chính sách dành cho\nngười dân", icon: "people" as IconName, img: anSinhIcon, color: "orange", screen: "social" as Screen },
  { title: "Du lịch Phú An", desc: "Khám phá điểm đến,\nẩm thực, văn hoá", icon: "location" as IconName, img: duLichIcon, color: "purple", screen: "dulich" as Screen },
];



// LƯU Ý: nội dung bài viết dưới đây là NỘI DUNG MINH HOẠ — cần thay bằng bài viết chính thức do UBND phường cung cấp.
const news: NewsItem[] = [
  {
    title: "Phú An đẩy mạnh chuyển đổi số trong phục vụ người dân",
    date: "20/06/2025",
    tone: "news-one",
    image: tinChuyenDoiSo,
    category: "Chuyển đổi số",
    summary: "Phường Phú An tiếp tục triển khai các giải pháp số giúp người dân tiếp cận dịch vụ công và thông tin địa phương nhanh chóng, thuận tiện hơn.",
    body: [
      "Thời gian qua, UBND phường Phú An đã tập trung triển khai nhiều nhiệm vụ chuyển đổi số, lấy người dân làm trung tâm phục vụ. Các thủ tục hành chính thường gặp được hướng dẫn thực hiện trực tuyến, giảm thời gian đi lại và chờ đợi cho người dân.",
      "Ứng dụng Phú An Số trên nền tảng Zalo là kênh kết nối mới giữa chính quyền và người dân. Qua ứng dụng, người dân có thể tra cứu thông tin quy hoạch, chính sách an sinh xã hội, gửi phản ánh kiến nghị và theo dõi tin tức của phường.",
      "Trong thời gian tới, phường sẽ tiếp tục phối hợp với các khu phố tổ chức hướng dẫn người dân, đặc biệt là người cao tuổi, sử dụng các tiện ích số một cách an toàn và hiệu quả.",
    ],
  },
  {
    title: "Ra mắt mô hình “Khu phố số” tại phường Phú An",
    date: "18/06/2025",
    tone: "news-two",
    image: tinKhuPhoSo,
    category: "Khu phố số",
    summary: "Mô hình “Khu phố số” giúp Ban điều hành khu phố và người dân trao đổi thông tin, thông báo và phản ánh nhanh chóng trên môi trường số.",
    body: [
      "Phường Phú An chính thức ra mắt mô hình “Khu phố số”, hướng tới xây dựng cộng đồng dân cư văn minh, hiện đại và gắn kết.",
      "Với mô hình này, mỗi khu phố có không gian riêng trên ứng dụng để đăng tải thông báo, lịch sinh hoạt, hình ảnh hoạt động và tiếp nhận ý kiến của người dân. Ban điều hành khu phố có thể nắm bắt tình hình và phản hồi kịp thời.",
      "Người dân được khuyến khích tham gia, cập nhật thông tin và cùng chung tay xây dựng khu phố xanh – sạch – đẹp – an toàn.",
    ],
  },
  {
    title: "Thông báo lịch tiếp công dân định kỳ tháng 6",
    date: "15/06/2025",
    tone: "news-three",
    image: tinTiepCongDan,
    category: "Thông báo",
    summary: "UBND phường Phú An thông báo lịch tiếp công dân định kỳ trong tháng 6 để tiếp nhận ý kiến, kiến nghị, khiếu nại, tố cáo của người dân.",
    body: [
      "Thực hiện quy định về công tác tiếp công dân, UBND phường Phú An thông báo lịch tiếp công dân định kỳ trong tháng 6.",
      "Địa điểm: Trụ sở tiếp công dân UBND phường Phú An. Thời gian cụ thể được niêm yết tại trụ sở UBND phường và cập nhật trên ứng dụng Phú An Số.",
      "Khi đến làm việc, người dân vui lòng mang theo giấy tờ tùy thân và các tài liệu liên quan đến nội dung trình bày. Người dân cũng có thể gửi phản ánh, kiến nghị trực tuyến qua mục “Phản ánh kiến nghị” trên ứng dụng.",
    ],
  },
  {
    title: "Ra quân “Ngày Chủ nhật xanh” làm sạch môi trường khu dân cư",
    date: "12/06/2025",
    tone: "news-four",
    image: tinChuNhatXanh,
    category: "Hoạt động",
    summary: "Đông đảo đoàn viên, thanh niên và người dân các khu phố cùng tham gia dọn dẹp vệ sinh, khơi thông cống rãnh, trồng thêm cây xanh.",
    body: [
      "Hưởng ứng phong trào xây dựng đô thị văn minh, phường Phú An tổ chức ra quân “Ngày Chủ nhật xanh” tại các tuyến đường, hẻm và khu vực công cộng trên địa bàn.",
      "Các lực lượng đã thu gom rác thải, phát quang bụi rậm, khơi thông cống rãnh và trồng mới cây xanh tại một số điểm. Hoạt động góp phần nâng cao ý thức giữ gìn vệ sinh môi trường của người dân.",
      "UBND phường kêu gọi người dân tiếp tục duy trì thói quen phân loại rác tại nguồn, không xả rác nơi công cộng và phản ánh các điểm ô nhiễm qua ứng dụng Phú An Số.",
    ],
  },
];


function HomeScreen({ go }: { go: (screen: Screen) => void }) {
  const [utils, setUtils] = useState(false);
  const [submenu, setSubmenu] = useState<Utility | null>(null);
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [composing, setComposing] = useState(false);
  if (composing) return <DangBaiScreen onBack={() => setComposing(false)} onPublished={(p) => { setComposing(false); setArticle(p); }}/>;
  if (article) return <NewsDetail item={article} onBack={() => setArticle(null)} go={go}/>;
  return (
    <div className="screen home-screen">
      <Header />
      <div className="scroll-content">
        <div className="hero hero-banner">
          <img src={bannerImg} alt="Chào mừng đến với Phú An Số – Chuyển đổi số vì Nhân dân" />
        </div>
        <div className="search-bar"><Icon name="search" size={19} color="#7890A6"/><span>Tìm kiếm dịch vụ, thông tin...</span></div>

        <div className="feature-grid">
          {featureCards.map((item) => (
            <Tap className={`feature-card ${item.color}`} key={item.title} onClick={() => go(item.screen)}>
              {"img" in item && item.img ? <img className="feature-img" src={item.img} alt="" /> : <DuotoneIcon icon={item.icon} color={item.color}/>}
              <div className="feature-title">{item.title}</div>
            </Tap>
          ))}
        </div>

        <div className="section-heading"><span>Tiện ích nhanh</span><Tap className="view-all" onClick={() => setUtils(true)}>Xem tất cả <Icon name="arrow" size={13}/></Tap></div>
        <div className="quick-row">
          {UTILITY_GROUPS[0].items.map((item) => (
            <UtilityTile key={item.label} item={item} onClick={() => openUtility(item, go, setSubmenu)} />
          ))}
        </div>

        <div className="section-heading news-heading"><span className="news-heading-title">Tin tức - Sự kiện<Tap className="news-pen" onClick={() => setComposing(true)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Đăng bài"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg></Tap></span><Tap className="view-all">Xem tất cả <Icon name="arrow" size={13}/></Tap></div>
        <div className="news-list">
          {[...userPosts, ...news].slice(0, 4 + userPosts.length).map((item) => (
            <Tap className="news-item" key={item.title} onClick={() => setArticle(item)}>
              {item.image ? <img className="news-thumb news-thumb-img" src={item.image} alt=""/> : <div className={`news-thumb ${item.tone}`}><div className="news-building"/><div className="news-tree"/></div>}
              <div className="news-copy"><div className="news-title">{item.title}</div><div className="news-date"><Icon name="calendar" size={12}/>{item.date}</div></div>
            </Tap>
          ))}
        </div>
      </div>
      <BottomNav active="Trang chủ" go={go}/>
      {utils && <UtilitySheet onClose={() => setUtils(false)} go={go}/>}
      {submenu?.submenu && <UtilitySheet onClose={() => setSubmenu(null)} go={go} title={submenu.label} groups={submenu.submenu}/>}
    </div>
  );
}

const PLANNING_URL = "https://gisxaydung.tphcm.gov.vn/tracuuttqh";

function MapScreen({ go }: { go: (s: Screen) => void }) {
  const [loaded, setLoaded] = useState(false);
  const openOriginal = () => window.open(PLANNING_URL, "_blank", "noopener");
  return (
    <div className="screen map-screen">
      <Topbar title="Tra cứu quy hoạch" onBack={() => go("home")} end={<Tap onClick={openOriginal}><Icon name="share" size={20}/></Tap>}/>
      <div className="planning-frame">
        {!loaded && (
          <div className="planning-loading">
            <div className="planning-spinner"/>
            <span>Đang tải bản đồ quy hoạch...</span>
            <Tap className="kp-btn ghost planning-open" onClick={openOriginal}>Mở trang tra cứu gốc</Tap>
          </div>
        )}
        <iframe src={PLANNING_URL} title="Tra cứu thông tin quy hoạch TP.HCM" onLoad={() => setLoaded(true)} allow="geolocation; fullscreen" referrerPolicy="no-referrer-when-downgrade"/>
      </div>
      <Tap className="planning-fallback" onClick={openOriginal}><Icon name="info" size={15}/>Không hiển thị bản đồ? <b>Mở trang tra cứu gốc</b></Tap>
      <BottomNav active="Bản đồ" go={go}/>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  return (
    <main className="app-shell">
      {screen === "home" && <HomeScreen go={setScreen}/>}
      {screen === "map" && <MapScreen go={setScreen}/>}
      {screen === "social" && <AnSinhModule go={setScreen}/>}
      {screen === "khupho" && <KhuPhoModule go={setScreen}/>}
      {screen === "dulich" && <DuLichModule go={setScreen}/>}
      {screen === "phananh" && <PhanAnhModule go={setScreen}/>}
      {screen === "gioithieu" && <GioiThieuModule go={setScreen}/>}
    </main>
  );
}
