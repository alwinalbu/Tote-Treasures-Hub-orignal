const User = require('../models/userSchema');
const Wallet = require('../models/walletSchema');

module.exports = {
  getWallet: async (req, res) => {
    try {
      const userId = req.session.user.user;

      console.log('user in wallet is', userId);

      const user = await User.findById(userId);

      console.log('user in wallet is', user);

      let wallet = await Wallet.findOne({ UserID: userId });

      // let updatedBalance = 0;

      let userTransactions = [];

      // if (!wallet) {
      //   // If the wallet doesn't exist, create one with an initial amount
      //   wallet = new Wallet({ UserID: userId, Amount: 0, TransactionType: 'Initial' });
      //   await wallet.save();
      //   userTransactions = [wallet]; // Make sure it's an array for consistency
      //   updatedBalance = 0;
      // } else {
      //   // If the wallet exists, retrieve transactions
      //   userTransactions = await Wallet.find({ UserID: userId, Amount: 0, TransactionType: 'Initial' });

      //   // Get the updated balance from the database
      //   updatedBalance = userTransactions.length > 0 ? userTransactions[0].Amount : 0;
      // }
      
      res.render('user/walletpage', { Amount:wallet.Amount, userTransactions, user});

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },
};


