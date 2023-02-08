const http = require('http');
const qs = require('qs');
const url = require('url')
const PORT = 8080;
const { handlers } = require('./controller/handlers');
const fs = require('fs');
const flatpickr = require("flatpickr");

let arrType = {
    "png": "image/png",
    "jpeg": "image/jpeg",
    "jpg": "image/jpg",
}

const server = http.createServer(async (req, res) => {

    let getUrl = url.parse(req.url, true);
    let id = qs.parse(getUrl.query).id;
    let searchName = qs.parse(getUrl.query).name;
    let extensionType = getUrl.pathname.split(".")[1];


    if (arrType[extensionType] !== undefined) {
        fs.readFile(__dirname + getUrl.pathname, (err, data) => {
            if (err) {
                throw new Error(err.message)
            }
            res.writeHead(200, { 'Content-Type': arrType[extensionType] })
            res.write(data);
            return res.end();
        })
    } else {
        switch (getUrl.pathname) {
            case '/':
                handlers.showHome(req, res);
                break;


            case '/product':
                let cookie = req.headers.cookie;
                let dataCookie = qs.parse(cookie);
                let nameSession = dataCookie.u_user;

                if (nameSession != undefined) {
                    const path = './sessions/' + nameSession + ".txt";
                    try {
                        if (fs.existsSync(path)) {
                            handlers.showProduct(req, res);
                        } else {
                            throw new Error('file not exist')
                        }
                    } catch (err) {
                        res.writeHead(301, { 'Location': "/login" });
                        return res.end();
                    }
                } else {
                    res.writeHead(301, { 'Location': "/login" });
                    res.end();
                }
                if (req.method == "GET") {
                    handlers.searchProductByName(searchName, req, res);
                }
                break;

            case '/create':
                if (req.method == "GET") {
                    let cookie1 = req.headers.cookie;
                    let dataCookie1 = qs.parse(cookie1);
                    let nameSession1 = dataCookie1.u_user;
                    if (nameSession1 != undefined) {
                        const path = './sessions/' + nameSession1 + ".txt";
                        try {
                            if (fs.existsSync(path)) {
                                handlers.showAddProduct(req, res);
                            } else {
                                throw new Error('file not exist');
                            }
                        } catch (err) {
                            res.writeHead(301, { 'Location': "/login" });
                            return res.end();
                        }
                    } else {
                        res.writeHead(301, { 'Location': "/login" });
                        res.end();
                    }
                } else {
                    handlers.addProduct(req, res);
                }


                break;

            case '/delete':
                handlers.deleteItem(id, req, res);
                break;

            case '/edit':
                if (req.method == 'GET') {
                    handlers.showEditItem(id, req, res);
                } else {
                    handlers.editItem(id, req, res)
                }
                break;

            case '/register':
                if (req.method == 'GET') {
                    handlers.showRegister(req, res);
                } else {
                    handlers.register(req, res);
                };
                break;

            case '/login':

                if (req.method == 'GET') {
                    handlers.showLogin(res);
                } else {
                    handlers.login(req, res);
                }
                break;

            case '/logout':
                handlers.logout(req, res);
                break;

            case '/search':


                break;

            default: res.end();
        }
    }





})

server.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})