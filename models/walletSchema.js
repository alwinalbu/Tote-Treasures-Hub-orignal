const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletSchema = new Schema({
  UserID: { type: Schema.Types.ObjectId, ref: 'User' },
  Amount: { type: Number, required: true },
  TransactionType: { type: String, enum: ['deposit', 'withdrawal', 'purchase', 'referral_reward','Initial'] },
  TransactionDate: { type: Date, default: Date.now },
  ReferrerID: { type: Schema.Types.ObjectId, ref: 'User' } 
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
