/* 
/* 
This is the code to generate ajv.json, the stage I datasource schema validation
requires: mongoose
          ../collection_counts.json.json generated by generate_collections_counts.js
          ../schemas.json
Purposes
        - substratify the entire collections to dataType collections
          and run schemas.json ajv validation on each collection 
          error message at the document level will be reported
*/
console.time();
const mongoose = require("mongoose");
const jsonfile = require("jsonfile");
const u = require("underscore");
const helper = require("/usr/local/airflow/docker-airflow/onco-test/testingHelper.js");
const dataTypeMapping = require("/usr/local/airflow/docker-airflow/onco-test/dev-lookup_dataTypes.json");
const schemas = require("/usr/local/airflow/docker-airflow/onco-test/schemas.json");
const Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});
const asyncLoop = require('node-async-loop');
var manifest = require("/usr/local/airflow/docker-airflow/onco-test/dev-manifest_all.json");
var allCollectionNames = require("/usr/local/airflow/docker-airflow/onco-test/dev-allCollectionNames.json");
var table_name;
var msg_type = {};
var ajvMsg = [];
var passed_elem
var error_elem = [];
var elem = {};
var col_count = 0;
var connection = mongoose.connection;
var multiTypes = ["MDS", "PCA", "edges", "genedegree", "ptdegree"];
var floatClasses = ['expr', 'cnv', 'meth'];
var strClasses = ['mut'];
var indicatorClasses = ['mut01', 'cnv_thd', 'meth_thd'];
//allCollectionNames = allCollectionNames.splice(400, 10);
mongoose.connect(
    'mongodb://oncoscape-dev-db1.sttrcancer.io:27017,oncoscape-dev-db2.sttrcancer.io:27017,oncoscape-dev-db3.sttrcancer.io:27017/tcga?authSource=admin', {
        db: {
            native_parser: true
        },
        server: { poolSize: 5, reconnectTries: Number.MAX_VALUE,socketOptions: { keepAlive: 3000000, connectTimeoutMS: 300000, socketTimeoutMS: 300000}},
        replset: { rs_name: 'rs0', socketOptions: { keepAlive: 3000000, connectTimeoutMS: 300000, socketTimeoutMS: 300000}},
        user: 'oncoscapeRead',
        pass: 'i1f4d9botHD4xnZ'
    });


connection.once('open', function(){
    var db = connection.db; 
    asyncLoop(allCollectionNames, function(c, next){ 
        console.log(c);
        var processNextTable = function(){
          var t = manifest.filter(function(m){
            return m.collection == c;
          }).map(function(m){
            return m.dataType;
          }).unique();
          var dataType;
          var _class; 
          console.log("test" , col_count++);
          var collection = db.collection(c);
          var cursor = collection.find();
          count = 0;
          msg_type = {};
          passed_elem = 0;
          error_elem = [];
          elem = {};
          var schema;
          if(t.length == 1 && t[0] in schemas){
            schema = schemas[t[0]];
            dataType = t[0];
          }else if(t.length == 1 && !(t[0] in schemas)){
            var tt = dataTypeMapping.filter(function(m){return m.dataType == t[0]})[0].schema;
            console.log(tt);
            if(typeof(schemas[tt]) != 'undefined'){
              schema = schemas[tt];
              dataType = tt;
            }
          }else if(c.indexOf("_dashboard") > -1){
            dataType = "diagnosis";
            schema = schemas[dataType];
          }else if(c.indexOf("_color") > -1){
            dataType = "color";
            schema = schemas[dataType];
          }
          if(typeof(dataType) != 'undefined'){
            _class = dataTypeMapping.filter(function(m){return m.dataType == dataType;}).map(function(m){return m.class;});
            if(floatClasses.indexOf(_class) > -1){
              schema = schemas['hugo_sample_num'];
            }else if (strClasses.indexOf(_class) > -1){
              schema = schemas['hugo_sample_str'];
            }else if (indicatorClasses.indexOf(_class) > -1){
              schema = schemas['hugo_sample_indicator'];
            }
          }

          var type = [];
          cursor.each(function(err, item){
                count++;
                if(count%20000 == 0){
                  console.log(count);
                }
                if(item != null){
                  //console.log(item['_id']);
                  if("dataType" in item && multiTypes.contains(item.dataType)){
                    console.log(item.dataType);
                    schema = schemas[item.dataType];
                    dataType = item.dataType;
                    var valid = ajv.validate(schema, item);
                      if(!valid){
                        var e = {};
                        console.log("&&&NEW ERRORS&&&");
                        console.log(ajv.errors);
                        //console.log(ajv);
                        console.log("***PRINT DOCUMENT***");
                        console.log(item['_id']);
                        //console.dir(item);
                        console.log("**END OF ERROR MSG**");
                        e.errorType = ajv.errors; 
                        error_elem.push(e);
                      }
                      else{
                        passed_elem++;
                      }
                      msg_type.collection = c;
                      type.push(dataType);
                      msg_type.type = type.unique();
                      msg_type.disease = c.split('_')[0];
                      msg_type.passedCounts = passed_elem;
                      msg_type.totalCounts = count;
                      msg_type.errors = error_elem;
                      ajvMsg[col_count-1] = msg_type;
                  }else if(typeof(schema) != "undefined"){
                      var valid = ajv.validate(schema, item);
                      if(!valid){
                        var e = {};
                        console.log("&&&NEW ERRORS&&&");
                        console.log(ajv.errors);
                        //console.log(ajv);
                        console.log("***PRINT DOCUMENT***");
                        console.log(item['_id']);
                        //console.dir(item);
                        console.log("**END OF ERROR MSG**");
                        e.errorType = ajv.errors; 
                        error_elem.push(e);
                      }
                      else{
                        passed_elem++;
                      }
                      msg_type.collection = c;
                      msg_type.type = dataType;
                      msg_type.disease = c.split('_')[0];
                      msg_type.passedCounts = passed_elem;
                      msg_type.totalCounts = count;
                      msg_type.errors = error_elem;
                      ajvMsg[col_count-1] = msg_type;
                  }else if(typeof(schema) == "undefined"){
                      msg_type.collection = c;
                      msg_type.type = dataType;
                      msg_type.disease = c.split('_')[0];
                      msg_type.notTested = true;
                      ajvMsg[col_count-1] = msg_type;
                  }
                }else{
                  next();
                }
              });
        };
        processNextTable(); 
      },  function (err)
      {
          if (err)
          {
              console.error('Error: ' + err.message);
              return;
          }
          ajvMsg = ajvMsg.filter(function(m){return m != null;});
          var ajvMsg_v2 = ajvMsg.map(function(a){
              var elem = {};
              console.log(a.collection);
              if(a!=null && 'errors' in a){
                  elem.collection = a.collection;
                  elem.type = a.type;
                  elem.disease = a.disease;
                  elem.passedCounts = a.passedCounts;
                  elem.totalCounts = a.totalCounts;
                  elem.passedRate = a.passedCounts/a.totalCounts;
                  elem.errorMessage = helper.nestedUniqueCount(a);
              }else{
                  elem = a;
              }
              return elem;
          });
          jsonfile.writeFile("/usr/local/airflow/docker-airflow/onco-test/dev_ajv_tcga.json", ajvMsg_v2, {spaces: 4}); 
          console.log('Finished!');
          console.timeEnd();
          connection.close();
      });
    
});


