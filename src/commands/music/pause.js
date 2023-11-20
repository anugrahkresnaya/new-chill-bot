const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current playback song"),
  
  async execute(client, interaction) {
    try {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply("I'm not playing music on this server")

      if(!player.playing && !player.paused) return interaction.reply("I'm already paused")

      await player.pause(true)

      interaction.reply("Successfully paused the song")
    } catch (error) {
      console.log(error)
    }
  }
}