const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.put('/transactions/update-date-and-status', transactionController.updateDateAndStatus);
router.put('/transactions/resolve-violation/:id', transactionController.markViolationAsResolved);

module.exports = router;
