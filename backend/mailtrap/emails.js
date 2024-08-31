const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE } = require("./emailTemplates")
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

        console.log("Email sent successfully", response);
    }catch(error){
        console.error(`Error sending verification `, error);

        throw new Error(`Error sending verification email: ${error}`)
    }
}

const sendWelcomeEmail = async(email, name) => {
    const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "ee9f83f9-7be5-4995-9097-c5769e82dec3",
			template_variables: {
				company_info_name: "Auth Company",
				name: name,
			},
		});

		console.log("Welcome email sent successfully", response);
	} catch (error) {
		console.error(`Error sending welcome email`, error);

		throw new Error(`Error sending welcome email: ${error}`);
	}
}
const sendPasswordResetEmail = async(email, resetURL) => {
    const recipient = [{email}];

    try{
        const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Password Reset",
		});
        console.log("Email sent successfully", response);
    }catch(error){
        console.error(`Error sending verification `, error);

        throw new Error(`Error sending verification email: ${error}`)
    }
}
module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail
};