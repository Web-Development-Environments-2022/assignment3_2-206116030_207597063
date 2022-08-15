require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (query) {
    let returnValue = []
    console.log("trying to connect")
    const connection = await MySql.connection();
    console.log("got connection")
    try {
    await connection.query("START TRANSACTION");
    console.log("START connection")
    returnValue = await connection.query(query);
    console.log("finished connection")
  } catch (err) {
    await connection.query("ROLLBACK");
    console.log('ROLLBACK at querySignUp', err);
    //throw err;
  } finally {
    await connection.release();
  }
  return returnValue
}

