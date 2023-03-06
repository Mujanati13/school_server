const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require('multer');

const app = express();
const cors = require("cors");
const upload = multer({ dest: 'uploads/' });
const ffmpeg = require('fluent-ffmpeg');
const fileupload = require("express-fileupload");

app.use(express.static("files"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileupload());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "Face",
  password: "simo1234",
});

// Connect to the MySQL server
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL server: " + error.stack);
    return;
  }
  console.log("Connected to MySQL server as ID " + connection.threadId);
});

function findClosestDate(dates) {
  const currentDate = new Date();
  let closestDate = null;
  let smallestDiff = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < dates.length; i++) {
    if (
      currentDate.getFullYear() === dates[i].getFullYear() &&
      currentDate.getMonth() === dates[i].getMonth() &&
      currentDate.getDate() === dates[i].getDate()
    ) {
      const diff = Math.abs(currentDate - dates[i]);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestDate = dates[i];
      }
    }
  }
  return closestDate;
}

function isStudentOnTime(classTime, arrivalTime) {
  const diffInMinutes = (arrivalTime - classTime) / 1000 / 60;
  console.log(diffInMinutes);
  const isWithin30Minutes = Math.abs(diffInMinutes) <= 30;
  if (isWithin30Minutes) {
    return true;
  } else {
    return false;
  }
}

// Define a route that queries the database
app.get("/", (req, res) => {});

app.post("/upload", (req, res) => {
  const newpath = __dirname + "/uploads/";
  const file = req.files.file;
  const filename = file.name;
 
  file.mv(`${newpath}${filename}`, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed", code: 200 });
      console.log(err);
    }
    res.status(200).send({ message: "File Uploaded", code: 200 });
  });
});

app.get("/api/absence", (req, res) => {
  const userId = req.query.userId;
  var query = `select * from absence where user_id = '${userId}'`;

  connection.query(query, (err, docs) => {
    if (docs) {
      console.log(docs);
      res.send(JSON.stringify(docs));
    } else {
      console.log(err);
    }
  });
});

app.get("/api/presence", (req, res) => {
  const userId = req.query.userId;
  var query2 = `select * from presence where user_id = '${userId}'`;

  connection.query(query2, (err, docs1) => {
    if (docs1) {
      res.send(JSON.stringify(docs1));
    }
  });
});

app.get("/api/session", (req, res) => {
  var query2 = "select * from session";
  connection.query(query2, (err, docs1) => {
    if (docs1) {
      res.send(JSON.stringify(docs1));
    }
  });
});

app.get("/api/sessionAdmin", (req, res) => {
  var userId = req.query.userId;
  console.log(userId);
  var query2 = `select * from session where session_id = '${userId}'`;
  connection.query(query2, (err, docs1) => {
    if (docs1) {
      console.log(docs1);
      res.send(JSON.stringify(docs1));
    } else {
      console.log(err);
    }
  });
});

app.post("/api/newface", (req, res) => {
  const label = req.query.name;

  const listDate = [];
  var query = "select * from schedule";
  connection.query(query, (err, docs) => {
    if (docs) {
      for (var i = 0; i < docs.length; i++) {
        listDate.push(new Date(docs[i].startDate));
      }
      const matchD = findClosestDate(listDate);
      if (matchD != null) {
        console.log(matchD);
        if (isStudentOnTime(matchD, new Date())) {
          console.log("done!");
          var insertQyery = `insert into presence(user_id , title . Pdate , join_date) values('${label}','title','${new Date().getFullYear()}','${new Date().getDate()}')`;
          /* connection.query(insertQyery, (err, docs) => {
            if (docs) {
            } else if (err) {
            }
          }); */
          console.log(label);
        } else {
          console.log("incorrect time!");
        }
      }else {
        console.log("incorrect date !");
      }
    } else if (err) {
      console.log(err);
    }
  });
});

console.log(new Date().getDate());
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
