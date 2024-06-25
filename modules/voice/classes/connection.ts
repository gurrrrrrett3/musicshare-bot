import { VoiceConnection, VoiceConnectionStatus, entersState, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Guild, InternalDiscordGatewayAdapterCreator, VoiceChannel } from "discord.js";

export default class Connection {
    public guild: Guild;
    public adapterCreator: InternalDiscordGatewayAdapterCreator;

    constructor(public voiceChannel: VoiceChannel) {
        this.guild = voiceChannel.guild;
        this.adapterCreator = voiceChannel.guild.voiceAdapterCreator;
    }

    public join(): VoiceConnection {
        const connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guild.id,
            adapterCreator: this.adapterCreator
        });

        this.monitorVoiceConnection(connection);

        return connection;
    }

    public get connection(): VoiceConnection | undefined {
        return getVoiceConnection(this.guild.id);
    }

    public destroy(): void {
        this.connection?.destroy();
    }

    private monitorVoiceConnection(connection: VoiceConnection): void {
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.debug(`Voice connection to ${connection.joinConfig.channelId} in ${connection.joinConfig.guildId} is ready`);
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                ])
            } catch (error) {
                this.destroy();
            }
        })
    }
}