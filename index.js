require('dotenv').config();
const Discord = require('discord.js');
const redis = require('redis');

const botToken = process.env.BOT_TOKEN;
// TODO - change to ID instead
const username = process.env.USER_NAME;
const adminUsername = process.env.ADMIN_USER_NAME;
const prefix = process.env.PREFIX;

const client = new Discord.Client();
const redisClient = redis.createClient(URL=process.env.REDIS_URL);

console.log('Client Started');

client.on("message", function(message) {
  try {
    if (message.author.username === username) {
      mookUwu(message);
    }

    // only work with prefix commands
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const command = parseCommand(message);

    redisClient.get('commandStatus', (err, val) => {
      const statuses = JSON.parse(val);

      let active = true;
      if (Object.keys(statuses).some(s => s === command)) active = statuses[s];
      
      if (active) {
        switch(command) {
          case 'mookipoints':
            if (message.author.username === username) {
              addMookiPoints(message);
            }
            break;
          case 'leaderboard':
            getMookiPointLeaderboard(message);
            break;
          case 'status':
            handleIndividualStatus(message);
            break;
          case 'turnOffMookipoints':
            if (message.author.username === adminUsername) {
              handleToggleMookiPoints(message, false);
            } 
            break;
          case 'turnOnMookipoints':
            if (message.author.username === adminUsername) {
              handleToggleMookiPoints(message, true);
            } 
            break;
          default:
            throw new Error('command Err: unknown command');
        }
      } else {
        throw new Error('inactive command');
      }
    })

  } catch (err) {
    // message.react('✅');
    message.react('❌');
    console.log(err.message);
  }
});

const mookUwu = (message) => {
  if (message.content.toLowerCase().includes('fuck')) {
    message.channel.send('No, fuck youwu!');
  } else if (message.content.toLowerCase().includes('big') || message.content.toLowerCase().includes('scary')) {
    message.channel.send('uwu');
  }
};

const parseCommand = (message) => {
  if (message.content[0] === prefix) {
    return message.content.toLowerCase().split(' ')[0].slice(1);
  }
};

const addMookiPoints = (message) => {
  // keys in the db should be the tagged ids
  const messageSplit = message.content.split(' ');

  // Rounds to nearest hundredth
  const points = Math.ceil(Number(messageSplit[1])*100)/100;

  if (isNaN(points)) throw new Error('addMookiPoints Err: invalid point value');

  const user = messageSplit[2];

  const userId = getUserId(message, user);

  redisClient.get('mookipoints', (err, val) => {
    const scores = JSON.parse(val);
    const newPoints = scores[userId] === undefined ? points : points + scores[userId];

    scores[userId] = newPoints;
    redisClient.set('mookipoints', JSON.stringify(scores));

    message.react('✅');
  })
};

const getMookiPointLeaderboard = (message) => {
  redisClient.get('mookipoints', (err, val) => {
    const arr = [];
    const scores = JSON.parse(val);

    Object.keys(scores).forEach(k => {
      arr.push({user: k, score: scores[k]})
    });

    arr.sort((a, b) => (a.score > b.score) ? -1 : 1);
    
    const leaders = arr.slice(0,5);
    const resultLeaders = [];

    leaders.forEach(l => {
      const name = client.users.cache.find(u => u.id === l.user);
      if (name) {
        resultLeaders.push({name: name.username, points: l.score});
      }
    })

    message.channel.send(`Mookipoint Leaders:\n${resultLeaders.map(l => `${l.name}: ${l.points}`).join('\n')}`)
  });
};

const handleIndividualStatus = (message) => {
  // message has to be just !status
  const messageSplit = message.content.split(' ');
  
  if (messageSplit.length === 1) {
    // own points
    redisClient.get('mookipoints', (err, val) => {
      const scores = JSON.parse(val);

      const points = scores[message.author.id] ? scores[message.author.id] : 0;

      message.channel.send(`<@${message.author.id}>, you have ${points} mookipoints!`);
    })
  } else {
    throw new Error('handleIndividualStatus Err: Invalid request');
  }
};

const handleToggleMookiPoints = (message, newValue) => {
  redisClient.set('commandStatus', JSON.stringify({ mookipoints: newValue }));

  message.react('✅');
};

const getUserId = (message, possibleMentionString) => {
  if (
    possibleMentionString.length > 4 &&
    possibleMentionString.slice(0,2) === '<@' &&
    possibleMentionString[possibleMentionString.length - 1] === '>'
  ) {
    const userId = possibleMentionString.slice(possibleMentionString[2] === '!' ? 3 : 2, possibleMentionString.length - 1);
    const messageMentions = Array.from(message.mentions.users.keys());

    if (!messageMentions.some(m => m === userId)) throw new Error('getUserId Err: userId not in user mentions');

    return userId;
  } else {
    throw new Error('getUserId Err: userId pattern')
  }
};

client.login(botToken);