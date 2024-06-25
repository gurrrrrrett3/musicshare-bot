import { VoiceChannel } from "discord.js";
import Queue from "../classes/queue.js";
import Track from "../classes/track.js";
import Connection from "../classes/connection.js";

export default class GuildManager {

    public queue: Queue = new Queue();
    public voiceChannel?: VoiceChannel;
    public connection?: Connection

    constructor(public readonly guildId: string) {

    }

    public async joinVoiceChannel(voiceChannel: VoiceChannel): Promise<void> {
        this.voiceChannel = voiceChannel;
        this.connection = new Connection(voiceChannel);
        this.connection.join();
    }

    public async enqueue(track: Track): Promise<void> {

        this.queue.add(track);
    }

}