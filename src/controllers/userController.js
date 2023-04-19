import { User } from '../models/index.js';

export const getUserDetails = async (req, res, next) => {
  try {
    const userId = res.locals.user.id;
    const user = await User.findOne({
      where: {
        id: Number(userId),
      },
    });
    const walletsArr = await user.getWallets({ order: ['id'] });
    const categoriesArr = await user.getCategories({ order: ['id'] });
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      mainWallet: walletsArr.length > 0 ? walletsArr[0].id : null,
      wallets: walletsArr,
      categories: categoriesArr,
    });
  } catch (err) {
    res.status(404).send('Resource not found');
  }
};
