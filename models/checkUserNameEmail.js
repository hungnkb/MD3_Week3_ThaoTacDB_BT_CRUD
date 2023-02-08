const productQuery = require('./productQuery');

class checkUserNameEmail {

    static checkUsernameAvailable = async (inputUsername, data) => {
        return new Promise((resolve, reject) => {
            for (let i of data) {
                if (inputUsername == i.username) {
                    reject(false);
                } else {
                    resolve(true);
                }
            }
        })
    }

    static checkEmailAvailable = async (inputEmail, data) => {
        return new Promise((resolve, reject) => {
            for (let i of data) {
                if (inputEmail == i.email) {
                    reject(false);
                } else {
                    resolve(true);
                }
            }
        })
    }

    static check = async (inputUsername, inputEmail) => {
        let result = 0;
        // result == 0 => Username && Email is not exist
        // result == 1 => Only Username is exist
        // result == 2 => Only Email is exist
        // result == 3 => Username && Email is exist
        let sql = `select username, email from Accounts`;
        let accounts = await productQuery.selectProduct(sql);

        return new Promise((resolve) => {
            for (let i of accounts) {
                if (inputUsername == i.username) {
                    if (inputEmail == i.email) {
                        result = 3;
                        resolve(result);
                    } else {
                        result = 1;
                        resolve(result);
                    }
                } else if (inputUsername != i.username && inputEmail != i.email) {
                    resolve(result);
                } else if (inputEmail == i.email) {
                    if (inputUsername != i.username) {
                        result = 2;
                        resolve(result);
                    } else {
                        result = 3;
                        resolve(result);
                    }
                }
            }
        })
    }
}



module.exports = checkUserNameEmail;



