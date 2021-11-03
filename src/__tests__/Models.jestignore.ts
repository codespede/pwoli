const Sequelize = require('sequelize');
import Model from '../Model';
import { DataTypes } from 'sequelize';
let sequelize = new Sequelize(null, null, null, { dialect: 'mysql' });
export default class Model1 extends Model {}

const attributes = {
  id: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
    defaultValue: null,
    primaryKey: true,
    autoIncrement: true,
    comment: null,
    field: 'id',
  },
  title: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: null,
    field: 'title',
    validate: {
      //isEmail: { msg: "Email please.." },
    },
  },
};

const options = {
  sequelize,
  hooks: {},
};
Model1.init(attributes, options);
