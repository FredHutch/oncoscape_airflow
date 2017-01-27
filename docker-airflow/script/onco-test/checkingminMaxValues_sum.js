var fs = require('fs')

const jsonfile = require("jsonfile-promised");
const u = require("underscore");
const helper = require("/usr/local/airflow/docker-airflow/onco-test/testingHelper.js");
var minMaxErrors;
var minMaxErrors_1;
var minMaxErrors_2;
var minMaxErrors_3;
var minMaxErrors_4;
var minMaxErrors_5;
var minMaxErrors_6;
fs.readFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_1.json", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  result = data.replace(/,]/g, ']');
  fs.writeFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_1m.json", result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
  minMaxErrors_1 = require("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_1m.json");
});
fs.readFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_2.json", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  result = data.replace(/,]/g, ']');
  fs.writeFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_2m.json", result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
  minMaxErrors_2 = require("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_2m.json");
});
fs.readFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_3.json", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  result = data.replace(/,]/g, ']');
  fs.writeFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_3m.json", result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
  minMaxErrors_3 = require("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_3m.json");
});
fs.readFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_4.json", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  result = data.replace(/,]/g, ']');
  fs.writeFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_4m.json", result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
  minMaxErrors_4 = require("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_4m.json");
});
fs.readFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_5.json", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  result = data.replace(/,]/g, ']');
  fs.writeFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_5m.json", result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
  minMaxErrors_5 = require("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_5m.json");
});
fs.readFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_6.json", 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  result = data.replace(/,]/g, ']');
  fs.writeFile("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_6m.json", result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
  minMaxErrors_6 = require("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues_6m.json");
  minMaxErrors_v2 = minMaxErrors_1.concat(minMaxErrors_2, minMaxErrors_3, minMaxErrors_4, minMaxErrors_5, minMaxErrors_6);
  jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/minMaxErrors_v2.json", minMaxErrors_v2, {spaces:4}, function(err){ console.error(err);});
});




