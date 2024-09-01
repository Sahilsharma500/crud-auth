const { MailtrapClient } = require("mailtrap");
const dotenv = require('dotenv');
dotenv.config();
const TOKEN = process.env.MAIL_TRAP_TOKEN;

const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Sahil",
};

  module.exports = {
    sender,
    mailtrapClient
  }