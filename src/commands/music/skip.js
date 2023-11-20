const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current playing song")
    .addIntegerOption(option => option.setName("skipto").setDescription("To which song to skip to?").setRequired(false)),
  
    async execute(client, interaction) {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply("I'm not skipping music on this server")

      const current = player.queue.current
      const nextTrack = player.queue.tracks[0]

      if(!nextTrack) return interaction.reply({ ephemeral: true, content: "no tracks to skip to"})

      await player.skip((interaction.options.getInteger("skipto")) || 0)

      await interaction.reply({ ephemeral: true, content: current ?
        `Skipped [\`${current.info.title}\`](<${current.info.uri}>) -> [\`${nextTrack.info.title}\`](<${nextTrack.info.uri}>)` :
        `Skipped to [\`${nextTrack.info.title}\`](<${nextTrack.info.uri}>)`
      })
    }
}