const fs = require('fs') // 引入 fs 模組
const localFileHandler = file => {
  // 此函式回傳一個 Promise 以便進行後續處理
  return new Promise((resolve, reject) => {
    // 傳入的 file 是 multer 處理完的檔案，如果 file 不存在，直接 resolve 並跳出函式
    if (!file) return resolve(null)
    // 設定要儲存圖片的檔案位址
    const fileName = `upload/${file.originalname}`
    return fs.promises
      .readFile(file.path)
      .then(data => fs.promises.writeFile(fileName, data)) // 把檔案複製一份到 upload 資料夾底下
      .then(() => resolve(`/${fileName}`))
      .catch(err => reject(err))
  })
}
module.exports = {
  localFileHandler
}
