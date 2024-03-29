const express = require("express");
// const app = express();
const fs = require("fs");
const cors = require('cors')

/* var mysql = require('mysql')

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1107@oghrMNDe",
  database: "vflix",
  multipleStatements: true
}); */

const body_parser = require('body-parser');
const app = express().use(body_parser.json());
app.use(cors());

app.get("/", function (req, res) {
  return res.status(403).send("Хандах эрхгүй!");
});  

app.get("/video/:name/:size/:token/:expires", function (req, res) {
  const {name, size, token, expires} = req.params;
  // return res.send({name, size, token, expires});
  // const allowed = ['http://localhost/', 'https://neontoon.mn/', 'https://www.neontoon.mn/'];
  // if(!allowed.includes(req.headers.referer)) return res.status(403).send("Хандах эрхгүй!");

  let range = req.headers.range
  // console.log('Range 1', req.get('Range'))
  if (!range) range = 'bytes=0-'

  // console.log('Range', range)
  const videoPath = `../videos/${name}_${size}.mp4`;
  // const videoPath = `../videos/${type}/${name}_${size}.mp4`;
  const videoSize = fs.statSync(videoPath).size;
  console.log('videoSize', videoSize);
  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  console.log('Start - End', start + '-' + end)
  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
    "Access-Control-Allow-Origin":"*"
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

/* app.post("/message", async function (req, res) {
  const { msg, token } = req.body
  if(token !== "c9d8bba5244022fabf59d0aa7a5edf0dfbf51338") return res.send({ result: false })
  var amount = msg.match(/(?<=ORLOGO:).*?(?=.00MNT)/i)
  var userId = msg.match(/(?<=utga:)([0-9]+)/i)
  if(!amount || !userId) return res.send({ result: false })
  amount = amount[0].replace(/,/g, '')
  amount = parseInt(amount)
  userId = parseInt(userId[0])
  const d = new Date()
  let plan = []
  try {
    connection.query(`SELECT * from plan where price=${amount}`, function (error, results) {
      if (error) {
        console.log('onError85', error)  
      } 
      console.log('results', results)
      plan = results[0]
      if(!plan) return false
      console.log('plan', plan)
      const today = Math.round(d.getTime() / 1000)
      const till = Math.round(d.setMonth(d.getMonth() + plan.months) / 1000)
      const plan_id = plan.plan_id
      const user_id = userId
      const paid_amount = amount
      const payment_timestamp = today
      const timestamp_from = today
      const timestamp_to = till
      const status = 1
      var sql = `INSERT INTO subscription (plan_id, user_id, price_amount, paid_amount, payment_timestamp, timestamp_from, timestamp_to, status)`
      sql += `VALUES (${plan_id}, ${user_id}, ${paid_amount}, ${paid_amount}, ${payment_timestamp}, ${timestamp_from}, ${timestamp_to}, ${status})`
      connection.query(sql, function (error, results) {
        if (error) {
          console.log('onError102', error)  
        } 
        if(results.insertId < 101){
          console.log('plan.months', plan.months)
          const d2 = new Date()
          const promo = Math.round(d2.setMonth(d2.getMonth() + plan.months + 1) / 1000)
          console.log('promo', promo)
          var updateSql = `UPDATE subscription set timestamp_to=${promo} WHERE subscription_id=${results.insertId}`;
          connection.query(updateSql, function (error2, results) {
            if (error2) {
              console.log('onUpdateError', error2)  
            } 
          })
        }
      })
    })    
  } catch (error) {
    console.log('error', error)
  }

  return res.send({ result: true, amount, userId })
}) */

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
