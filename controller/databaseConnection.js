const mysql = require('mysql2');

class db {
    static connect = () => {
        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'demob13',
            charset: 'utf8_general_ci'
        });
    }
}


module.exports = db;