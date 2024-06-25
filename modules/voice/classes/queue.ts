import Track from "./track.js";

export default class Queue {

    public trackList: Track[] = [];

    constructor() { }

    public add(track: Track): void {
        this.trackList.push(track);
    }
}