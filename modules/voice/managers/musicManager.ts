import Processor from "../../music/classes/processor.js";
import { RequiredSongData } from "../../music/classes/song.js";
import MusicModule from "../../music/index.js";
import GuildManager from "./guildManager.js";

export default class MusicManager {

    private static guildManagers: Map<string, GuildManager> = new Map();

    public static getGuildManager(guildId: string): GuildManager {
        return this.guildManagers.get(guildId) || this.createGuildManager(guildId);
    }

    private static createGuildManager(guildId: string): GuildManager {
        const guildManager = new GuildManager(guildId);
        this.guildManagers.set(guildId, guildManager);
        return guildManager;
    }

    public static async getYoutubeUrlFromUrl(url: string): Promise<string | undefined> {
        const processor = MusicModule.getMusicModule().processors.find((processor) => processor.shouldProcess(url)) as Processor<RequiredSongData>;
        if (!processor) return
        if (processor.name == "Youtube") return url;

        const songData = await processor.getUrlInfo(url)
        const youtubeProcessor = MusicModule.getMusicModule().processors.find((processor) => processor.name == "Youtube") as Processor<RequiredSongData>;
        if (!youtubeProcessor) return;

        const results = await youtubeProcessor.search(songData.name + " " + songData.artist)
        return results[0].url;
    }

    public static async getYoutubeResultsFromQuery(query: string): Promise<RequiredSongData[] | undefined> {
        const youtubeProcessor = MusicModule.getMusicModule().processors.find((processor) => processor.name == "Youtube") as Processor<RequiredSongData>;
        if (!youtubeProcessor) return;

        return await youtubeProcessor.search(query)

    }

}