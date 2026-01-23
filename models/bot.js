import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bot = sequelize.define(
  'Bot',
  {
    bot_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('active', 'inactive', 'paused'),
      defaultValue: 'active',
    },

    vicidialer_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'bots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Bot;
