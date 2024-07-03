var express = require("express");
var router = express.Router();
var fileUpload = require("express-fileupload");
var path = require("path");
var fs = require("fs");
const iconv = require("iconv-lite");
const connection = require("../db/db");

router.use(
  fileUpload({
    createParentPath: true, //해당 폴더를 자동으로 생성하는지 선택하는 옵션
    uriDecodeFileNames: true, //  URI 디코딩
    limits: { fileSize: 50 * 1024 * 1024 }, //50Mb 제한
    abortOnLimit: true, //50M 초과 시 Http413 반환
    useTempFiles: false,
    tempFileDir: path.join(__dirname + "/../public", "img"),
  })
);

/* 항로표지 정보 그리기용 */
router.get("/routeSignList", async function (req, res, next) {
  // var sql = ` SELECT *
  //             FROM ROUTESIGN_INFO `;
  let sql = ` SELECT A.*, CASE WHEN B.SIGN_NM IS NULL THEN 'NO' ELSE 'YES' END AS FLG, B.BASE_DT
              FROM routesign_info A
              LEFT JOIN (SELECT SIGN_NM, MAX(BASE_DT) AS BASE_DT
                      FROM route_result_info
                      GROUP BY SIGN_NM) B ON A.SIGN_NM = B.SIGN_NM
              ORDER BY A.SIGN_NM `;
  // var sql = ` SELECT *, CASE WHEN B.ROUTE_ID IS NULL THEN 'NO' ELSE 'YES' END AS FLG
  //               FROM routesign_info A
  //               LEFT JOIN (	SELECT ROUTE_ID
  //                               FROM route_attach_file
  //                               GROUP BY ROUTE_ID ) B ON B.ROUTE_ID = A.SIGN_CD
  //               ORDER BY A.SIGN_NM `;
  // connection.query(sql, function (err, rows) {
  //   if (err) throw err;

  //   res.send(rows);
  // });
  connection((conn) => {
    conn.query(sql, function (err, rows, fields) {
      if (!err) {
        res.send(rows);
      } else {
        console.log("err:" + err);
        res.send(err);
      }
    });
    conn.release();
  });
});

let routeSignId;
/* 항로표지 정보 가져오기 */
router.get("/routeSignInfo/:routeCd", function (req, res, next) {
  routeSignId = req.params.routeCd;
  var sql = ` CALL ROUTE_SIGN_INFO_QUERY('${req.params.routeCd}'); `;
  connection((conn) => {
    conn.query(sql, function (err, rows, fields) {
      if (err) return err;

      let resultData = [];
      resultData.push(rows[0][0]);
      resultData.push(rows[1][0]);
      res.send(resultData);
    });
    conn.release();
  });
});

function signData(siginCd) {
  let sql = `select * from route_result_info where sign_cd = ${siginCd}`;
  return new Promise((resolve, reject) => {
    connection((conn) => {
      conn.query(sql, function (err, rows, fields) {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
      conn.release();
    });
  });

  //return data;
}

//이미지 가져오기
//router.get('/routeSignImg/:routeCd/:routeSeq', function(req, res, next) {
router.get("/routeSignImg/:routeCd", function (req, res, next) {
  let sql = `CALL route_result_info(${req.params.routeCd})`;
  //AND ROUTE_SEQ = '${req.params.routeSeq}'; `;
  connection((conn) => {
    conn.query(sql, function (err, rows, fields) {
      if (err) return err;

      let resultData = [];

      resultData.push(rows[0]); //이미지
      resultData.push(rows[1]);
      resultData.push(rows[2]);

      resultData.push(rows[3]);
      resultData.push(rows[4]);
      res.send(resultData);
    });
    conn.release();
  });
});

//내용 DB에 저장
async function saveData2(data, signCd) {
  console.log(data, signCd);
  let totCnt = 0;
  let txtData = data;

  if (data != "") {
    try {
      txtData = JSON.parse(txtData);
    } catch (e) {
      return;
    }

    txtData = txtData.Segmentation;
    //console.log(txtData);

    for (let tr of txtData) {
      //console.log(tr.class);
      if (tr.class != undefined) {
        let type = "";
        if (tr.class == "minjogae") {
          type = "민조개";
        } else if (tr.class == "honghap") {
          type = "홍합";
        }
        var sql = `INSERT INTO route_result_info (sign_cd, sub_seq, class, cnt, per, insert_dt)
                     VALUES(${signCd}, (SELECT COUNT(*) + 1
                                        FROM route_result_info a
                                        WHERE sign_cd = ${signCd}), '${type}', ${tr.total_area}, 0, now()) `;
        connection.query(sql, function (err, rows) {
          if (err) throw err;

          console.log("1 record inserted");
        });
      }
    }
  }
}

//내용 DB에 저장
async function saveData(fileName, signCd) {
  var txtRelPath = `C:\\KMOU\\routeImage\\dataset\\result`;
  let realPath = path.join(txtRelPath, fileName);

  let txtData = await fs.readFileSync(realPath, "utf8");
  txtData = txtData;
  console.log(txtData);

  let totCnt = 0;

  if (txtData != "") {
    try {
      txtData = JSON.parse(txtData);
    } catch (e) {
      return;
    }

    txtData.forEach((product) => {
      totCnt += Number(product.CNT);
    });

    for (let tr of txtData) {
      var sql = `INSERT INTO route_result_info (sign_cd, sub_seq, class, cnt, per, insert_dt)
                     VALUES(${signCd}, (SELECT COUNT(*) + 1
                                        FROM route_result_info a
                                        WHERE sign_cd = ${signCd}), '${tr.class}', ${tr.CNT}, ${tr.PAR}, now()) `;
      connection.query(sql, function (err, rows) {
        if (err) throw err;

        console.log("1 record inserted");
      });
    }
  }
}

//파일 업로드
router.post("/imageUpload", async function (req, res, next) {
  console.log("첨부파일업로드");
  if (req.files == null) return;

  var files = [];
  var fileKeys = Object.keys(req.files);

  fileKeys.forEach(function (key) {
    files.push(req.files[key]);
  });

  let nameData = [];

  for (var file of files) {
    // console.log(file);
    // console.log(encodeURIComponent(file.name));
    // console.log('iconviconviconviconviconviconv : ' +iconv.decode(file.name, "utf-8").toString() );

    //var dirPath = path.join('./public', 'uploads/',writer);
    var dirPath = `C:\\\\KMOU\\\\routeImage\\\\dataset\\\\orgin`;
    var dirRelPath = `C:\\KMOU\\routeImage\\dataset\\orgin`;

    var filesaveName = iconv.decode(file.name, "utf-8").toString();
    dirRelPath = dirRelPath + "\\" + filesaveName;
    //console.log(dirRelPath);

    fs.writeFile(dirRelPath, file.data, "binary", function (err) {});

    var result = await fileInfoToDB(routeSignId, filesaveName, file, dirPath);
    nameData.push(filesaveName);

    var fileName = filesaveName.split(".");
    fileName = fileName[0] + ".txt";

    //let data = await roadFileData(dirRelPath);
    // if (data == null) {
    //   return res.status(500).send(null);
    // }

    //saveData(fileName, routeSignId);
    //await saveData2(req.body.resultTxt, routeSignId);

    //console.log(fileName);
    //txtWrite(fileName, req.body.resultTxt);
    //txtWrite(fileName);
  }

  res.status(200).send(nameData);
});

//router.post("/", async function (req, res, next) {

function txtWrite(fileNm, data) {
  var txtRelPath = `C:\\KMOU\\routeImage\\dataset\\result`;
  txtRelPath = txtRelPath + "\\" + fileNm;
  //console.log(data);
  fs.writeFile(
    txtRelPath,
    data,
    //'[{"TITLE" : "파래", "CNT" : "21"}, {"TITLE" : "민조개", "CNT" : "2"}, {"TITLE" : "홍합", "CNT" : "18"}]',
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      //file written successfully
    }
  );
  // fs.exists(txtRelPath, function(exists){
  //     if(exists)
  //     {
  //         fs.writeFile(txtRelPath, '[{"TITLE" : "담치", "CNT" : "100"}, {"TITLE" : "미역", "CNT" : "10"}, {"TITLE" : "미확인", "CNT" : "100"}]', err => {
  //             if (err) {
  //               console.error(err)
  //               return
  //             }
  //             //file written successfully
  //           })
  //     }else{
  //         console.log('없음');
  //     }
  // })
}

//그룹짓기
const groupBy = function (data, key) {
  return data.reduce(function (carry, el) {
    var group = el[key];

    if (carry[group] === undefined) {
      carry[group] = [];
    }

    carry[group].push(el);
    return carry;
  }, {});
};

//txt파일 읽어오기
router.get("/readTxtFile/:routeCd", function (req, res, next) {
  var dirRelPath = `C:\\KMOU\\routeImage\\dataset\\result`;
  //var filesaveName = req.params.fileName.split('.');
  //filesaveName = filesaveName[0] + '.txt';

  var imageSql = `    SELECT FILE_NAME, ROUTE_SEQ
                        FROM ROUTE_ATTACH_FILE 
                        WHERE ROUTE_ID = '${req.params.routeCd}'; `;

  connection.query(imageSql, async function (err, rows) {
    if (err) throw err;

    let routeListArr = [];
    let totCnt = 0;
    let resultArr = [];

    for (let row of rows) {
      //console.log(row);
      var filesaveName = row.FILE_NAME.split(".");

      filesaveName = filesaveName[0] + ".txt";
      let realPath = path.join(dirRelPath, filesaveName);

      //console.log(realPath);
      const exifile = await fs.existsSync(realPath);
      if (!exifile) {
        continue;
      }

      //console.log(realPath);
      let data = await fs.readFileSync(realPath, "utf8");

      //console.log(JSON.parse(data));
      //resultArr = [];
      if (data != "") {
        data = JSON.parse(data);
        //console.log(data);
        data.forEach((product) => {
          totCnt += product.CNT;
        });
        let rowArr = [];
        for (let result of data) {
          let obj = {};
          obj["TITLE"] = result.TITLE;
          obj["CNT"] = result.CNT;
          let persent = (result.CNT / totCnt) * 100;
          obj["PER"] = Math.round(persent);
          rowArr.push(obj);
        }

        resultArr.push(rowArr);
      }
    }

    /*let resultArr = [];
        let routeResult = groupBy(routeListArr, 'TITLE');
        for(let result of Object.values(routeResult))
        {
            let obj = {};
            let cnt = 0;

            obj['TITLE'] = result[0].TITLE;
            for(let rowResult of result)
            {
                cnt += Number(rowResult.CNT);
            }
            obj['CNT'] = cnt;
            let persent = cnt / totCnt * 100;
            obj['PER'] = Math.round(persent);
            resultArr.push(obj);
        }*/

    //console.log(resultArr);
    res.send(resultArr);
  });

  //
  //console.log(realPath);
  /*fs.readFile(realPath, 'utf8', function(err,data){
        res.send(data);
    });*/
});

async function fileSeq() {
  console.log("들어옴SEQ", routeSignId);
  let maxSeq = 0;
  var seqQuery = `SELECT IFNULL(MAX(ROUTE_SEQ), 0) + 1 AS ROUTE_SEQ
                    FROM route_attach_file 
                    WHERE ROUTE_ID = '${routeSignId}'`;
  connection.query(seqQuery, function (err, rows) {
    if (err) throw err;
    console.log("ddddddddddd" + rows);

    maxSeq = rows[0].ROUTE_SEQ;
    console.log("maxSeq : " + maxSeq);
    return maxSeq;
  });
}

async function fileInfoToDB(routeSignId, filesaveName, file, realPath) {
  console.log("DB저장");
  //filesaveName = decodeURIComponent(filesaveName);
  var filesaveQeury = `call route_file_save('${routeSignId}', '${filesaveName}', '${realPath}', ${file.size});`;
  console.log(filesaveQeury);

  connection((conn) => {
    conn.query(filesaveQeury, function (err, rows, fields) {
      if (err) return err;
      console.log("순서 파일이름 : " + filesaveName);
    });
    conn.release();
  });
}

function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == lat2 && lon1 == lon2) return 0;

  var radLat1 = (Math.PI * lat1) / 180;
  var radLat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radTheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radLat1) * Math.sin(radLat2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
  if (dist > 1) dist = 1;

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515 * 1.609344 * 1000;
  if (dist < 100) dist = Math.round(dist / 10) * 10;
  else dist = Math.round(dist / 100) * 100;

  return dist;
}

//등부표의 기상 정보
router.get("/weatherInfo/:obs_post_id", function (req, res, next) {
  var seqQuery = ` SELECT obs_post_id, obs_post_name
                     FROM weatherinfomation
                     where obs_post_id = '${req.params.obs_post_id}'
                     GROUP BY obs_post_id, obs_post_name `;
  connection((conn) => {
    conn.query(seqQuery, function (err, rows, fields) {
      if (err) return err;
      res.send(rows);
    });
    conn.release();
  });
});

//시계열 데이터 시간 최근24시간
router.get("/weatherInfoHour/:obsId", function (req, res, next) {
  /*var seqQuery = `    SELECT  	DATE_FORMAT(record_time, '%H') as hor,
                                    avg(water_temp) AS water_temp, avg(Salinity) AS Salinity, avg(CURRENT_speed) AS CURRENT_speed
                        FROM weatherinfomation a
                        JOIN (SELECT obs_post_id, 
                                DATE_FORMAT(max(record_time),'%Y-%m-%d') AS TO_DT, 
                                DATE_FORMAT(DATE_ADD(max(record_time), INTERVAL -1 DAY),'%Y-%m-%d') AS FROM_DT
                        FROM weatherinfomation
                        GROUP BY obs_post_id) b ON a.obs_post_id = b.obs_post_id AND DATE_FORMAT(a.record_time, '%Y-%m-%d') BETWEEN b.from_dt AND b.to_dt
                        WHERE a.obs_post_id = '${req.params.obsId}'
                        GROUP BY DATE_FORMAT(record_time, '%H'); `;*/
  var seqQuery = `  SELECT a.base, a.base2, SUM(water_temp) AS water_temp, SUM(Salinity) AS Salinity, SUM(CURRENT_speed) AS CURRENT_speed
                    FROM (
                        SELECT 
                            DATE_FORMAT(m1, '%Y-%m-%d %H') AS base,  DATE_FORMAT(m1, '%m/%d %H') AS base2, 0 AS water_temp, 0 AS Salinity, 0 AS CURRENT_speed
                        FROM(
                            SELECT 
                                (DATE_ADD(NOW(), INTERVAL -23 HOUR)) +INTERVAL m HOUR as m1
                            FROM(
                                SELECT @rownum:=@rownum+1 as m FROM
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t1,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t2,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t3,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t4,
                                (SELECT @rownum:=-1) t0
                            ) d1
                        ) d2 
                        WHERE m1 <= NOW()
                        
                        UNION ALL
                        
                        SELECT DATE_FORMAT(a.record_time, '%Y-%m-%d %H') AS base, DATE_FORMAT(a.record_time, '%m/%d %H') AS base2,
                            avg(water_temp) AS water_temp, avg(Salinity) AS Salinity, avg(CURRENT_speed) AS CURRENT_speed
                        FROM weatherinfomation a
                        WHERE a.obs_post_id = '${req.params.obsId}'
                        AND A.record_time BETWEEN DATE_ADD(NOW(), INTERVAL -24 HOUR) AND NOW()
                        GROUP BY DATE_FORMAT(a.record_time, '%Y-%m-%d %H')
                      ) a
                    GROUP BY a.base, a.base2
                    ORDER BY a.base `;
  connection((conn) => {
    conn.query(seqQuery, function (err, rows, fields) {
      if (err) return err;

      let resultData = [];
      let wtObj = {},
        curObj = {},
        salObj = {};

      for (let row of rows) {
        wtObj[row.base2] = row.water_temp;
        curObj[row.base2] = row.CURRENT_speed;
        salObj[row.base2] = row.Salinity;
      }

      resultData.push(wtObj);
      resultData.push(curObj);
      resultData.push(salObj);

      //console.log(resultData);
      //resultData[0] 수온, resultData[1] 유속, resultData[2] 염분
      res.send(resultData);
    });
    conn.release();
  });
});

//시계열 데이터 일 최근30일
router.get("/weatherInfoDay/:obsId", function (req, res, next) {
  /*var seqQuery = `    SELECT  	DATE_FORMAT(record_time, '%d') as d_day,
                                    avg(water_temp) AS water_temp, avg(Salinity) AS Salinity, avg(CURRENT_speed) AS CURRENT_speed
                        FROM weatherinfomation a
                        JOIN (SELECT obs_post_id, 
                                DATE_FORMAT(max(record_time),'%Y-%m-%d') AS TO_DT, 
                                DATE_FORMAT(DATE_ADD(max(record_time), INTERVAL -30 DAY),'%Y-%m-%d') AS FROM_DT
                        FROM weatherinfomation
                        GROUP BY obs_post_id) b ON a.obs_post_id = b.obs_post_id AND DATE_FORMAT(a.record_time, '%Y-%m-%d') BETWEEN b.from_dt AND b.to_dt
                        WHERE a.obs_post_id = '${req.params.obsId}'
                        GROUP BY DATE_FORMAT(record_time, '%d'); `;*/
  var seqQuery = `  SELECT a.base2, SUM(water_temp) AS water_temp, SUM(Salinity) AS Salinity, SUM(CURRENT_speed) AS CURRENT_speed
                    FROM (
                        SELECT 
                            DATE_FORMAT(m1, '%m/%d') AS base2, 0 AS water_temp, 0 AS Salinity, 0 AS CURRENT_speed
                        FROM(
                            SELECT 
                                (DATE_ADD(NOW(), INTERVAL -29 DAY)) +INTERVAL m DAY as m1
                            FROM(
                                SELECT @rownum:=@rownum+1 as m FROM
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t1,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t2,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t3,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t4,
                                (SELECT @rownum:=-1) t0
                            ) d1
                        ) d2 
                        WHERE m1 <= NOW()
                        
                        UNION ALL
                        
                        SELECT DATE_FORMAT(a.record_time,'%m/%d') AS base2,
                              avg(water_temp) AS water_temp, avg(Salinity) AS Salinity, avg(CURRENT_speed) AS CURRENT_speed
                        FROM weatherinfomation a
                        WHERE a.obs_post_id = '${req.params.obsId}'
                        AND record_time BETWEEN DATE_ADD(NOW(), INTERVAL -1 MONTH) AND NOW()
                        GROUP BY DATE_FORMAT(a.record_time,'%m/%d')
                      ) a
                    GROUP BY a.base2
                    ORDER BY a.base2  `;

  connection((conn) => {
    conn.query(seqQuery, function (err, rows, fields) {
      if (err) return err;

      let r = 1;
      let resultData = [];
      let wtObj = {},
        curObj = {},
        salObj = {};

      for (let row of rows) {
        wtObj[row.base2] = row.water_temp;
        curObj[row.base2] = row.CURRENT_speed;
        salObj[row.base2] = row.Salinity;
      }

      // while (r <= 30) {
      //   let rStr = r.toString().length == 1 ? "0" + r.toString() : r.toString();
      //   let waterTemp = 0,
      //     salinity = 0,
      //     CURRENT_speed = 0;
      //   for (let row of rows) {
      //     if (row.d_day == rStr) {
      //       salinity = row.Salinity;
      //       CURRENT_speed = row.CURRENT_speed;
      //       waterTemp = row.water_temp;
      //     }
      //   }
      //   wtObj[r] = waterTemp;
      //   curObj[r] = CURRENT_speed;
      //   salObj[r] = salinity;

      //   r++;
      // }

      resultData.push(wtObj);
      resultData.push(curObj);
      resultData.push(salObj);

      //console.log(resultData);
      //resultData[0] 수온, resultData[1] 유속, resultData[2] 염분
      res.send(resultData);
    });
    conn.release();
  });
});

//시계열 데이터 월 최근12월
router.get("/weatherInfoMonth/:obsId", function (req, res, next) {
  /*var seqQuery = `    SELECT  	DATE_FORMAT(record_time, '%m') as mon,
                                    avg(water_temp) AS water_temp, avg(Salinity) AS Salinity, avg(CURRENT_speed) AS CURRENT_speed
                        FROM weatherinfomation a
                        JOIN (SELECT obs_post_id, 
                                DATE_FORMAT(max(record_time),'%Y-%m-%d') AS TO_DT, 
                                DATE_FORMAT(DATE_ADD(max(record_time), INTERVAL -12 MONTH),'%Y-%m-%d') AS FROM_DT
                        FROM weatherinfomation
                        GROUP BY obs_post_id) b ON a.obs_post_id = b.obs_post_id AND DATE_FORMAT(a.record_time, '%Y-%m-%d') BETWEEN b.from_dt AND b.to_dt
                        WHERE a.obs_post_id = '${req.params.obsId}'
                        GROUP BY DATE_FORMAT(record_time, '%m'); `;*/

  var seqQuery = `  SELECT a.mon, SUM(water_temp) AS water_temp, SUM(Salinity) AS Salinity, SUM(CURRENT_speed) AS CURRENT_speed
                    FROM(
                        SELECT 
                            DATE_FORMAT(m1, '%y/%m') AS mon, 0 AS water_temp, 0 AS Salinity, 0 AS CURRENT_speed
                        FROM(
                            SELECT 
                                (DATE_ADD(NOW(), INTERVAL -11 MONTH) - INTERVAL DAYOFMONTH(NOW())-1 DAY) +INTERVAL m MONTH as m1
                            FROM(
                                SELECT @rownum:=@rownum+1 as m FROM
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t1,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t2,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t3,
                                (SELECT 1 union SELECT 2 union SELECT 3 union SELECT 4) t4,
                                (SELECT @rownum:=-1) t0
                            ) d1
                        ) d2 
                        WHERE m1 <= NOW()
                        
                        UNION all
                        
                        SELECT DATE_FORMAT(a.record_time, '%y/%m') AS mon, 
                            avg(water_temp) AS water_temp, avg(Salinity) AS Salinity, avg(CURRENT_speed) AS CURRENT_speed
                        FROM weatherinfomation a
                        WHERE a.obs_post_id = '${req.params.obsId}'
                        AND record_time BETWEEN DATE_ADD(NOW(), INTERVAL -12 MONTH) AND NOW()
                        GROUP BY DATE_FORMAT(a.record_time, '%y/%m')
                    ) AS a
                    GROUP BY a.mon
                    ORDER BY mon `;
  connection((conn) => {
    conn.query(seqQuery, function (err, rows, fields) {
      if (err) return err;

      let resultData = [];
      let wtObj = {},
        curObj = {},
        salObj = {};

      for (let row of rows) {
        wtObj[row.mon] = row.water_temp;
        curObj[row.mon] = row.CURRENT_speed;
        salObj[row.mon] = row.Salinity;
      }

      // while (r < 13) {
      //   let rStr = r.toString().length == 1 ? "0" + r.toString() : r.toString();
      //   let waterTemp = 0,
      //     salinity = 0,
      //     CURRENT_speed = 0;
      //   for (let row of rows) {
      //     if (row.mon == rStr) {
      //       salinity = row.Salinity;
      //       CURRENT_speed = row.CURRENT_speed;
      //       waterTemp = row.water_temp;
      //     }
      //   }
      //   wtObj[r] = waterTemp;
      //   curObj[r] = CURRENT_speed;
      //   salObj[r] = salinity;

      //   r++;
      // }

      resultData.push(wtObj);
      resultData.push(curObj);
      resultData.push(salObj);

      //console.log(resultData);
      //resultData[0] 수온, resultData[1] 유속, resultData[2] 염분
      res.send(resultData);
    });
    conn.release();
  });
});

router.get("/routeResultList", function (req, res, next) {
  let sql = `SELECT 	a.sign_nm, b.base_dt, a.SIGN_SEQ,
                  round(sum(case when b.class = '민조개' then b.cnt ELSE 0 END),2) AS minjogae,
                  round(sum(case when b.class = '홍합' then b.cnt ELSE 0 END),2) AS honghap,
                  round(sum(case when b.class = '파래' then b.cnt ELSE 0 END),2) AS palea,
                  round(sum(case when b.class = '미역' then b.cnt ELSE 0 END),2) AS miyeok,
                  round(sum(case when b.class = '따개비' then b.cnt ELSE 0 END),2) AS ttagaebi
            FROM route_attach_file a
            JOIN (SELECT sign_nm, sign_seq, MAX(base_dt) AS base_dt, class, cnt FROM route_result_info GROUP BY sign_nm, class, cnt) b ON a.sign_nm = b.sign_nm AND b.sign_seq = a.sign_seq
            GROUP BY a.sign_nm, b.base_dt, a.SIGN_SEQ`;

  connection((conn) => {
    conn.query(sql, function (err, rows, fields) {
      if (err) return err;
      res.status(200).send(rows);
    });
  });
});

module.exports = router;
