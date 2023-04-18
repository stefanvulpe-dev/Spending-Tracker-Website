import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { compileSassAndSaveMultiple } from 'compile-sass';

dotenv.config();

import { db } from './models/db/connection.js';
import { User, Wallet, Category, Expense } from './models/index.js';
import {
  userRouter,
  walletRouter,
  categoryRouter,
  expenseRouter,
} from './routes/index.js';

const PORT = process.env.PORT || 3000;

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public'))); // for delivering static resources
app.use(express.json()); // for working with json data

await compileSassAndSaveMultiple({
  sassPath: path.join(__dirname, 'public/scss/'),
  cssPath: path.join(__dirname, 'public/css/'),
  files: ['main.scss'],
});

try {
  await db.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.use(userRouter);
app.use(walletRouter);
app.use(categoryRouter);
app.use(expenseRouter);

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

User.hasMany(Wallet, { onDelete: 'CASCADE' });
Wallet.belongsTo(User);
User.hasMany(Category, { onDelete: 'CASCADE' });
Category.belongsTo(User);
Wallet.hasMany(Expense, { onDelete: 'CASCADE' });
Expense.belongsTo(Wallet);
Category.hasMany(Expense, { onDelete: 'CASCADE' });
Expense.belongsTo(Category);

db.sync(/*{ force: true }*/)
  .then(() => {
    return User.findOne({ where: { id: 1 } });
  })
  .then(user => {
    if (!user) {
      return User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
      });
    }
    return Promise.resolve(user[0]);
  })
  .then(() => {
    return Wallet.findOne({ where: { id: 1 } });
  })
  .then(wallet => {
    if (!wallet) {
      Wallet.create({
        name: 'Home',
        amount: 1000,
        iconTag: 'fa-solid fa-wallet',
        color: '0, 0%, 100%',
        backgroundColor: '118, 65%, 43%',
        backgroundOpacity: 1,
        userId: 1,
      });
    }
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })
  .catch(err => console.log(err));
