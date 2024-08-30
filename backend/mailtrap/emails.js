const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplates")
const { mailtrapClient, sender } = require("./mailtrap")

const sendVerificationEmail = async(email, verificationToken)=> {
    const recipent = [{email}]
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipent,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email sen successfully", response);
    }catch(error){
        console.error(`Error sending verification `, error);

        throw new Error(`Error sending verification email: ${error}`)
    }
}

module.exports = sendVerificationEmail;