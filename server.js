const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

/*
  駅探（恵み野）
*/
const URL =
"https://ekitan.com/timetable/railway/line-station/111-31/d1";

/*
  時刻抽出
*/
function parseTimes(html){

  const $ = cheerio.load(html);

  const list = [];

  $(".time").each((i, el)=>{

    const t = $(el).text().trim();

    if(t.match(/^\d{2}:\d{2}$/)){
      list.push(t);
    }

  });

  return list;
}

/*
  次の2本
*/
function getNextTwo(list){

  const now = new Date();
  const current = now.getHours()*60 + now.getMinutes();

  const result = [];

  for(const t of list){

    const [h,m] = t.split(":").map(Number);
    const total = h*60 + m;

    if(total >= current){
      result.push(t);
    }

    if(result.length >= 2) break;
  }

  return result.length ? result : ["--:--","--:--"];
}

app.get("/api/train", async (req, res)=>{

  try{

    const response = await axios.get(URL);

    const list = parseTimes(response.data);

    const next = getNextTwo(list);

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

app.listen(PORT, ()=>{

  console.log("Server running");

});
