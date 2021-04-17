const similarityController = require('../controllers/similarity');

module.exports = (app) => {
    app.route('/api/v1/users/:id/transactions/trends/similarity') 
        .get(similarityController.expenseTrendsSimilarity);
}
