require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const PROMPT_INSTRUCTIONS = `
You are an AI assistant designed to extract CRM lead information from messy datasets into a specific GrowEasy CRM format.
Your task is to take an array of messy JSON records (converted from CSV rows) and map them to the following fields:

- created_at: Lead creation date (must be convertible using JavaScript new Date(created_at))
- name: Lead name
- email: Primary email (if multiple, use first, append others to crm_note)
- country_code: Country code
- mobile_without_country_code: Mobile number (if multiple, use first, append others to crm_note)
- company: Company name
- city: City
- state: State
- country: Country
- lead_owner: Lead owner
- crm_status: Lead status (MUST be one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
- crm_note: Notes/remarks, follow-up notes, extra emails/phones, or anything useful that doesn't fit elsewhere.
- data_source: Source (MUST be one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots). If none match confidently, leave blank.
- possession_time: Property possession time
- description: Additional description

CRITICAL RULES:
1. If a record contains neither an email nor a mobile number, SKIP it (do not include it in the output array).
2. Each output record must correspond to a single input record.
3. Return a JSON object with a single key "records" containing the array of extracted CRM fields. Ensure valid JSON format.
`;

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvString = req.file.buffer.toString('utf-8');
    
    // Parse CSV
    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parsing warnings:', parsed.errors.slice(0, 5)); // log only first 5 warnings
    }

    // Limit to 50 records to prevent accidental API abuse (especially if a binary file was uploaded by mistake)
    const records = parsed.data.slice(0, 50);
    console.log(`Parsed ${parsed.data.length} records. Processing ${records.length} records in batches.`);
    
    // Batch processing to AI
    const BATCH_SIZE = 10;
    let allExtractedRecords = [];
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      const prompt = `${PROMPT_INSTRUCTIONS}\n\nHere is the batch of records to process:\n${JSON.stringify(batch)}`;
      
      let success = false;
      let retries = 0;
      const MAX_RETRIES = 5;

      while (!success && retries < MAX_RETRIES) {
        try {
          const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${(process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '').trim()}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini",
              response_format: { type: "json_object" },
              max_tokens: 4000,
              messages: [
                { role: "user", content: prompt }
              ]
            })
          });
          
          if (!apiResponse.ok) {
            const errData = await apiResponse.text();
            throw new Error(`OpenRouter API error: ${apiResponse.status} - ${errData}`);
          }
          
          const data = await apiResponse.json();
          let outputJson = data.choices[0].message.content;
          
          // Clean up potential markdown formatting (```json ... ```)
          outputJson = outputJson.replace(/^```(?:json)?/im, '').replace(/```$/m, '').trim();

          const parsedData = JSON.parse(outputJson);
          const extractedRecords = parsedData.records || [];
          allExtractedRecords = allExtractedRecords.concat(extractedRecords);
          success = true;

          // Add a modest delay between successful batches to avoid hitting rate limits too fast
          if (i + BATCH_SIZE < records.length) {
             await delay(2000); 
          }

        } catch (aiError) {
          const errString = String(aiError) + JSON.stringify(aiError, Object.getOwnPropertyNames(aiError));
          if (errString.includes('429') || errString.toLowerCase().includes('quota') || errString.toLowerCase().includes('rate limit')) {
            retries++;
            const backoffTime = 20000 * retries; // 20s, 40s, 60s, etc.
            console.warn(`Rate limit hit (429/Quota). Error details: ${errString.substring(0, 200)}...`);
            console.warn(`Retrying in ${backoffTime / 1000} seconds... (Attempt ${retries}/${MAX_RETRIES})`);
            await delay(backoffTime);
          } else {
            console.error('Error with AI processing batch:', aiError);
            return res.status(500).json({ error: 'Failed to process some records with AI', details: aiError.message });
          }
        }
      }

      if (!success) {
        return res.status(500).json({ error: 'Failed to process batch after maximum retries due to rate limits.' });
      }
    }

    res.json({
        total_imported: allExtractedRecords.length,
        total_skipped: records.length - allExtractedRecords.length, // approximate skip count
        records: allExtractedRecords
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

// Export the Express API for Vercel
module.exports = app;
