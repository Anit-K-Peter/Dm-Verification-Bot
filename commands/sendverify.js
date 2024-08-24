const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'sendverify',
    description: 'Send verification embed with button',
    async execute(message, args) {
        // Check if a channel mention exists in the command
        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.reply('Please mention a valid channel to send the verification embed to.');
        }

        // Generate a verification code
        const verificationCode = generateVerificationCode();

        // Send verification embed with button to the specified channel
        const embed = new EmbedBuilder()
            .setTitle('Enter Verification Code')
            .setDescription('Please click the button below to enter the verification code.')
            .setColor('#0099ff')
            .toJSON();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Primary)
            )
            .toJSON();

        const sentMessage = await channel.send({ embeds: [embed], components: [row], ephemeral: true });
        const filter = i => i.customId === 'verify';

        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            // Send a DM to the user with the verification code
            await interaction.user.send(`Your verification code is: ${verificationCode}`, { ephemeral: true });

            // Send a message to the channel with embed and a button to open modal
            const verifyEmbed = new EmbedBuilder()
                .setTitle('Enter Verification Code')
                .setDescription('Please click the button below to enter the verification code.')
                .setColor('#0099ff')
                .toJSON();

            const verifyRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('open_modal')
                        .setLabel('Enter Code')
                        .setStyle(ButtonStyle.Primary)
                )
                .toJSON();

            const verifyMessage = await interaction.channel.send({ embeds: [verifyEmbed], components: [verifyRow], ephemeral: true });

            // Create a collector for the button interaction
            const filter = i => i.customId === 'open_modal' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async buttonInteraction => {
                // Create and show the modal
                const modal = new ModalBuilder()
                    .setCustomId('verify_modal')
                    .setTitle('Enter Verification Code')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('verification_code')
                                .setLabel('Verification Code')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                await buttonInteraction.showModal(modal);
            });

            collector.on('end', () => {
                verifyMessage.components[0].components[0].setDisabled(true);
                verifyMessage.edit({ components: verifyMessage.components });
            });
        });

        message.client.on('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'verify_modal') return;

            const typedCode = modalInteraction.fields.getTextInputValue('verification_code').trim();
            if (typedCode === verificationCode) {
                const role = message.guild.roles.cache.get('1250179450365280347'); // Replace with your role ID
                if (!role) {
                    await modalInteraction.reply({ content: 'Role not found. Please contact an administrator.', ephemeral: true });
                    return;
                }
                const member = message.guild.members.cache.get(modalInteraction.user.id);
                await member.roles.add(role);
                await modalInteraction.reply({ content: 'You have been verified and granted the role!', ephemeral: true });

                // Send successful verification DM
                await modalInteraction.user.send('Congratulations! You have been successfully verified.');

                // Delete the original verification message
                sentMessage.delete();
            } else {
                await modalInteraction.reply({ content: 'Incorrect code. Please try again.', ephemeral: true });
            }
        });
    },
};

function generateVerificationCode() {
    // Generate a random verification code
    return Math.floor(100000 + Math.random() * 900000).toString();
}
