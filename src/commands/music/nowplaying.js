const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("display the current track"),

  async execute(client, interaction) {
    try {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply({ content: "I'm not playing music on this server", ephemeral: true })

      if(!player.playing) return interaction.reply({ content: "I'm not played yet", ephemeral: true })

      const current = player.queue.current

      const converter = (ms) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
  
        const formattedTime = minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds
  
        return formattedTime
      }
      const time = converter(current.info.duration)

      console.log('current playing: ', current)

      const songEmbed = new EmbedBuilder()
        .setColor(0x601390)
        .setTitle(current.info.title)
        .setURL(current.info.uri)
        .setAuthor({ name: current.info.author })
        .setThumbnail(current.info.artworkUrl)
        .addFields(
          { name: 'Source', value: current.info.sourceName, inline: true },
          { name: 'Song duration', value: time, inline: true },
        )
        .setTimestamp()
        .setFooter({ 
          text: `Requested by ${current.requester?.globalName}`,
          iconURL: `https://cdn.discordapp.com/avatars/${current.requester?.id}/${current.requester?.avatar}`
        })

      try {
        await interaction.reply({ embeds: [songEmbed] })
      } catch (error) {
        interaction.reply({ content: 'got error with the request', ephemeral: true })
      }
    } catch (error) {
      console.log(error)
    }
  }
}