const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const URL = "https://transit.yahoo.co.jp/station/time/20567/?gid=90";

app.get("/api/train", async (req, res) => {

  try{

    const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage"
  ]
});

    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: "networkidle2" });

    // 時刻取得
    const times = await page.evaluate(() => {

      const result = [];

      document.querySelectorAll("li").forEach(el => {

        const t = el.innerText;

        if(t.match(/^\d{2}:\d{2}/)){
          result.push(t.substring(0,5));
        }

      });

      return result;

    });

    await browser.close();

    const now = new Date();
    const current = now.getHours()*60 + now.getMinutes();

    const next = [];

    for(const t of times){

      const [h,m] = t.split(":").map(Number);
      const total = h*60 + m;

      if(total >= current){
        next.push(t);
      }

      if(next.length >= 2) break;
    }

    res.json({
      sapporo: next,
      chitose: next,
      tomakomai: next,
      delay: false
    });

  }catch(e){

    console.log(e);

    res.json({
      sapporo:["--:--","--:--"],
      chitose:["--:--","--:--"],
      tomakomai:["--:--","--:--"],
      delay:true
    });

  }

});

app.listen(PORT, ()=>console.log("OK"));
