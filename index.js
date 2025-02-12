const Discord = require("discord.js");
const { Client, GatewayIntentBits, Partials, Events, PermissionsBitField } = require('discord.js');
const { prefix, token } = require("./config.json");
const path = require('path');
const fs = require('fs');

const client = new Discord.Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    	GatewayIntentBits.GuildMessageReactions,
    	GatewayIntentBits.GuildPresences,
    	GatewayIntentBits.GuildVoiceStates,
	],
});

const queue = new Map();

client.commands = new Discord.Collection();
const bitPermissions = new PermissionsBitField(3230784n);

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
if(!fs.existsSync('./downloads'))	{
	fs.mkdirSync('./downloads');
}
client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.followup({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

exports.queue = queue;
exports.bitPermissions = bitPermissions;
exports.client = client;
client.login(token);