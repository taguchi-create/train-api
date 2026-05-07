const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

/*
  恵み野 → 札幌方面
*/
const URL_SAPPORO =
"https://transit.yahoo.co.jp/station/time/20567/?gid=90";

/*
  恵み野 → 千歳・苫小牧方面
*/
const URL_DOWN =
"https://transit.yahoo.co.jp/station/time/20567/?gid=91";

function parseTimes(html){

  const $ = cheerio.load(html);

  const list = [];

  /*
    Yahooは dt/dd 構造
  */

  $("dt").each((i,el)=>{

    const hour = $(el).text().trim();

    const next = $(el).next("dd");

    next.find("li").each((i2,li)=>{

      const minute = $(li).find(".minute").text().trim();

      if(minute){

        list.push(`${hour}:${minute}`);

      }

    });

  });

  return list;
}

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

app.get("/api/train", async(req,res)=>{

  try{

    const up = await axios.get(URL_SAPPORO);
    const down = await axios.get(URL_DOWN);

    const upList = parseTimes(up.data);
    const downList = parseTimes(down.data);

    res.json({

      sapporo: getNextTwo(upList),
      chitose: getNextTwo(downList),
      tomakomai: getNextTwo(downList),

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
