# AI Discord Bot Documentation

A comprehensive documentation site for your Discord AI bot featuring PuterClient integration, multiple AI models, and advanced logging capabilities.

## Features

- **Multiple AI Models**: DeepSeek, GPT-4, Claude, Grok, Gemini, and Qwen support
- **Comprehensive Logging**: All messages logged with full context (timestamp, server, channel, user)
- **Hybrid Commands**: Both slash commands and text command support
- **DM Support**: Automatic responses to direct messages
- **File Handling**: Auto-conversion to files for long responses (>2000 chars)
- **Security**: Environment variable based configuration

## Security Notes

⚠️ **CRITICAL SECURITY INFORMATION**

1. **Never commit credentials to version control**
   - Store Discord tokens in `.env` files
   - Use environment variables in production
   - Add `.env` to `.gitignore`

2. **Secure your Puter.com credentials**
   - Never hardcode login credentials in bot code
   - Consider using separate service accounts
   - Monitor API usage for abuse

3. **Bot Permissions**
   - Grant minimum required permissions
   - Regularly audit bot access
   - Use separate tokens for development/production

## Quick Setup

1. Create a Discord bot application at https://discord.com/developers
2. Copy the bot token to `.env` file: