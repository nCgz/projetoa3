const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Sua chave de API do OpenAI

// Função para corrigir erros gramaticais básicos
function corrigirGramatica(texto) {
  // Substituir 'helo' por 'hello'
  texto = texto.replace(/\bhelo\b/gi, 'hello');

  // Adicionar ponto de interrogação no final, se não houver pontuação final
  if (!/[.?!]\s*$/.test(texto)) {
    texto += '?';
  }

  return texto;
}

// Função para interagir com a API do ChatGPT
async function enviarMensagemParaChatGPT(mensagem) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'text-davinci-003', // Modelo ChatGPT a ser usado
        messages: [
          {
            role: 'user',
            content: mensagem,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const resposta = response.data.choices[0].message.content;
    return corrigirGramatica(resposta);
  } catch (error) {
    console.error('Erro ao enviar mensagem para o ChatGPT:', error);
    throw error;
  }
}

app.post('/api/message', async (req, res) => {
  const { message } = req.body;

  try {
    const respostaDoChatGPT = await enviarMensagemParaChatGPT(message);
    res.json({ reply: respostaDoChatGPT });
  } catch (error) {
    console.error('Erro interno ao processar a mensagem:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
