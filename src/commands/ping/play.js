const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data:new SlashCommandBuilder()
    .setName("play")
    .setDescription("Use this command to play your song")
    .addStringOption(option => option
      .setName("song_name")
      .setDescription("Enter the name of the song you wanna play!")
      .setRequired(true)),

  async execute(client, interaction) {
    const song_name = interaction.options.getString('song_name')

    if(!interaction.member.voice.channel) return interaction.reply({
      content: "You must join a voice channel to play music!",
      ephemeral: true
    })

    // Create the player 
    // console.log("guild id", interaction.guild.id)
    const player = await client.lavalink.createPlayer({
      guildId: interaction.guild.id,
      voiceChannelId: interaction.member.voice.channel.id,
      textChannelId: interaction.channel.id,
      selfDeaf: true,
      selfMute: false,
      volume: 100
    })

    await player.connect()

    const res = await player.search(song_name, interaction.user)

    await player.queue.add(res.tracks[0])

    // Checks if the client should play the track if it's the first one added
    if (!player.playing) await player.play()

    console.log('tracks log: ', res.tracks[0])

    // ms duration converter
    // const converter = (milis) => {
    //   const minutes = Math.floor(milis / 60000)
    //   const seconds = ((milis % 60000) / 10000).toFixed(0)
    //   // return `${minutes} : ${(seconds < 10 ? '0' : '')} ${seconds}`
    //   return (seconds == 60 ? (minutes + 1) + ':00' : minutes + ':' + (seconds < 10 ? '0' : '') + seconds)
    // }
    const converter = (ms) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60

      const formattedTime = minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds

      return formattedTime
    }
    const time = converter(res.tracks[0].info.duration)

    // create embed
    const songEmbed = new EmbedBuilder()
      .setColor(0x601390)
      .setTitle(res.tracks[0].info.title)
      .setURL(res.tracks[0].info.uri)
      .setAuthor({ name: res.tracks[0].info.author })
      .setThumbnail(res.tracks[0].info.artworkUrl)
      .addFields(
        { name: 'Source', value: res.tracks[0].info.sourceName },
        { name: 'Song duration', value: time}
      )
      .setTimestamp()
      .setFooter({ text: res.tracks[0].requester.username})

    interaction.reply({ embeds: [songEmbed]})
  }
}