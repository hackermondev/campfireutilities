const Discord = require('discord.js')
const mongo = require('../mongo')
const punishmentsSchema = require('../schemas/punishments-schema')

exports.run = async(client, message, args) => {
    const accessdenied = new Discord.MessageEmbed()
    .setTitle('Error')
    .setColor('#FF1654')
    .setDescription('You do not have the required permissions to execute this command, \`manage_roles\`')
    
    const nouser = new Discord.MessageEmbed()
    .setTitle("Error")
    .setColor('#FF1654')
    .setDescription('Please specify a user to mute')

    const needrole = new Discord.MessageEmbed()
    .setTitle('Error')
    .setColor('#09fff2')
    .setDescription('A role named **Muted** is required to run this command')

    if(!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(accessdenied);

    var user = message.mentions.users.first();
    if(!user) return message.channel.send(nouser);

    if(user.id === message.author.id) return message.channel.send('This command isn\'t broken, but why would you want to mute yourself?')

    var member;
    
    try {
        member = await message.guild.members.fetch(user);
    } catch (err) {
        member = null
    }

    if(message.member.roles.highest.position ==  message.guild.member(user.id).roles.highest.position || message.member.roles.highest.position < message.guild.member(user.id).roles.highest.position) {
    
    var cannotmute = new Discord.MessageEmbed()
    .setTitle('Error')
    .setColor('#FF1654')
    .setDescription('You cannot mute this user because your highest role is either the same or lower as them')

    message.channel.send(cannotmute)
    return;
  }

    var reason = args.splice(1).join(' ');
    if(!reason) { 
      return message.channel.send('You must specify a reason in order to punish this user.')
    }

    var role = message.guild.roles.cache.find(r => r.name === 'Muted');

    if(!role) return message.channel.send(needrole)
    member.roles.add(role);

    var date = new Date();
    date = date.getMonth() + '/' + date.getDay() + '/' + date.getFullYear();

    const mutemsgdm = new Discord.MessageEmbed()
    .setColor('#09fff2')
    .addField('Date', date)
    .addField('Reason', reason)
    .addField('Duration', 'permanent')
    .addField('Problem?', 'Please report any false or abusive punishments to our Camp Superintendent.',false)
    .setTimestamp();

  var puncode = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 15; i++ ) {
    puncode += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  var date = new Date();
  month = date.getMonth() + 1
  date = month + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();

  await new punishmentsSchema({
    userId: user.id,
    authorId: message.author.id,
    code: puncode,
    type: 'Mute',
    date: date,
    reason: reason,
  }).save()

  const logchannel = message.guild.channels.cache.get('763386062873296936')
  logchannel.send(`<:mute:769001734751780885> **${user.tag}** muted at \`${date}\` (${user.id})\nReason: ${reason}`)

  var mutemsg = new Discord.MessageEmbed()
  .setColor('#4BCC85') 
  .setDescription(`<a:success:769189756051390471> ${user} has been **muted** with ID \`${puncode}\``)

  message.channel.send(mutemsg);

  try {
    if(user.bot) return;
    member.send(mutemsgdm)
  } catch(err) {
  }

}
