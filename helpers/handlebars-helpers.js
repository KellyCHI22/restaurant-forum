const dayjs = require('dayjs'); // 載入 dayjs 套件
module.exports = {
  currentYear: () => dayjs().year(), // 取得當年年份作為 currentYear 的屬性值，並導出
  ifCond: function (a, b, options) {
    // 若 a 和 b 相等，會回傳 options.fn(this)，不相等則回傳 options.inverse(this)
    return a === b ? options.fn(this) : options.inverse(this);
  },
};
