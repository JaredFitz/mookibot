const Discord = require("discord.js");
require('dotenv').config();

const botToken = process.env.BOT_TOKEN;
// TODO - change to ID instead
const username = process.env.USER_NAME;
const prefix = process.env.PREFIX;

const client = new Discord.Client();

console.log('Client Started');

client.on("message", function(message) {
  try {
    if (message.author.username === username) {
      mookUwu(message);
  
      const command = parseCommand(message);
      console.log(command)
      switch (command) {
        case 'mookipoints':
          addMookiPoints(message);
          break;
      }
    }
  } catch (err) {
    console.log(err);
  }
});

const mookUwu = (message) => {
  if (message.content.toLowerCase().includes('big') || message.content.toLowerCase().includes('scary')) {
    message.channel.send('uwu');
  }
}

const parseCommand = (message) => {
  if (message.content[0] === prefix) {
    return message.content.toLowerCase().split(' ')[0].slice(1);
  }
}

const addMookiPoints = (message) => {
  // keys in the db should be the tagged ids
  const messageSplit = message.content.split(' ');

  // Rounds to nearest hundredth
  const points = Math.ceil(Number(messageSplit[1])*100)/100;

  if (isNaN(points)) throw new Error('addMookiPoints Err: invalid point value');

  const user = messageSplit[2];

  if (
    user.length > 4 &&
    user.slice(0,2) === '<@' &&
    user[user.length - 1] === '>'
  ) {
    const userId = user.slice(user[2] === '!' ? 3 : 2, user.length - 1);
    const messageMentions = Array.from(message.mentions.users.keys());

    if (!messageMentions.some(m => m === userId)) throw new Error('addMookiPoints Err: userId not in user mentions')

    message.channel.send(`Awarding ${points} to <@${userId}>`)
  } else {
    throw new Error('addMookiPoints Err: Invalid awardee pattern')
  }
}

client.login(botToken);