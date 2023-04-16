import { User } from '../models/index.js';

export const getUserDetails = async (req, res, next) => {
  const reqId = req.query.userId;
  try {
    const user = await User.findOne({
      where: {
        id: Number(reqId),
      },
    });
    const walletsArr = await user.getWallets();
    const categoriesArr = await user.getCategories();
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      wallets: walletsArr,
      categories: categoriesArr,
    });
  } catch (err) {
    res.status(404).send('Resource not found');
  }
};
