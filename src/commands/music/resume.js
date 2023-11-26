const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("This command will resume music"),

  async execute(client, interaction) {
    try {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply({ content: "I'm not pausing music on this server", ephemeral: true })

      if(!player.playing) return interaction.reply({ content: "I'm not paused yet", ephemeral: true })

      const resumeEmbed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('Music is resumed')

      await player.resume()

      interaction.reply({ embeds: [resumeEmbed] })
    } catch (error) {
      console.log(error)
    }
  }
}