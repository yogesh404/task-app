const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Landing page
app.get('', res => {
	res.send()
})

app.listen(PORT, '0.0.0.0', () => {
	console.log('Server up and running on port ' + PORT)
})
