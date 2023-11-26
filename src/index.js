const { LavalinkManager } = require('lavalink-client')
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js")
const { REST, Routes } = require('discord.js');
const config = require('./Data/config.json');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers]
})

client.lavalink = new LavalinkManager({
	nodes: [
		{
			authorization: "kabirjaipal",
			host: "lavalink-v4-replit.anugrahkresnaya.repl.co",
			port: 443,
			id: "Lavalink",
			secure: true
		}
],
	sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
	client: {
		id: config.clientId, username: "BORDILBOT"
	},
	autoSkip: true,
	playerOptions: {
		clientBasedPositionUpdateInterval: 150,
		defaultSearchPlatform: "ytmsearch",
		volumeDecrementer: 0.75,
		onDisconnect: {
			autoReconnect: true,
			destroyPlayer: false
		},
		onEmptyQueue: {
			destroyAfterMs: 30_000,
		}
	},
	queueOptions: {
		maxPreviousTracks: 25
	}
})

client.commands = new Collection()

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
    client.commands.set(command.data.name, command)
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

// client events starts
client.on("raw", d => client.lavalink.sendRawData(d))
client.once("ready", async () => {
  console.log("Bordil Bot is online!")
	await client.lavalink.init({ ...client.user })
})

client.on("interactionCreate", (interaction) => {
  // run commands
  if(!interaction.isCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if(!command) {
    console.log(`No command matching ${interaction.commandName} was found!`)
    return
  }

  try {
    command.execute(client, interaction)
  } catch (error) {
    interaction.reply({content: "There was a error executing this command.", ephemeral: true})
  }
})

// track events
client.lavalink.on('trackStart', (player, track) => {
	const channel = client.channels.cache.get(player.textChannelId)

	if(!channel) return

	const converter = (ms) => {
		const seconds = Math.floor(ms / 1000)
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60

		const formattedTime = minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds

		return formattedTime
	}
	const time = converter(track.info.duration)

	const previousList = player.queue.previous.map(v => v.info.title)
	const nextList = player.queue.tracks.map(v => v.info.title)

	const nowPlayingEmbed = new EmbedBuilder()
		.setColor(0x601390)
		.setTitle(`${track.info.title} - ${track.info.author}`)
		.setURL(track.info.uri)
		.setAuthor({ name: 'Now Playing' })
		.setThumbnail(track.info.artworkUrl)
		.addFields(
			{ name: 'Source', value: track.info.sourceName, inline: true },
			{ name: 'Song Duration', value: time, inline: true },
			{ name: 'Previous', value: `${previousList.join('\n')}` || 'no previous queue' },
			{ name: 'Next', value:`${nextList.join('\n')}` || 'no next queue' }
		)
		.setFooter({ 
			text: `Requested by ${track.requester?.globalName}`,
			iconURL: `https://cdn.discordapp.com/avatars/${track.requester?.id}/${track.requester?.avatar}`
		})

	channel.send({ embeds: [nowPlayingEmbed] })
}).on('trackError', (player, track, payload) => {
	console.log('errored while playing ', track.info.title, 'errored data: ', payload)
}).on('trackStuck', (player, track, payload) => {
	console.log('player stucked while playing', track.info.title, 'STUCKED DATA : ', payload)
}).on('queueEnd', (player, track, payload) => {
	const channel = client.channels.cache.get(player.textChannelId)

	if(!channel) return

	const queueEndEmbed = new EmbedBuilder()
		.setTitle('Queue End')
		.setDescription('No more track on the queue')

	channel.send({ embeds: [queueEndEmbed] })
})

// client events ends

client.login(config.token)