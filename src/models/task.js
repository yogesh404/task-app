const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
			maxLength: 40,
			trim: true,
		},
		completed: {
			type: Boolean,
			default: 'false',
		},
		owner: {
			type: mongoose.Schema.Types.ObjectID,
			required: true,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
)

const Task = mongoose.model('Tasks', taskSchema)

module.exports = Task
