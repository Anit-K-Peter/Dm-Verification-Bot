const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'verify',
    async execute(message) {
        const code = generateRandomCode();

        // Send code via DM
        try {
            await message.author.send(`Your verification code is: ${code}`);
            await message.reply('A verification code has been sent to your DM. Please check your messages.');
        } catch (error) {
            console.error('Error sending DM:', error);
            await message.reply('An error occurred while sending the verification code. Please make sure your DMs are open.');
            return;
        }

        // Send embed with instructions and button to verify
        const embed = new EmbedBuilder()
            .setTitle('Verification Code')
            .setDescription('A verification code has been sent to your DM. Please enter the code here.');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_code')
                    .setLabel('Verify Code')
                    .setStyle(ButtonStyle.Primary)
            );

        const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

        // Create a collector for the button interaction
        const filter = i => i.customId === 'verify_code' && i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

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
            sentMessage.edit({ components: [] }); // Remove the button after interaction ends
        });

        message.client.on('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'verify_modal') return;

            const typedCode = modalInteraction.fields.getTextInputValue('verification_code').trim();
            if (typedCode === code) {
                const role = message.guild.roles.cache.get('1240546156577030166'); // Replace with your role ID
                if (!role) {
                    await modalInteraction.reply({ content: 'Role not found. Please contact an administrator.', ephemeral: true });
                    return;
                }
                const member = message.guild.members.cache.get(message.author.id);
                await member.roles.add(role);
                await modalInteraction.reply({ content: 'You have been verified and granted the role!', ephemeral: true });

                // Delete the original verification message
                await sentMessage.delete();
            } else {
                await modalInteraction.reply({ content: 'Incorrect code. Please try again.', ephemeral: true });
            }
        });
    },
};

function generateRandomCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}
