require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function list() {
  const response = await ai.models.list();
  const models = response.items ? response.items : response;
  if (Array.isArray(models)) {
     console.log(models.map(m => m.name).filter(n => n.includes('flash')).join('\n'));
  } else {
     // try to extract from the raw object
     let str = JSON.stringify(models);
     let matches = str.match(/models\/gemini[^"']+/g);
     if (matches) {
       console.log([...new Set(matches)].join('\n'));
     }
  }
}
list();
