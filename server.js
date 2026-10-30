require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json({ limit: '1mb' }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';

const sessions = new Map();

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
    const command = req.body?.request?.command?.trim();

    if (!command) {
      return res.json({
        response: {
          text: 'Привет! Чем могу помочь?',
          end_session: false
        },
        version: '1.0'
      });
    }

    const sessionId = req.body?.session?.session_id;
    const isNewSession = req.body?.session?.new === true;

    if (isNewSession && sessionId) {
      sessions.delete(sessionId);
    }

    const previousId = sessionId
      ? sessions.get(sessionId)
      : undefined;

    const result = await client.responses.create({
      model: MODEL,
      instructions: [
        'Ты Alice AI, персональный голосовой помощник.',
        'Отвечай на русском языке.',
        'Будь дружелюбным, полезным и кратким.',
        'Не утверждай, что выполнил действие, если не выполнил его.'
      ].join(' '),
      input: command,
      ...(previousId ? { previous_response_id: previousId } : {})
    });

    if (sessionId) {
      sessions.set(sessionId, result.id);
    }

    const answer = result.output_text ||
      'Извини, сейчас не получилось сформировать ответ.';

    res.json({
      response: {
        text: answer,
        end_session: false
      },
      ...(req.body?.session
        ? { session: req.body.session }
        : {}),
      version: '1.0'
    });

  } catch (error) {
    console.error('Ошибка Alice AI:', error.message);

    res.status(502).json({
      response: {
        text: 'Извини, сейчас мой искусственный интеллект временно недоступен.',
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
