const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current playing song")
    .addIntegerOption(option => option.setName("skipto").setDescription("To which song to skip to?").setRequired(false)),
  
    async execute(client, interaction) {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply("I'm not skipping music on this server")

      const getSkipIndex = interaction.options.getInteger("skipto")

      const current = player.queue.current
      const nextTrack = player.queue.tracks[getSkipIndex || 0]

      if(!nextTrack) return interaction.reply({ ephemeral: true, content: "no tracks to skip to"})

      const skippedEmbed = new EmbedBuilder()
        .setTitle('Skipped')
        .setFields(
          { name: 'Current', value: current.info.title, inline: true },
          { name: 'To', value: nextTrack?.info?.title, inline: true }
        )

      const skippedToEmbed = new EmbedBuilder()
        .setTitle('Skipped To')
        .setFields(
          { name: 'Current', value: current.info.title, inline: true },
          { name: 'To', value: nextTrack?.info?.title, inline: true }
        )

      try {
        await player.skip(getSkipIndex ? (getSkipIndex + 1) : 0)
        await interaction.reply({ embeds: current ? [skippedEmbed] : [skippedToEmbed] })
      } catch (error) {
        console.log(error)
        const errorEmbed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription("Can't skip more than the queue size")
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
      }
    }
}