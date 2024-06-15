import { Logger } from "../../../core/utils/logger.js";
import Song from "./song.js";

export default class Processor<ApplicableSongData extends Partial<Song>> extends Logger {

    public readonly enabled: boolean = true;

    constructor(public readonly name: string) {
        super(name);
    }

    public async search(query: string, artist?: string): Promise<ApplicableSongData[]> {
        throw new Error('Not implemented');
    }

    public async getUrlInfo(url: string): Promise<ApplicableSongData> {
        throw new Error('Not implemented');
    }

    public shouldProcess(url: string): boolean {
        throw new Error('Not implemented');
    }

}