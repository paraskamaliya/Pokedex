const express = require('express');
const { UserModel } = require('../Model/UserModel');
const userRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth } = require('../Middlewares/authMiddleware');
const { ListModel } = require('../Model/ListModel');

userRouter.get('/', async (req, res) => {
    try {
        const data = await UserModel.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(401).send({ "msg": "Something went wrong" });
    }
});


userRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    let data = await UserModel.findOne({ email });
    try {
        if (data) {
            res.status(201).send({ "msg": "User already exists" });
        }
        else {
            bcrypt.hash(password, 5, async (err, hash) => {
                if (err) {
                    res.status(500).send({ "msg": "Error in hashing password" });
                }
                else {
                    const user = new UserModel({
                        username,
                        email,
                        password: hash,
                        favorites: [],
                        searchHistory: []
                    });
                    await user.save()
                    res.status(200).send({ "msg": "User created successfully" });
                }
            })
        }
    } catch (error) {
        res.status(401).send({ "msg": "Something went wrong" });
    }
})

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let data = await UserModel.findOne({ email });
    try {
        if (data) {
            bcrypt.compare(password, data.password, async (err, result) => {
                if (err) {
                    res.status(500).send({ "msg": "Error in comparing password" });
                }
                else {
                    if (result) {
                        const token = jwt.sign({ userId: data._id }, 'users', { expiresIn: '7d' });
                        res.status(200).send({ "msg": "Login successful", "token": token, "userDetails": data });
                    }
                    else {
                        res.status(201).send({ "msg": "Password is incorrect" });
                    }
                }
            })
        }
        else {
            res.status(201).send({ "msg": "User does not exist" });
        }
    } catch (error) {
        res.status(401).send({ "msg": "Something went wrong" });
    }
})

userRouter.patch("/update/:id", auth, async (req, res) => {
    const { id } = req.params;
    try {
        await UserModel.findByIdAndUpdate({ _id: id }, req.body);
        res.status(200).send({ "message": "User data Updated" })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.delete("/delete/:id", auth, async (req, res) => {
    const { id } = req.params;
    try {
        await UserModel.findByIdAndDelete({ _id: id });
        res.status(200).send({ "message": "User data Deleted" })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.post('/logout', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        let tkn = new ListModel({ token })
        await tkn.save();
        res.status(200).send({ "msg": "You are successfully logged out" })
    } catch (error) {
        res.status(400).send({ "msg": "Something went wrong", "err": error })
    }
})

module.exports = { userRouter };