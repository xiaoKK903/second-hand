var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    process.env.DB_NAME || 'trading_system',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql'
    }
);

sequelize.authenticate().then(function() {
    console.log('connected');
}).catch(function(err) {
    console.error('connect failed:' + err);
});

var Op = Sequelize.Op;
var DataTypes = Sequelize.DataTypes;

module.exports = {
    sequelize,
    Sequelize,
    Op,
    DataTypes
};