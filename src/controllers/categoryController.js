import { Category } from '../models/index.js';

export const postAddCategory = async (req, res, next) => {
  try {
    const categoryData = req.body;
    categoryData.walletId = 1; // TO DO: change userId with the current logged userId
    const newCategory = await Category.create(categoryData);
    res.status(200).json(newCategory);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: `Error. Category couldn't be created.` });
  }
};
