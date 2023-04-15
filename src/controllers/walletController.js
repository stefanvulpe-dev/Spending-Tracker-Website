import { Category, Expense, Wallet } from '../models/index.js';

export const getWalletsData = async (req, res, next) => {
  const walletId = req.query.walletId;
  try {
    const wallet = await Wallet.findOne({
      where: {
        id: Number(walletId),
      },
    });
    const categoriesArr = await wallet.getCategories();
    const expensesArr = [];
    for (let category of categoriesArr) {
      const expenses = await category.getExpenses();
      expenses.forEach(expense => {
        expensesArr.push(expense);
      });
    }
    const resObj = { categories: categoriesArr, expenses: expensesArr };
    res.status(200).json(resObj);
  } catch (err) {
    console.log(err);
    res.status(404).send('Wallet not found');
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

    const insertedExpense = await Expense.create(expense);
    await category.addExpense(insertedExpense);
    res.status(200).json(insertedExpense);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: `Couldn't add the provided expense.` });
  }
};
