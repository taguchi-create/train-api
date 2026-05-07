const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

/*
  Yahoo路線情報
  恵み野駅
*/

const URL =
"https://transit.yahoo.co.jp/station/time/20567/?gid=90";

app.get("/api/train", async(req,res)=>{

  try{

    const response =
      await axios.get(URL);

    const $ =
      cheerio.load(response.data);

    /*
      時刻抽出
    */

    const times = [];

    $(".time").each((i,el)=>{

      const t =
        $(el).text().trim();

      if(t.match(/^\d{2}$/)){

        times.push(t);
      }

    });

    /*
      現在時刻
    */

    const now = new Date();

    const current =
      now.getHours()*60 + now.getMinutes();

    const list = [];

    for(let i=0;i<times.length;i+=2){

      const hh = times[i];
      const mm = times[i+1];

      if(!hh || !mm) continue;

      const time =
        `${hh}:${mm}`;

      const [h,m] =
        time.split(":").map(Number);

      const total =
        h*60+m;

      if(total >= current){

        list.push(time);

      }

    }

    res.json({

      sapporo:[
        list[0] || "--:--",
        list[1] || "--:--"
      ],

      chitose:[
        list[2] || "--:--",
        list[3] || "--:--"
      ],

      tomakomai:[
        list[4] || "--:--",
        list[5] || "--:--"
      ],

      delay:false

    });

  }catch(err){

    console.log(err);

    res.json({

      sapporo:["--:--","--:--"],
      chitose:["--:--","--:--"],
      tomakomai:["--:--","--:--"],
      delay:true

    });

  }

});

app.listen(PORT,()=>{

  console.log("Server Start");

});