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
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      wallets: walletsArr,
    });
  } catch (err) {
    res.status(404).send('Resource not found');
  }
};
