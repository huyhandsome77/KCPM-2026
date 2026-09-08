const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
    });
} else {
    const isPostgres = (process.env.DB_DIALECT || 'mysql') === 'postgres';
    sequelize = new Sequelize(
        process.env.DB_NAME || 'database_development',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (isPostgres ? 5432 : 3306),
            dialect: process.env.DB_DIALECT || 'mysql',
            dialectOptions: isPostgres ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : {},
            logging: false,
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Database connected successfully via Sequelize (${sequelize.getDialect()}).`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
