const Discord = require("discord.js");
require('dotenv').config();

const botToken = process.env.BOT_TOKEN;
const userName = process.env.USER_NAME;

const client = new Discord.Client();

console.log('Client Started');

client.on("message", function(message) {
  if (message.author.username === userName) {
    if (message.content.toLowerCase().includes('big') || message.content.toLowerCase().includes('scary')) {
      message.channel.send('uwu');
    }
  }
});

client.login(botToken);