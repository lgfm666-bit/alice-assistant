require('dotenv').config();

const OpenAI = require('openai');

if (!process.env.OPENAI_API_KEY) {
  console.error('Не найден API-ключ в .env');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  const response = await client.responses.create({
    model: 'gpt-6-luna',
    instructions: 'Ты Alice AI, персональный помощник. Отвечай на русском языке, дружелюбно и кратко.',
    input: 'Привет! Представься и расскажи, что ты умеешь.'
  });

  console.log('\nОтвет Alice AI:\n');
  console.log(response.output_text);
}

main().catch(error => {
  console.error('Ошибка обращения к ИИ:', error.message);
});
