const express = require("express");
const zod= require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const router = express.Router();

//signup and sigin routes
const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    password: zod.string()
})
router.post("/signup", async(req,res)=> {
    const body = req.body;
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = User.findOne({
        username: body.username
    })

    if(user.id){
        return res.json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const dbUser = await user.create(body);
    const token = jwt.sign({
        userId: dbUser._id
    },JWT_SECRET);

    res.json({
        message: "User created successfully",
        token:token
    })
});

const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string()
});

router.post("/signin", async (req, res) => {
    const body = req.body;
    const { success } = signinSchema.safeParse(req.body);

    if (!success) {
        return res.json({
            message: "Incorrect inputs"
        });
    }

    const user = await User.findOne({
        username: body.username
    });

    if (!user ||!(await user.comparePassword(body.password))) {
        return res.json({
            message: "Invalid username or password"
        });
    }

    const token = jwt.sign({
        userId: user._id
    }, JWT_SECRET);

    res.json({
        message: "User signed in successfully",
        token: token
    });
});

module.exports = router;
