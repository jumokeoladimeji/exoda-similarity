const axios = require('axios');


module.exports.getExpensTrend = async (userId) => {
    return axios.get(`${process.env.expense_base_url}/api/v1/users/${userId}/transactions/trends`);
}