
import { ButtonInteraction, Client, Collection, Colors, EmbedBuilder } from "discord.js";

interface Button {
  data: {
    isRegex: boolean;
    customId: string | RegExp;
  };
  execute: (Interaction: ButtonInteraction) => Promise<void>;
}

export default class ButtonManager {
  public client: Client;
  public patterns: Button[] = [];

  constructor(client: Client) {
    this.client = client;

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.replied) return;

      this.handleButton(interaction);

    });
  }

  public handleButton(interaction: ButtonInteraction) {
    const button = this.patterns.find((button) => {
      if (button.data.isRegex) {
        return (button.data.customId as RegExp).test(interaction.customId);
      } else {
        return button.data.customId === interaction.customId;
      }
    });

    if (!button) return interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle("Error")
          .setDescription(`This button has expired.`)
          .setColor(Colors.Red)
          .setFooter({ text: `buttonId: ${interaction.customId}` }),
      ],
    });

    button.execute(interaction);
  }

  public registerButton(pattern: RegExp | string, callback: (interaction: ButtonInteraction, fields: Record<string, string>) => Promise<any>) {
    if (typeof pattern === "string") {

      const buttonCommand: Button = {
        data: {
          isRegex: false,
          customId: pattern,
        },

        execute: async (interaction: ButtonInteraction) => {
          callback(interaction, {});
        },
      };

      this.patterns.push(buttonCommand);

    } else {
      const buttonCommand: Button = {
        data: {
          isRegex: true,
          customId: pattern,
        },

        execute: async (interaction: ButtonInteraction) => {
          const fields = pattern.exec(interaction.customId);
          if (!fields) return;
          callback(interaction, fields.groups as Record<string, string>);
        },
      };

      this.patterns.push(buttonCommand);
    }

  }
}
