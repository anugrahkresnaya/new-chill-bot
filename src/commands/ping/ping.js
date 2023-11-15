const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot ping'),

  async execute(client, interaction) {
    await interaction.reply(`Ping ${client.ws.ping}`)
  }
}