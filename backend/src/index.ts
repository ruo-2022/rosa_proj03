//告訴程式要用express(框架)，沒有import程式不知道express是什麼，會直接報錯，程式無法啟動
import express from "express";//不寫會直接報錯，程式無法啟動
//ts專用，對程式執行沒有影響，是型別檢查
//寫(req:Request, res:Response)時，TS就不會知道這些型別
//失去自動補全和錯誤檢查，容易寫錯程式
import type { Request, Response } from "express";//不寫程式可以執行，但失去型別檢查與補全
//process.env.PORT不會讀到.env，只能使用程式裏面硬寫的數字
//例 const port = 3002;
//環境變數就沒辦法修改了，程式在跑不同環境就不方便
import "dotenv/config";//不寫就不能讀.env設定，必須手動寫死設定值

//建立伺服器主物件
const app = express();

//設定使用EJS作為樣板引擎
app.set("view engine", "ejs");

// 設定靜態內容資料夾
app.use(express.static("public"));
// 解析 JSON body 的中間件
app.use(express.json());
// 解析 URL-encoded body 的中間件
app.use(express.urlencoded({ extended: true }));

//設定首頁GET路由
app.get("/", (req:Request, res:Response)=>{
res.send("首頁");
});

//啟動伺服器
const port = process.env.PORT || 3002;
app.listen(port, ()=>{
    console.log(`Express + TS 啟動 http://localhost:${port}`);
});