const express = require('express');
const router = express.Router();

/**
 * Validation URL endpoint
 * Receives validation requests when External Validation is enabled
 */
router.post('/validation', (req, res) => {
  try {
    console.log('Validation Request:', JSON.stringify(req.body, null, 2));
    
    const {
      TransactionType,
      TransID,
      TransAmount,
      BusinessShortCode,
      BillRefNumber,
      MSISDN
    } = req.body;

    // Implement your validation logic here
    // For example, check if BillRefNumber is valid
    const isValid = true; // Replace with actual validation

    if (isValid) {
      // Accept the transaction
      res.status(200).json({
        ResultCode: "0",
        ResultDesc: "Accepted"
      });
    } else {
      // Reject the transaction
      res.status(200).json({
        ResultCode: "C2B00012", // Invalid Account Number
        ResultDesc: "Rejected"
      });
    }
  } catch (error) {
    console.error('Validation Error:', error);
    res.status(200).json({
      ResultCode: "C2B00016", // Other Error
      ResultDesc: "Rejected"
    });
  }
});

/**
 * Confirmation URL endpoint
 * Receives successful transaction confirmations
 */
router.post('/confirmation', (req, res) => {
  try {
    console.log('Confirmation Request:', JSON.stringify(req.body, null, 2));
    
    const {
      TransactionType,
      TransID,
      TransTime,
      TransAmount,
      BusinessShortCode,
      BillRefNumber,
      OrgAccountBalance,
      MSISDN,
      FirstName,
      MiddleName,
      LastName
    } = req.body;

    // Here you would typically:
    // 1. Save the transaction to your database
    // 2. Update the customer's account
    // 3. Send notifications if needed

    // Always respond with success to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Success"
    });
  } catch (error) {
    console.error('Confirmation Error:', error);
    // Still return success to M-Pesa even if we have internal errors
    // You should implement proper error logging and notifications here
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Success"
    });
  }
});

module.exports = router;
