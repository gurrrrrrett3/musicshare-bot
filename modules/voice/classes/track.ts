import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import ytdlexec from "youtube-dl-exec";
const { exec } = ytdlexec;

export default class Track {

    constructor(public readonly url: string, public readonly userId: string, public readonly meta: {
        title: string,
        artist: string,
    }) { }

    public createAudioResource(): Promise<AudioResource<Track>> {
        if (!this.url) {
            throw new Error('No url provided');
        }

        return new Promise(async (resolve, reject) => {

            const ytdlProcess = exec(this.url as string, {
                output: '-',
                quiet: true,
                format: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
            }, { stdio: ['ignore', 'pipe', 'ignore'] });

            if (!ytdlProcess.stdout) {
                reject(new Error('No stdout'));
                return;
            }

            const stream = ytdlProcess.stdout;

            const onError = (error: Error) => {
                if (!ytdlProcess.killed) ytdlProcess.kill();
                stream.resume();
                reject(error);
            }

            ytdlProcess.once('spawn', () => {
                demuxProbe(stream)
                    .then((probe) => {
                        resolve(createAudioResource(probe.stream, {
                            metadata: this,
                            inputType: probe.type
                        }))
                    }).catch(onError);
            })
        })

    }

}