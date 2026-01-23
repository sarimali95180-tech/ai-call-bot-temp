import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Organization = sequelize.define(
  'Organization',
  {
    org_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'organizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Organization;
