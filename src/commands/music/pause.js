const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current playback song"),
  
  async execute(client, interaction) {
    try {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply({ content: "I'm not playing music on this server", ephemeral: true })

      if(!player.playing && !player.paused) return interaction.reply({ content: "I'm already paused", ephemeral: true })

      const pauseEmbed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('Music has been paused')

      await player.pause(true)

      interaction.reply({ embeds: [pauseEmbed] })
    } catch (error) {
      console.log(error)
    }
  }
}