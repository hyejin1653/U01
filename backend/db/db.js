var iniparser = require("iniparser");
var config = iniparser.parseSync("./config.ini");
const mysql = require("mysql");

let configSet = {
  host: config.MYSQL.server,
  port: config.MYSQL.port,
  user: config.MYSQL.user,
  password: config.MYSQL.password, //gc8932 - 118서버
  database: config.MYSQL.database,
};

const pool = mysql.createPool(configSet);

function getConnection(callback) {
  pool.getConnection(function (err, conn) {
    if (!err) {
      callback(conn);
    } else {
      console.log(err);
    }
  });
}

module.exports = getConnection;
