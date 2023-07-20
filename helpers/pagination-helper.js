// 計算偏移量: 每一頁要從編號第幾的 item 開始
const getOffset = (limit = 10, page = 1) => (page - 1) * limit;

const getPagination = (limit = 10, page = 1, total = 50) => {
  // 總共有幾頁
  const totalPage = Math.ceil(total / limit);
  // 假如總共有 5 頁，這個陣列就會是 [1, 2, 3, 4, 5]
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1);
  // 當前是第幾頁。這一行計算公式裡面有兩層三元運算，要從後面一組開始讀 "page > totalPage ? totalPage : page"
  // let currentPage
  // if (page < 1) {
  //   currentPage = 1
  // } else if (page > totalPage) {
  //   currentPage = totalPage
  // } else {
  //   currentPage = page
  // }
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page;
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1; // 前一頁是第幾頁
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1; // 後一頁是第幾頁
  return {
    pages,
    totalPage,
    currentPage,
    prev,
    next,
  };
};
module.exports = {
  getOffset,
  getPagination,
};
