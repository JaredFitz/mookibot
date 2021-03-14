const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

client.on("message", function(message) {
  if (message.author.username === 'Mooki') {
    if (message.content.toLowerCase().includes('big') || message.content.toLowerCase().includes('scary')) {
      message.channel.send('uwu');
    }
  }
});

client.login(config.BOT_TOKEN);