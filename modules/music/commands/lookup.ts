import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import Processor from "../classes/processor.js";
import { RequiredSongData } from "../classes/song.js";
import MusicModule from "../index.js";

const Command = new SlashCommandBuilder()
    .setName("lookup")
    .setDescription("Get information about a song url.")
    .addStringOption((option) =>
        option
            .setName("url")
            .setDescription("The url of the song you want to lookup.")
            .setRequired(true)
    )
    .setFunction(async (interaction) => {
        const url = interaction.options.getString("url", true);

        let processor = MusicModule.getMusicModule().processors.find((processor) => processor.shouldProcess(url)) as Processor<RequiredSongData>;
        if (!processor) return;

        MusicModule.getMusicModule().lookupSong("interaction", url, interaction)
    });

export default Command;