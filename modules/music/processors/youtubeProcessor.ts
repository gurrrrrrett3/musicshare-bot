import ytsr from "@distube/ytsr";
import Processor from "../classes/processor.js";
import Song, { SongData } from "../classes/song.js";
import ytdl from "ytdl-core";

export type YoutubeSongData = SongData<
    'artistImageUrl'
    | 'albumImageUrl'
>;

export default class YoutubeProcessor extends Processor<YoutubeSongData> {

    constructor() {
        super('Youtube');
    }

    public override async search(query: string): Promise<YoutubeSongData[]> {
        let searchResults = await ytsr(query, { limit: 10 });
        if (searchResults.items.length === 0) return [];
        let videos = searchResults.items.filter((item) => item.type === "video") as ytsr.Video[];
        return videos.map((video) => ({
            name: video.name,
            artist: video.author!.name,
            duration: parseInt(video.duration || '0'),
            url: video.url,
            id: video.id,

            artistImageUrl: video.author!.bestAvatar?.url || undefined,
            albumImageUrl: video.thumbnail || undefined

        }));
    }

    public override async getUrlInfo(url: string): Promise<YoutubeSongData> {
        const res = await ytdl.getInfo(url)

        return {
            name: res.videoDetails.title,
            artist: res.videoDetails.author.name,
            duration: parseInt(res.videoDetails.lengthSeconds),
            url: res.videoDetails.video_url,
            id: res.videoDetails.videoId,

            artistImageUrl: res.videoDetails.author.thumbnails![0].url,
            albumImageUrl: res.videoDetails.thumbnails[0].url
        }
    }

    public override shouldProcess(url: string): boolean {
        // youtube.com/watch?v=...
        // youtu.be/...
        // youtube.com/playlist?list=...
        // music.youtube.com/watch?v=...
        // music.youtube.com/playlist?list=...
        // music.youtube.com/album?list=...
        // ignore other query parameters

        return url.match(/^(https?:\/\/)?(www\.)?(music\.)?youtu(\.be|be\.com)\/(watch\?v=|playlist\?list=|album\?list=)?[a-zA-Z0-9_-]{11}(&\w+=\w+)*/) !== null;
    }

}