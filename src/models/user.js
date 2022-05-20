const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Anonymous',
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value)) throw new Error('Invalid email')
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate: (value) => {
            if (value.toLowerCase().includes('password'))
                throw new Error('Password contains \'password\'')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) throw new Error({ error: "Unable to login" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error({ error: 'Unable to login' })

    return user
}

userSchema.methods.generateAuthToken = async function () {
    const secret = process.env.JWT_SECRET
    const token = jwt.sign({ _id: this._id.toString() }, secret, {})
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token
}

userSchema.methods.toJSON = function () {
    // const user = this
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 8)
    next()
})

userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User