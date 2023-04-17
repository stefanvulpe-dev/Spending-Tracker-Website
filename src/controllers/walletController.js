import { Category, Expense, Wallet } from '../models/index.js';

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
    walletData.userId = 1; // TO DO: change userId with the current logged userId
    const newWallet = await Wallet.create(walletData);
    res.status(200).json(newWallet);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: `Error. Wallet couldn't be created.` });
  }
};

export const postAddExpense = async (req, res, next) => {
  const walletId = req.query.walletId;
  const categoryId = req.query.categoryId;

  try {
    await Wallet.increment(
      { amount: req.body.amount },
      { where: { id: +walletId } }
    );
    await Category.increment(
      {
        amount: req.body.amount < 0 ? -req.body.amount : req.body.amount,
      },
      { where: { id: +categoryId } }
    );
    const category = await Category.findOne({ where: { id: +categoryId } });

    const expense = req.body;
    expense.iconTag = category.iconTag;
    expense.color = category.color;
    expense.backgroundColor = category.backgroundColor;
    expense.backgroundOpacity = category.backgroundOpacity;
    expense.walletId = walletId;

    const insertedExpense = await Expense.create(expense);
    await category.addExpense(insertedExpense);

    res.status(200).json(insertedExpense);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: `Couldn't add the provided expense.` });
  }
};

export const putEditExpense = async (req, res, next) => {
  const expenseId = req.query.expenseId;

  try {
    const expense = await Expense.findOne({ where: { id: +expenseId } });
    const category = await expense.getCategory();
    const wallet = await expense.getWallet();

    let currentAmount = wallet.amount;
    await wallet.update({
      amount: currentAmount - expense.amount + req.body.amount,
    });

    currentAmount = category.amount;
    await category.update({
      amount:
        currentAmount -
        (expense.amount < 0 ? -expense.amount : expense.amount) +
        (req.body.amount < 0 ? -req.body.amount : req.body.amount),
    });

    const result = await expense.update({
      name: req.body.name,
      amount: req.body.amount,
      date: req.body.date,
    });

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: 'Update of expense failed.' });
  }
};
