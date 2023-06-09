import { Wallet } from '../models/index.js';

export const getWalletData = async (req, res, next) => {
  const walletId = req.query.walletId;
  try {
    const wallet = await Wallet.findOne({
      where: {
        id: Number(walletId),
      },
    });
    const expensesArr = await wallet.getExpenses();
    res.status(200).json({ wallet: wallet, expenses: expensesArr });
  } catch (err) {
    res.status(404).json({ message: 'Wallet not found' });
  }
};

export const postAddWallet = async (req, res, next) => {
  try {
    const walletData = req.body;
    walletData.userId = res.locals.user.id;
    const newWallet = await Wallet.create(walletData);
    res.status(201).json(newWallet);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: `Error. Wallet couldn't be created.` });
  }
};
