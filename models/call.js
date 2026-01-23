import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Call = sequelize.define(
  'Call',
  {
    call_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    caller_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    recording_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    call_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    call_start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    call_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    bot_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    log_files: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tts_cache_hit_rate: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    llm_cache_hit_rate: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    customer_zip_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    customer_age: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_eligible: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ready_for_transfer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'calls',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Call;
