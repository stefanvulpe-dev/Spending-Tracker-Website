import { DataTypes } from 'sequelize';
import { db } from './db/connection.js';

export const Expense = db.define(
  'expenses',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    iconTag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    backgroundColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    backgroundOpacity: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);
