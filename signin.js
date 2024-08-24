const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { User, readUsers, writeUsers } = require('./user');

module.exports = {
    name: 'signin',
    description: 'Initiate the sign-in process.',
    async execute(message, args) {
        // Respond with an embed and button to initiate sign-in
        const embed = new EmbedBuilder()
            .setTitle('Sign In')
            .setDescription('Click the button below to sign in.')
            .setColor('#0099ff')
            .toJSON();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('signin_button')
                    .setLabel('Sign In')
                    .setStyle(ButtonStyle.Primary)
            )
            .toJSON();

        await message.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};

// Create a function to handle sign-in modal submission
async function handleSignIn(interaction) {
    // Create and show the modal for sign-in details
    const modal = new ModalBuilder()
        .setCustomId('signin_modal')
        .setTitle('Sign In')
        .setDescription('Please enter your details.')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('Name')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your name')
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId('email')
                    .setLabel('Email')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your email')
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId('phone')
                    .setLabel('Phone Number')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your phone number')
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId('password')
                    .setLabel('Password')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your password')
                    .setRequired(true)
            )
        );

    await interaction.showModal(modal);
}

// Export the function to handle sign-in modal submission
module.exports.handleSignIn = handleSignIn;
