import { Expense, Wallet, Category } from '../models/index.js';

export const getExpense = async (req, res, next) => {
  const expenseId = req.query.expenseId;

  try {
    const expense = await Expense.findOne({ where: { id: +expenseId } });
    res.status(200).json(expense);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: 'Cannot find the requested expense.' });
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

    res.status(201).json(insertedExpense);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: `Couldn't add the provided expense.` });
  }
};

export const putEditExpense = async (req, res, next) => {
  const expenseId = req.query.expenseId;

  try {
    const expense = await Expense.findOne({ where: { id: +expenseId } });
    const category = await expense.getCategory();
    const wallet = await expense.getWallet();

    const oldAmount = expense.amount;

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

    res.status(201).json({ ...result.dataValues, oldAmount: oldAmount });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Update of expense failed.' });
  }
};

export const deleteExpense = async (req, res, next) => {
  const expenseId = req.query.expenseId;

  try {
    const expense = await Expense.findOne({ where: { id: +expenseId } });
    const category = await expense.getCategory();
    const wallet = await expense.getWallet();

    await wallet.increment({ amount: -expense.amount });
    await category.increment({
      amount: expense.amount > 0 ? -expense.amount : expense.amount,
    });

    await wallet.removeExpense(expense);
    await category.removeExpense(expense);

    await expense.destroy();

    res.status(200).json({ message: 'success' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: `Error. Expense couldn't be deleted.` });
  }
};
