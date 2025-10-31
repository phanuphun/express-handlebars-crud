import { RequestHandler } from "express";
import UserModel from "../models/user.model";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import fs from "fs";
import appConfig from '../configs/index.config';

const APP_SECRET = appConfig.app.secret;

const loginUser: RequestHandler = async (req, res) => {
    const { username, password } = req.body;
    let user = await UserModel.findOne({ username });
    if (!user) {
        return res.status(404).send({
            ok: false,
            message: 'User not found'
        });
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
        return res.status(401).send({
            ok: false,
            message: 'Invalid password'
        });
    }
    const token = jwt.sign(
        { sub: String(user._id), username: user.username, role: user.role ?? 'USER' },
        APP_SECRET,                              
        { expiresIn: '3h' }
    );

    res.cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3 * 60 * 60 * 1000, // 3 hours
        path: '/',  
    });

    return res.status(200).send({
        ok: true,
        message: 'Login successful',
        data: {
            user,
            token
        }
    });
}

const registerUser: RequestHandler = async (req, res) => {
    console.log('body =',req.body)
    const { displayName, username, password , gender } = req.body;
    const avatarFile = req.file;
    try {
        if (!displayName || !username || !password) {
            return res.status(400).send({
                ok: false,
                message: 'Missing required fields'
            });
        }

        const passwordHash = await argon2.hash(password);

        let user = await UserModel.findOne({ username });

        if (user) {
            if (avatarFile && avatarFile.path && fs.existsSync(avatarFile.path)) {
                fs.unlinkSync(avatarFile.path);
                console.log('Deleted uploaded avatar file due to existing user.');
            }
            return res.status(409).send({
                ok: false,
                message: 'User already exists'
            });
        }

        const createUser = await UserModel.create({
            avatar: avatarFile ? avatarFile.filename : undefined,
            displayName,
            username,
            gender,
            password: passwordHash
        });

        return res.status(201).send({
            ok: true,
            message: 'User registered successfully',
            data: createUser
        });
    } catch (err: any) {
        if (avatarFile && avatarFile.path && fs.existsSync(avatarFile.path)) {
            fs.unlinkSync(avatarFile.path);
            console.log('Deleted uploaded avatar file due to existing user.');
        }
        return res.status(500).send({
            ok: false,
            message: 'Internal server error',
            error: err.message ? err.message : err
        });
    }
}

const authController = {
    loginUser,
    registerUser
};

export default authController;