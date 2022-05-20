const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = async (email, name) => {
    const [firstName] = name.split(' ')
    try {
        await sgMail.send({
            to: email,
            from: 'yogesh.mi007@gmail.com',
            subject: 'Welcome to Task app',
            text: `Thanks for joining in, ${firstName}. Let me know how you get along with the app.`
        })
    } catch (e) {
        console.error(e)
    }
}

const sendGoodbyeEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: 'yogesh.mi007@gmail.com',
            subject: 'Adios amigo :\')',
            text: `We're sorry to see you go ${name}. \nHope to see you again soon!`
        })
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}