const bcrypt = require('bcryptjs');
const db = require('../config/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Customer.findAll();
}

async function getById(id) {
    return await getCustomer(id);
}

async function create(params) {
    // validate
    if (await db.Customer.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const user = new db.Customer(params);
    
    // hash password
    user.passwordHash = await bcrypt.hash(params.password, 10);

    // save user
    await user.save();
}

async function update(id, params) {
    const user = await getCustomer(id);

    // validate
    const usernameChanged = params.Customername && user.Customername !== params.Customername;
    if (usernameChanged && await db.Customer.findOne({ where: { username: params.Customername } })) {
        throw 'Username "' + params.Customername + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();
}

async function _delete(id) {
    const user = await getCustomer(id);
    await user.destroy();
}

// helper functions

async function getCustomer(id) {
    const user = await db.Customer.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}