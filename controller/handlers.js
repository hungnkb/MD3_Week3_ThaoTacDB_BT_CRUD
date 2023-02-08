const productQuery = require('../models/productQuery');
const getTemplate = require('../models/getTemplate');
const fs = require('fs');
const qs = require('qs');
const checkUsernameEmailAvailable = require('../models/checkUserNameEmail');
const formidable = require('formidable');

let handlers = {}

handlers.showHome = async (req, res) => {
    if (req.method == "GET") {
        let html = await getTemplate.readHtml('./views/home.html')
        let cookie1 = req.headers.cookie;
        let dataCookie1 = qs.parse(cookie1);
        let nameSession1 = dataCookie1.u_user;
        if (nameSession1 != undefined) {
            const path = './sessions/' + nameSession1 + ".txt";
            try {
                if (fs.existsSync(path)) {
                    html = html.replace('{hidden-login}', 'hidden');
                    html = html.replace('{hidden-signup}', 'hidden');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(html);
                    res.end();
                } else {
                    throw new Error('file not exist');
                }
            } catch (err) {
                html = html.replace('{hidden-logout}', 'hidden');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(html);
                return res.end();
            }
        } else {
            html = html.replace('{hidden-logout}', 'hidden');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(html);
            res.end();
        }
    }
}

handlers.showProduct = async (req, res) => {
    let sql = `select id, name, price, imgsrc from Products`;
    let product = await productQuery.selectProduct(sql);
    let newHtml = '';
    product.forEach(p => {
        newHtml += `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.price}</td><td><a href="/edit?id=${p.id}"><img src="/public/images/${p.imgsrc}" width="100px" height="100px""></td><td><button type=" button" class="btn btn-secondary btn-sm">Edit</button></a>  <a
                href="delete?id=${p.id}"><button type="button"class="btn btn-dark btn-sm">Delete</button></a></td></tr>`
    });

    let html = await getTemplate.readHtml('./views/product.html');
    html = html.replace('{datahtml}', newHtml)
    res.write(html);
    res.end();
}

handlers.showAddProduct = async (req, res) => {
    let html = await getTemplate.readHtml('./views/create.html')
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

handlers.addProduct = async (req, res) => {

    let form = new formidable.IncomingForm();
    form.uploadDir = './public/images/';
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.end(err.message);
        } else {
            let tmpPath = files.img.filepath;
            let newPath = (form.uploadDir + files.img.originalFilename).split(" ").join('');
            let newImg = files.img.originalFilename.split(" ").join('');
            fs.rename(tmpPath, newPath, async (err) => {
                if (err) {
                    throw err;
                } else {
                    let fileType = files.img.mimetype;
                    let mimeTypes = ["image/jpeg", "image/jpg", "image/png"];

                    if (mimeTypes.indexOf(fileType) == -1) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        return res.end('File is not correct format: png, jpeg, jpg');
                    } else {
                        let sql = `call addItem('${fields.inputName}', '${fields.inputPrice}', '${newImg}')`
                        await productQuery.selectProduct(sql);
                        res.writeHead(301, { 'Location': '/product' });
                        res.end();
                    }
                }
            })
        }
    })
}

handlers.deleteItem = async (id, req, res) => {
    let sql = `delete from Products where id = ${id}`;
    await productQuery.selectProduct(sql);
    res.writeHead(301, { 'Location': '/product' });
    res.end();
}

handlers.showEditItem = async (id, req, res) => {
    let sql = `select name, price from Products where id = ${id}`
    let data = await productQuery.selectProduct(sql);
    let name = data[0].name;
    let price = data[0].price;
    let html = await getTemplate.readHtml('./views/edit.html');
    html = html.replace("{nameDefault}", name);
    html = html.replace("{priceDefault}", price);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

handlers.editItem = async (id, req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = './public/images/';
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.end(err.message);
        } else {
            let tmpPath = files.img.filepath;
            let newPath = (form.uploadDir + files.img.originalFilename).split(" ").join('');
            let newImg = files.img.originalFilename.split(" ").join('');
            console.log(newImg, tmpPath, newPath);
            fs.rename(tmpPath, newPath, async (err) => {
                if (err) {
                    throw err;
                } else {
                    let fileType = files.img.mimetype;
                    let mimeTypes = ["image/jpeg", "image/jpg", "image/png"];

                    if (mimeTypes.indexOf(fileType) == -1) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        return res.end('File is not correct format: png, jpeg, jpg');
                    } else {
                        let sqlEditItem = `call editItem(${id},'${fields.inputName}', '${fields.inputPrice}', '${newImg}')`;
                        await productQuery.selectProduct(sqlEditItem);
                        res.writeHead(301, { 'Location': '/product' });
                        res.end();
                    }
                }
            })
        }
    })

    // let inputData = '';
    // req.on('data', chunk => {
    //     inputData += chunk
    // })
    // req.on('end', async () => {
    //     inputData = qs.parse(inputData);
    //     let sqlEditItem = `call editItem(${id},'${inputData.inputName}', '${inputData.inputPrice}')`;
    //     await productQuery.selectProduct(sqlEditItem);
    //     res.writeHead(301, { 'Location': '/product' })
    //     res.end()
    // })
}

handlers.showRegister = async (req, res) => {
    let html = await getTemplate.readHtml('./views/register.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

handlers.register = async (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {
        data = qs.parse(data);
        let inputUsername = data.inputUserName;
        let inputEmail = data.inputEmail;

        let checkUsernameEmail = await checkUsernameEmailAvailable.check(inputUsername, inputEmail)
        switch (checkUsernameEmail) {
            case 0:
                let sqlAddUser = `call addUser("${inputUsername}", "${data.inputPassword}", "${inputEmail}", "${data.inputName}", "${data.inputAddress}");`

                await productQuery.selectProduct(sqlAddUser);
                res.writeHead(301, { 'Location': '/login' });
                res.end();

                break;
            case 1:
                res.write(200, { 'Content-Type': 'text/html' });
                res.write(html);
                res.end();
                break;
            case 2:
                res.write(200, { 'Content-Type': 'text/html' });
                res.write(html);
                res.end();
                break;
            case 3:
                let html = await getTemplate.readHtml('./views/register.html');
                html = html.replace('{isValidEmail}', 'is-invalid')
                html = html.replace('{isValidUsername}', 'is-invalid')
                html = html.replace('{feedback-user}', 'This username is exist, please try again.')
                html = html.replace('{feedback-email}', 'This email is exist, please try again.')
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(html);
                res.end();
                break;
        }
    })
}

handlers.showLogin = async (res) => {
    let html = await getTemplate.readHtml('./views/login.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

handlers.login = async (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', async () => {
        data = qs.parse(data);
        let sqlCheckLogin = `select username from accounts where username = '${data.username}' and password = '${data.password}'`;
        let resultCheckLogin = await productQuery.selectProduct(sqlCheckLogin);
        if (resultCheckLogin.length == 0) {
            res.writeHead(301, { 'Location': '/login' });
            res.end();
        } else {
            let fileSession = resultCheckLogin[0].username + '.txt';
            let dataSession = JSON.stringify(resultCheckLogin[0]);

            fs.writeFile('./sessions/' + fileSession, dataSession, err => {
                if (err) {
                    console.log(err);
                } else {
                    res.setHeader('Set-Cookie', 'u_user=' + resultCheckLogin[0].username);
                    res.writeHead(301, { 'Location': '/product' });
                    res.end();
                }
            })
        }
    })
}

handlers.logout = async (req, res) => {
    let cookie = req.headers.cookie;
    let dataCookie = qs.parse(cookie);
    let nameSession = dataCookie.u_user;

    fs.unlink('./sessions/' + nameSession + '.txt', () => {
        res.writeHead(301, { 'Location': '/login' });
        res.end();
    })
}

handlers.searchProductByName = async (name, req, res) => {
    let sqlSearchProductByName = `select * from products where name like "%${name}%"`;
    let products = await productQuery.selectProduct(sqlSearchProductByName);
    let newHtml = '';
    products.forEach(p => {
        newHtml += `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.price}</td><td><a href="/edit?id=${p.id}"><img src="/public/images/${p.imgsrc}" width="100px" height="100px""></td><td><button type=" button" class="btn btn-secondary btn-sm">Edit</button></a>  <a
        href="delete?id=${p.id}"><button type="button"class="btn btn-dark btn-sm">Delete</button></a></td></tr>`
    })

    let html = await getTemplate.readHtml('./views/product.html');
    html = html.replace('{datahtml}', newHtml)
    res.write(html);
    res.end();
}


module.exports = { handlers }

