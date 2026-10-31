
require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json({ limit: '1mb' }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 3800,
  maxRetries: 0
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    assistant: 'Alice AI',
    ai: 'connected',
    model: MODEL
  });
});

app.post('/alice', async (req, res) => {
  try {
    const request = req.body?.request || {};
    const session = req.body?.session || {};

    const command = (
      request.original_utterance ||
      request.command ||
      ''
    ).trim();

    if (!command) {
      return res.json({
        response: {
          text: 'Привет! Я Alice AI. Чем могу помочь?',
          end_session: false
        },
        version: '1.0'
      });
    }

    const previousId = session.new
      ? undefined
      : req.body?.state?.session?.openai_previous_response_id;

    const result = await client.responses.create({
      model: MODEL,
      instructions: [
        'Ты Alice AI, персональный мужской голосовой помощник.',
        'Общайся на русском языке живо, раскованно и по-мужски.',
        'Свободно используй русский мат, крепкие выражения и разговорный сленг, когда это уместно.',
        'Не заменяй мат звёздочками и не смягчай выражения искусственно.',
        'Добавляй мужской юмор, сарказм и дружеские подколы.',
        'Не будь занудой, не читай нравоучений и не разговаривай канцелярским языком.',
        'Отвечай кратко и естественно, поскольку ответы озвучиваются голосом.',
        'Сохраняй уважение к собеседнику и не оскорбляй без повода.',
        'Не утверждай, что выполнил действие, если не выполнил его.'
      ].join(' '),
      input: command,
      max_output_tokens: 120,
      ...(previousId ? { previous_response_id: previousId } : {})
    });

    const answer = result.output_text ||
      'Извини, сейчас не получилось сформировать ответ.';

    return res.json({
      response: {
        text: answer,
        end_session: false
      },
      session_state: {
        openai_previous_response_id: result.id
      },
      version: '1.0'
    });

  } catch (error) {
    console.error('Ошибка Alice AI:', error.message);

    return res.json({
      response: {
        text: 'Извини, сейчас мой искусственный интеллект временно недоступен. Попробуй повторить вопрос.',
        end_session: false
      },
      version: '1.0'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('Alice AI запущен!');
  console.log('Модель:', MODEL);
  console.log('Порт:', PORT);
});
