import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export default class ChannelSettings {

    @PrimaryKey()
    public channelId!: string;

    @Property()
    public autoYoutube!: boolean;
}