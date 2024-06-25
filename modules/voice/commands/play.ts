import { ActionRowBuilder, ComponentType, StringSelectMenuBuilder } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import MusicManager from "../managers/musicManager.js";
import Util from "../../music/util/index.js";
import Track from "../classes/track.js";

const Command = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in your voice channel.")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("search")
            .setDescription("Search for a song.")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("The song you want to search for.")
                    .setRequired(true)
            )
            .setFunction(async (interaction) => {
                const query = interaction.options.getString("query", true);
                const results = await MusicManager.getYoutubeResultsFromQuery(query);

                if (!results) {
                    interaction.reply("No results found.");
                    return;
                }

                const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`${interaction.id}-select`)
                            .setPlaceholder("Select a song")
                            .addOptions(results
                                .slice(0, 25)
                                .map((result, index) => ({
                                    label: result.name,
                                    value: index.toString(),
                                    description: `${result.duration}`,
                                }))
                            ))

                interaction.reply({
                    content: "Select a song.",
                    components: [row]
                })

                const selectMenu = interaction.channel?.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    time: 60000,
                    filter: (interaction) => interaction.customId === `${interaction.id}-select`
                })

                selectMenu?.on("collect", async (interaction) => {
                    const result = results[parseInt(interaction.values[0])];
                    const url = result.url;

                    const guildManager = MusicManager.getGuildManager(interaction.guildId!);

                    if (!guildManager.voiceChannel) {

                        const member = interaction.guild?.members.cache.get(interaction.user.id);
                        if (!member) return;

                        const voiceChannel = member.voice.channel;
                        if (!voiceChannel) {
                            interaction.reply(Util.errorEmbed("You must be in a voice channel to use this command."));
                            return;
                        }
                    }

                    const track = new Track(url, interaction.user.id, {
                        artist: result.artist,
                        title: result.name,
                    });

                    guildManager.enqueue(track);
                })

            })
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("url")
            .setDescription("Play a song from a url.")
            .addStringOption((option) =>
                option
                    .setName("url")
                    .setDescription("The url of the song you want to play.")
                    .setRequired(true)
            )
            .setFunction(async (interaction) => {
                const url = interaction.options.getString("url", true);



            })
    )


export default Command;