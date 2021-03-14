const Discord = require("discord.js");
require('dotenv').config();

const client = new Discord.Client();

client.on("message", function(message) {
  if (message.author.username === 'Fitzalici0us') {
    if (message.content.toLowerCase().includes('big') || message.content.toLowerCase().includes('scary')) {
      message.channel.send('uwu');
    }
  }
});

client.login(process.env.BOT_TOKEN);