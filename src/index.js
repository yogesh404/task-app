const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT

const multer = require('multer')
const upload = multer({
    dest: 'images'
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Landing page
app.get('', (req, res) => {
    res.send('wassup')
})

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server up and running on port ' + PORT)
})

const Task = require('./models/task')
const User = require('./models/user')

const main = async () => {
    // const task = await Task.findById('61dc7ce7964f59377ac920d2')
    // await task.populate('owner').execPopulate()
    // console.log(task)

    const user = await User.findById('61dc7b871951fa342d3e8f13')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

// main()