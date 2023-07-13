module.exports = {
  generalErrorHandler (err, req, res, next) {
    // 判斷傳入的 err 是不是一個 Error 物件
    // 如果是，Error 物件裡面會有屬性 name 和 message，那麼就利用快閃訊息把值印出來給使用者看
    if (err instanceof Error) {
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', `${err}`)
    }
    // 把使用者導回錯誤發生的前一頁
    res.redirect('back')
    // 把 Error 物件傳給下一個error handler，繼續處理資料庫出錯、伺服器運作錯誤、網路連線失敗...等狀況
    next(err)
  }
}
