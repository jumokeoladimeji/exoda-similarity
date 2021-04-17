const pool = require('../database/config');
const similarityService = require('../services/similarity');

async function query (q) {
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res
}

module.exports.expenseTrendsSimilarity = async (req, res) => {
    try {
      const expenseTrend = await similarityService.getExpensTrend(req.params.id);

      const categories = expenseTrend.data.data.map(({category}) => category);

      const selectQuery = 
        `SELECT user_id
        FROM (SELECT
            user_id,
            DATE_TRUNC('month', date_time)
            AS  date_time_month,
            COUNT(user_id) AS count
            FROM transactions
            WHERE category = ANY('{${categories.toString()}}') 
            AND date_time >= date_trunc('month', now()) - interval '12 month' and date_time < date_trunc('month', now())
            GROUP BY user_id, DATE_TRUNC('month',date_time)
            ORDER BY date_time_month) 
            AS twelveMonthTrend
        GROUP BY user_id
        HAVING COUNT(user_id) > 4;`;

        const { rows } = await query(selectQuery);

        const similarUsers = rows.map(({user_id}) => user_id);

        const usersQuery = `SELECT u.first_name || ' ' || u.last_name AS full_name,
                            u.avatar,
                            extract(year from  AGE(created_at)) * 12 + extract(month from AGE(created_at)) AS months_ago,
                            COUNT(*) AS transactions_count
                            FROM users u
                            INNER JOIN transactions t
                            ON t.user_id = u.id 
                            WHERE t.user_id = ANY('{2157, 2158, 2187, 2176, 2148}') 
                            GROUP BY u.id, t.user_id 
                            ORDER BY last_name;`


        const usersDetails = await query(usersQuery);

        res.status(200).send({
            status: 'Success',
            message: 'Successfully returned similarities.',
            data: {...{recurring: expenseTrend.data.data }, ...{user_list: usersDetails.rows}},
        });
    } catch (err) {
        res.status(500).send({
            status: 'failed',
            message: 'Error while Getting Similarities:' + err
        });
    }
};
