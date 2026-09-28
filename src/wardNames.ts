/** Tên 15 khu phố phường Phú An (theo thứ tự mã khu phố 1–15). Dùng chung cho mọi module. */
export const WARD_NAMES = [
  "Khu phố Tân An 1",
  "Khu phố Tân An 3",
  "Khu phố Tân An 5",
  "Khu phố Tân An 7",
  "Khu phố Tân An 8",
  "Khu phố Hiệp An 1",
  "Khu phố Hiệp An 3",
  "Khu phố Hiệp An 4",
  "Khu phố Hiệp An 5",
  "Khu phố Hiệp An 6",
  "Khu phố An Thuận",
  "Khu phố Phú Thuận",
  "Khu phố Bến Giảng",
  "Khu phố Phú Thứ",
  "Khu phố Bến Liễu",
];

/** Tên rút gọn (bỏ chữ "Khu phố"), dùng cho nhãn lọc. */
export const shortWard = (name: string) => name.replace(/^Khu phố /, "");
