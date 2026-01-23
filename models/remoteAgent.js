import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RemoteAgent = sequelize.define(
  'RemoteAgent',
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    campaign_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('READY', 'PAUSED', 'BUSY', 'OFFLINE'),
      defaultValue: 'READY',
    },

    lead_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    callerid: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    calls_today: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    full_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    user_group: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    user_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'remote_agents',
    timestamps: false,
  }
);

export default RemoteAgent;
