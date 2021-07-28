const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

fs.readdirSync('./commands').filter((dirs) => !dirs.endsWith('.js')).forEach((dir) => {
  fs.readdirSync(`./commands/${dir}`).filter((files) => files.endsWith('.js')).forEach((file) => {
    const commandFile = require(`./commands/${dir}/${file}`);
    client.commands.set(commandFile.help.name, commandFile);
  });
});

const configs = {
  prefix: '!',
  token: 'The token of your bot'
};

client.on('message', (message) => {
   var args = message.content.slice(configs.prefix.length).trim().split(/ +/g);
   const commandName = args.shift().toLowerCase();
  
   if (!message.content.startsWith(configs.prefix) || message.author.bot || message.webhookID) return;
   const command = client.commands.get(commandName);
  
  if (!command) return;
  const run = new Promise((resolve, reject) => resolve(command.run(message, args, client)));
  run.catch((error) => {
    message.channel.send(`:x: | An error went wrong`);
    console.error(error);
  });
});
