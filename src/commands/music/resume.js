const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("This command will resume music"),

  async execute(client, interaction) {
    try {
      const player = client.lavalink.getPlayer(interaction.guild.id)

      if(!player) return interaction.reply("I'm not pausing music on this server")

      if(!player.playing) return interaction.reply("I'm not paused yet")

      await player.resume()

      interaction.reply("Music is resumed")
    } catch (error) {
      console.log(error)
    }
  }
}