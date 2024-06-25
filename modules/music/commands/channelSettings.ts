import { Colors, EmbedBuilder } from "discord.js";
import { db } from "../../../core/index.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import ChannelSettings from "../entities/channelSettings.entity.js";

const Command = new SlashCommandBuilder()
    .setName("channelsettings")
    .setDescription("Edit channel settings")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("autoyoutube")
            .setDescription("Automatically trigger on youtube links")
            .addBooleanOption((option) =>
                option
                    .setName("enabled")
                    .setDescription("Enable or disable this feature")
                    .setRequired(true)
            )
            .setFunction(async (interaction) => {
                const enabled = interaction.options.getBoolean("enabled", true);
                const channelSettingsRepository = db.getEntityManager().getRepository(ChannelSettings);
                const channelSettings = await channelSettingsRepository.findOne({ channelId: interaction.channelId });
                if (!channelSettings) {
                    const newGuildSettings = channelSettingsRepository.create({
                        channelId: interaction.channelId as string,
                        autoYoutube: enabled,
                    })

                    await db.getEntityManager().persistAndFlush(newGuildSettings);
                } else {
                    channelSettings.autoYoutube = enabled;
                    await db.getEntityManager().persistAndFlush(channelSettings);
                }

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Channel settings updated.")
                            .setDescription(`The bot ${enabled ? "will now" : "will no longer"} automatically trigger on youtube links in this channel.`)
                            .setColor(enabled ? Colors.Green : Colors.Red)
                    ]
                })
            })
    )


export default Command;