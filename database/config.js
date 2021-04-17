const pg = require('pg');

const config = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);
console.log('pool');
pool.on('connect', () => {
  console.log('connected to the Database');
});

/**
 * Create Tables
 */
const createTables = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      transactions(
        id INTEGER NOT NULL,
        category VARCHAR(30) NOT NULL,
        date_time TIMESTAMP,
        user_id INTEGER NOT NULL,
        amoount INTEGER,
        type VARCHAR(30) NOT NULL,
        icon_url VARCHAR(128) NOT NULL,
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Drop Tables
 */
const dropTables = () => {
  const queryText = 'DROP TABLE IF EXISTS reflections';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

module.exports = {
  createTables,
  dropTables
};

require('make-runnable');

module.exports = pool;
