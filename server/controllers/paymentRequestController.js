const PaymentRequest = require('../models/PaymentRequest');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @POST /api/payment-requests  ← student submits
const submitPaymentRequest = async (req, res) => {
  try {
    const {
      classId, feeRecordId, amount, method,
      cardHolderName, cardLastFour,
      bankName, transactionRef, notes,
    } = req.body;

    if (!classId || !amount || !method) {
      return res.status(400).json({ message: 'classId, amount and method are required' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Resolve feeRecordId — find one if not provided or undefined
    let resolvedFeeRecordId = null;
    if (feeRecordId && feeRecordId !== 'undefined' && mongoose.Types.ObjectId.isValid(feeRecordId)) {
      resolvedFeeRecordId = feeRecordId;
    } else {
      // Try to find an unpaid fee record for this class
      const feeRecord = await FeeRecord.findOne({
        studentId: student._id,
        classId,
        status: { $in: ['unpaid', 'overdue'] },
      }).sort({ createdAt: -1 });
      resolvedFeeRecordId = feeRecord?._id || null;
    }

    const request = await PaymentRequest.create({
      studentId: student._id,
      classId,
      feeRecordId: resolvedFeeRecordId,
      amount,
      method,
      cardHolderName: cardHolderName || undefined,
      cardLastFour: cardLastFour || undefined,
      bankName: bankName || undefined,
      transactionRef: transactionRef || undefined,
      notes: notes || undefined,
      slipUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      slipFileName: req.file?.originalname || undefined,
    });

    res.status(201).json({
      message: 'Payment request submitted. Admin will approve shortly.',
      requestId: request._id,
    });
  } catch (e) {
    console.error('Submit payment request error:', e.message);
    res.status(500).json({ message: e.message });
  }
};

// @GET /api/payment-requests  ← admin sees all
const getPaymentRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await PaymentRequest.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('classId', 'name subject')
      .sort({ createdAt: -1 });
    res.json({ count: requests.length, requests });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @GET /api/payment-requests/my  ← student sees own
const getMyPaymentRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const requests = await PaymentRequest.find({ studentId: student._id })
      .populate('classId', 'name subject')
      .sort({ createdAt: -1 });
    res.json({ count: requests.length, requests });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @PATCH /api/payment-requests/:id/approve  ← admin
const approvePaymentRequest = async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id)
      .populate('studentId')
      .populate('classId');

    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Already ${request.status}` });
    }

    // Find fee record if not linked
    let feeRecordId = request.feeRecordId;
    if (!feeRecordId) {
      const feeRecord = await FeeRecord.findOne({
        studentId: request.studentId._id,
        classId: request.classId._id,
        status: { $in: ['unpaid', 'overdue'] },
      }).sort({ createdAt: -1 });
      feeRecordId = feeRecord?._id;
    }

    // Create payment record
    const payment = await Payment.create({
      feeRecordId: feeRecordId || new mongoose.Types.ObjectId(),
      studentId: request.studentId._id,
      classId: request.classId._id,
      amount: request.amount,
      method: request.method,
      collectedBy: req.user._id,
    });

    // Update fee record status to paid
    if (feeRecordId) {
      await FeeRecord.findByIdAndUpdate(feeRecordId, {
        status: 'paid',
        paidAt: new Date(),
      });
    }

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({
      message: 'Payment approved',
      receiptNumber: payment.receiptNumber,
    });
  } catch (e) {
    console.error('Approve payment request error:', e.message);
    res.status(500).json({ message: e.message });
  }
};

// @PATCH /api/payment-requests/:id/reject  ← admin
const rejectPaymentRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await PaymentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Already ${request.status}` });
    }

    request.status = 'rejected';
    request.rejectReason = reason || 'No reason provided';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Payment rejected' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  submitPaymentRequest,
  getPaymentRequests,
  getMyPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
};