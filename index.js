const express = require("express");
const sass = require('sass');
var parser = require('body-parser');
const minify = require('@node-minify/core');
const cleanCSS = require('@node-minify/clean-css');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const csv = require('fast-csv');
const fs = require("fs");
const readline = require("readline");

let output;
let commercial;
let personal;
let cartypes;


const result = sass.compile('public/css/style.scss');



fs.writeFile('public/css/style.css', result.css, err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
  minify({
    compressor: cleanCSS,
    input: 'public/css/style.css',
    output: 'public/css/style.min.css',
    callback: function (err, min) {
  
    }
  });
});


app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.use(express.static(__dirname + '/public'));
app.use(function(req,res,next){
  res.locals.userValue = null;
  next();
})
app.set('view engine', 'ejs')

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});
app.use(function(req,res,next){
  res.locals.userValue = null;
  next();
})
app.get('/', (req, res) => {

  res.render('pages/index', {
    commercial:commercial,cartypes:cartypes, personal:personal
  })
})






let db = new sqlite3.Database('./db/vehicles.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the vehicles database.');
  });

  
  const setCommercialOutput = (rows) => {
      commercial = rows;
      console.log(rows.length);
  }

  const setPersonalOutput = (rows) => {
    personal = rows;
    console.log(rows.length);
}
  const setCarType = (rows) => {
    cartypes = rows;
}
db.serialize(function () {
  db.all("select * from commercial", function (err, tables) {
    setCommercialOutput(tables);
  });
});

db.serialize(function () {
  db.all("select * from personal", function (err, tables) {
    setPersonalOutput(tables);
  });
});
db.serialize(function () {
  db.all("select distinct(type) from (select * from commercial union all select * from personal) ORDER BY type", function (err, tables) {
    setCarType(tables);
  });
});

  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });


//let data = [];

  // fs.createReadStream('./datasets/deregpersonal.csv')
  // .pipe(csv.parse({ headers: true }))
  // .on('error', error => console.error(error))
  // .on('data', row => {data.push(row)})
  // .on('end', () => {
  //   for(const row of data){
  //     console.log(row);
  //   }
  // });