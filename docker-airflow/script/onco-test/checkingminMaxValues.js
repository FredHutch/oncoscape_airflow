/* 
  Checking Minmum/Maximum values of each collection or     
*/
console.time();
const mongoose = require('mongoose');
const fs = require("fs");
const u = require("underscore");
const asyncLoop = require('node-async-loop');
const helper = require("/usr/local/airflow/docker-airflow/onco-test/testingHelper.js");
const manifest = require("/usr/local/airflow/docker-airflow/onco-test/manifest_arr.json");
const dataTypeMapping = require("/usr/local/airflow/docker-airflow/onco-test/lookup_dataTypes.json");
var xena_dataTypes = dataTypeMapping.map(function(m){return m.dataType;});
var xena_dataTypes_included = dataTypeMapping.filter(function(m){return m.class== 'cnv' || m.class== 'mut01' || m.class == 'cnv_thd' || m.class == 'expr'}).map(function(m){return m.dataType;});
var xena_dataTypes_excluded = u.difference(xena_dataTypes, xena_dataTypes_included);
var dataType = u.difference(manifest.map(function(m){return m.dataType;}).unique(), xena_dataTypes_excluded);
var manifest_xena_dataTypes = manifest.filter(function(m){return m.source == 'ucsc xena'}).map(function(m){return m.dataType;}).unique();
var dataTypes_inManifestXena_notInXena = u.difference(manifest_xena_dataTypes, xena_dataTypes);
var dataType = u.difference(dataType, dataTypes_inManifestXena_notInXena);
var dataType_length = dataType.length;
var db, collection;
var elem = {};
var final_result = [];
var ptdegree;
var col;
var r;

// Connect To Database
var mongo = function(mongoose){
  return new Promise(function(resolve, reject) {
    var connection = mongoose.connect( 
      'mongodb://oncoscape-dev-db1.sttrcancer.io:27017,oncoscape-dev-db2.sttrcancer.io:27017,oncoscape-dev-db3.sttrcancer.io:27017/tcga?authSource=admin', {
             db: { native_parser: true },
             server: { poolSize: 5, reconnectTries: Number.MAX_VALUE,socketOptions: { keepAlive: 3000000, connectTimeoutMS: 300000, socketTimeoutMS: 300000}},
             replset: { rs_name: 'rs0', socketOptions: { keepAlive: 3000000, connectTimeoutMS: 300000, socketTimeoutMS: 300000}},
             user: 'oncoscapeRead',
             pass: 'i1f4d9botHD4xnZ'
         });
       mongoose.connection.on('connected', function() {
        resolve(mongoose.connection.db);
       });
  });
};

// Create FileStream
var filestream = function(fs){
  return new Promise(function(resolve, reject){
  var stream = fs.createWriteStream("/usr/local/airflow/docker-airflow/onco-test/CheckingMinMaxValues.json",{  
        flags: 'w',
        defaultEncoding: 'utf8'
      });
      stream.on("open",function(){
        resolve(stream);
      });
  });
};


var IN = 1;
var promiseFactory = function(db, d, file){
    
    return new Promise(function(resolve, reject){
        var collection = d.collection;
        var type = d.dataType;
        var disease = d.dataset;
        // type = type.trim().toUpperCase();
        // switch(type){
        //     case "MUT":
        //     case "MUT01":
        //     case "METHYLATION":
        //     case "RNA":
        //     case "PROTEIN":
        //     case "CNV":
        //     case "PSI": 
                console.log("test", IN++);
                var ind = 0;
                console.log(collection);
                db.collection(collection).find().each(function(err, doc){
                    //console.log(doc.id);
                    if(doc != null && doc.id != null){
                        var u = doc.id;
                        var keys = Object.keys(doc.data);
                        var doc_length = keys.length;
                        //console.log(keys);
                        var max = doc.data[keys[0]];
                        var min = doc.data[keys[0]];      
                        for(var i = 0; i<doc_length; i++){
                            if(typeof(doc.data[keys[i]]) == "string"){
                                if(doc.data[keys[i]].toUpperCase()>max){
                                    max = doc.data[keys[i]];
                                }
                                if(doc.data[keys[i]].toUpperCase()<min){
                                    min = doc.data[keys[i]];
                                }
                            }else{
                                if(doc.data[keys[i]]>max){
                                    max = doc.data[keys[i]];
                                }
                                if(doc.data[keys[i]]<min){
                                    min = doc.data[keys[i]];
                                }
                            }  
                        }
                        if(max != doc.max || min != doc.min) {
                            console.log(max);
                            console.log(doc.max);
                            console.log(max == doc.max);
                            console.log(ind++);
                            var elem =  {};
                            elem.collection = collection;
                            elem.recordedMax = doc.max;
                            elem.calculatedMax = max;
                            elem.recordedMin = doc.min;
                            elem.calculatedMin = min;
                            file.write(JSON.stringify(elem, null, 4));
                            file.write(",");
                        }   
                    }else{
                        resolve();
                    }
                }); 
            //     break;
            // }
        });
  };

Promise.all([mongo(mongoose),filestream(fs)]).then(function(response){
    var db = response[0];
    var file = response[1];
    var index = 0;
    file.write("[");
    var manifest_molecular = manifest.filter(function(m){
        return xena_dataTypes_included.contains(m.dataType);
        // return m.dataType == "mut" || m.dataType == "methylation" || m.dataType == "rna" || m.dataType == "protein" || m.dataType == "cnv" || m.dataType == "psi";
    });
    manifest_molecular = manifest_molecular.splice(0, 10);
    asyncLoop(manifest_molecular, function(d, next){ 
        promiseFactory(db, d, file).then(function (err){
                if (err)
                {
                    console.log(err);
                    return;
                }
                next();
            });
        }, function (err){
        if (err)
        {
            console.error('Error: ' + err.message);
            return;
        }
        file.write("]");
        console.log('Finished!');
        console.timeEnd(); // 
    });
  
});
