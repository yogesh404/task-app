const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

// Create new task
router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	})

	try {
		await task.save()
		res.status(201).send(task)
	} catch (e) {
		res.status(400).send({ error: e.message })
	}
})

// Fetch all Tasks
// GET /tasks?completed=(true/false)
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
	try {
		const match = {}
		const sort = {}
		if (req.query.completed) {
			match.completed = req.query.completed === 'true'
		}

		if (req.query.sortBy) {
			const parts = req.query.sortBy.split(':')
			sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
		}
		await req.user
			.populate({
				path: 'tasks',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
				},
			})
			.execPopulate()
		res.send(req.user.tasks)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

// Fetch task by Id
router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id

	// Fetch Task
	try {
		const task = await Task.findOne({ _id, owner: req.user._id })
		if (!task) return res.status(404).send({ error: 'Task not found' })
		res.send(task)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

// Update a Task
router.patch('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']

	let invalidKey = ''
	updates.every(key => {
		if (allowedUpdates.includes(key)) return true
		else invalidKey = key
	})

	if (invalidKey) return res.status(400).send({ error: invalidKey + ' cannot be updated' })
	try {
		const task = await Task.findOne({ _id, owner: req.user._id })
		if (!task) return res.status(404).send({ error: 'Task not found' })

		updates.forEach(key => (task[key] = req.body[key]))
		await task.save()

		res.send(task)
	} catch (e) {
		res.status(400).send({ error: e.message })
	}
})

// Delete a Task
router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
		if (!task) return res.status(404).send({ error: 'Task not found' })
		res.send(task)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

module.exports = router
