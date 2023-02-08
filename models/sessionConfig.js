const fs = require('fs');
const getTemplate = require('./getTemplate');
const localStorage = require('local-storage');
const qs = require('qs');

class sessions {

    clearSession = (fileName) => {
        fileName = './sessions/' + fileName;
        fs.unlink(fileName, err => {
            if (err) throw err;
            console('Session deleted');
        })
    }

    static readSession = async (req, res) => {
        return new Promise((resolve, reject) => {
            // let sessionID = localStorage.get('session');
            let cookie = req.headers.cookie;
            let dataCookie = qs.parse(cookie);
            let sessionID = dataCookie.u_user;
            if (sessionID) {
                resolve('Session is exist');
                let expires = 0;
                let sessionString = '';
                fs.readFile('./sessions' + sessionID, 'utf-8', async (err, data) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    sessionString = String(data);
                    expires = JSON.parse(sessionString).expires;

                    let now = Date.now();

                    if (expires < now) {
                        this.clearSession(sessionID);
                        res.writeHead(301, { 'Location': '/' });
                        res.end();
                    } else {
                        let parseUrl = url.parse(req.url, true);
                        let path = parseUrl.pathname;
                        let trimPath = path.replace(/^\/+|\/+$/g, '');
                        if (trimPath == 'logout') {
                            this.clearSession(sessionID);
                            res.writeHead(301, { 'Location': '/login' });
                            res.end();
                        } else {
                            let dataHtml = await getTemplate.readHtml('./views/home.html');
                            dataHtml = dataHtml.replace('{hidden-login}', 'hidden');
                            dataHtml = dataHtml.replace('{hidden-signup}', 'hidden');
                            res.write(dataHtml);
                            res.end();
                        }
                    }
                })
            } else {
                resolve('Session is not exist')
                let parseUrl = url.parse(req.url, true);
                let path = parseUrl.pathname;
                let trimPath = path.replace(/^\/+|\/+$/g, '');
                res.write(301, { 'Location': '/' + trimPath });
                res.end();
            }
        })

    }
}

module.exports = sessions;