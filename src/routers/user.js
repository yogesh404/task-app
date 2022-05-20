const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')
const router = new express.Router()

const avatar = multer({
	// dest: 'avatars',
	limits: { fileSize: 1000000 },
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpe?g|png)$/)) return cb(new Error('Please upload an image (jpg or png)'))
		cb(null, true)
	},
})

// Create new User
router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try {
		await user.save()
		sendWelcomeEmail(user.email, user.name)
		const token = await user.generateAuthToken()
		res.status(201).send({ user, token })
	} catch (e) {
		res.status(400).send({ error: e.message })
	}
})

// Login
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({ user, token })
	} catch (e) {
		res.status(400).send()
	}
})

//Logout
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => {
			token.token !== req.token
		})
		await req.user.save()

		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

// Logout All
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()

		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

// Fetch ME page
router.get('/users/me', auth, async (req, res) => {
	res.send(req.user)
})

// Upload avatar
router.post(
	'/users/me/avatar',
	auth,
	avatar.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).png().resize(250, 250).toBuffer()

		req.user.avatar = buffer
		await req.user.save()
		res.send()
	},
	(err, req, res, next) => {
		res.status(400).send({ error: err.message })
	}
)

// Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = undefined
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

// Get Avatar
router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)

		if (!user || !user.avatar) throw new Error()

		res.set('Content-Type', 'image/png')
		res.send(user.avatar)
	} catch (e) {
		res.status(404).send()
	}
})

// Update a User
router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password']

	let invalidKey = ''
	updates.every(key => {
		if (allowedUpdates.includes(key)) return true
		else invalidKey = key
	})

	if (invalidKey) return res.status(400).send({ error: invalidKey + ' cannot be updated' })
	try {
		const user = req.user
		updates.forEach(key => (user[key] = req.body[key]))
		await user.save()

		res.send(user)
	} catch (e) {
		res.status(400).send({ error: e.message })
	}
})

// Delete a User
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()
		sendGoodbyeEmail(req.user.email, req.user.name)
		res.send(req.user)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

module.exports = router
