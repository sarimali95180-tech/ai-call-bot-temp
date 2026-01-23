import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔹 DATABASE_URL:', process.env.DATABASE_URL); // check if loaded

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

export default sequelize;
