import { type Screen } from "./ui";
import { NewsDetail, type NewsItem } from "./news";
import bannerImg from "./assets/banner-phu-an-so.jpg";

/* ---------------- Giới thiệu phường ----------------
   Một bài viết duy nhất, cùng cấu trúc với Tin tức nên cán bộ có thể đăng / sửa như đăng tin.
   LƯU Ý: nội dung dưới đây là KHUNG MẪU. Các chỗ ghi [cần cập nhật] phải thay bằng thông tin chính thức do UBND phường cung cấp.
   Cú pháp nội dung: "## " = tiêu đề mục, "• " = gạch đầu dòng, còn lại là đoạn văn. */

const INTRO: NewsItem = {
  title: "Giới thiệu phường Phú An",
  date: "28/09/2026",
  tone: "news-one",
  image: bannerImg,
  category: "Giới thiệu",
  summary: "Thông tin chung về vị trí, lịch sử, bộ máy chính quyền và thông tin liên hệ của phường Phú An, Thành phố Hồ Chí Minh.",
  body: [
    "## Vị trí địa lý",
    "Phường Phú An thuộc Thành phố Hồ Chí Minh. Phía Bắc giáp [cần cập nhật], phía Nam giáp [cần cập nhật], phía Đông giáp [cần cập nhật], phía Tây giáp [cần cập nhật].",
    "## Diện tích và dân số",
    "• Diện tích tự nhiên: [cần cập nhật] km²",
    "• Dân số: [cần cập nhật] người, [cần cập nhật] hộ gia đình",
    "• Số khu phố: [cần cập nhật]",
    "## Lịch sử hình thành",
    "[cần cập nhật: năm thành lập, văn bản thành lập / sắp xếp đơn vị hành chính, truyền thống và danh hiệu của phường.]",
    "## Bộ máy chính quyền",
    "• Chủ tịch UBND phường: [cần cập nhật]",
    "• Phó Chủ tịch UBND phường: [cần cập nhật]",
    "• Các phòng, bộ phận chuyên môn: [cần cập nhật theo quyết định tổ chức bộ máy hiện hành]",
    "## Định hướng phát triển",
    "Phường Phú An tập trung xây dựng chính quyền số, đô thị văn minh, hiện đại; lấy người dân làm trung tâm phục vụ, đẩy mạnh chuyển đổi số trong cải cách hành chính.",
    "## Thông tin liên hệ",
    "• Trụ sở UBND phường: [cần cập nhật]",
    "• Điện thoại: [cần cập nhật]",
    "• Giờ làm việc: [cần cập nhật]",
    "Người dân có thể gửi phản ánh, kiến nghị trực tuyến qua mục “Phản ánh kiến nghị” trên ứng dụng Phú An Số.",
  ],
};

export default function GioiThieuModule({ go }: { go: (s: Screen) => void }) {
  return <NewsDetail item={INTRO} onBack={() => go("home")} go={go} topTitle="Giới thiệu phường" dateLabel="Cập nhật" />;
}
