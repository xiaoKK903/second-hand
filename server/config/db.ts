const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    process.env.DB_NAME || 'trading_system',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql'
    }
);

sequelize.authenticate().then(() => {
    console.log('connected');
}).catch(err => {
    console.error('connect failed:' + err);
});

const Op = Sequelize.Op;
const DataTypes = Sequelize.DataTypes;

module.exports = {
    sequelize,
    Op,
    DataTypes
};