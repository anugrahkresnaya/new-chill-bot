const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("display the current track"),

  async execute(client, interaction) {
    try {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply("I'm not playing music on this server")

      if(!player.playing) return interaction.reply("I'm not played yet")

      const current = player.queue.current

      const converter = (ms) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
  
        const formattedTime = minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds
  
        return formattedTime
      }
      const time = converter(current.info.duration)

      const songEmbed = new EmbedBuilder()
        .setColor(0x601390)
        .setTitle(current.info.title)
        .setURL(current.info.uri)
        .setAuthor({ name: current.info.author })
        .setThumbnail(current.info.artworkUrl)
        .addFields(
          { name: 'Source', value: current.info.sourceName },
          { name: 'Song duration', value: time}
        )
        .setTimestamp()
        .setFooter({ text: current.requester.username})

      await interaction.reply({ embeds: [songEmbed], components: [row]})
    } catch (error) {
      console.log(error)
    }
  }
}