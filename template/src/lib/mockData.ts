import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// @ts-ignore: ESLint parser doesn't support TS syntax
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const dataLines = lines.slice(1)
  
  // @ts-ignore: ESLint parser doesn't support TS syntax
  return dataLines.map((line, index) => {
    // Simple CSV parsing - handles quoted fields with commas
    const fields = []
    let currentField = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField)
        currentField = ''
      } else {
        currentField += char
      }
    }
    fields.push(currentField) // Add the last field
    
    return {
      id: `entry_${index + 1}`,
      user_id: 'mock_user',
      audio_url: null,
      transcript_raw: fields[0] || '',
      transcript_user: fields[1] || '',
      language_detected: 'en',
      language_rendered: 'en',
      tags_model: fields[2] ? fields[2].split(',').map(t => t.trim()) : [],
      tags_user: fields[3] ? fields[3].split(',').map(t => t.trim()) : ['reflection'],
      category: null,
      created_at: fields[5] || new Date().toISOString(),
      updated_at: fields[6] || new Date().toISOString(),
      emotion_score_score: fields[4] ? parseFloat(fields[4]) : null,
      embedding: fields[7] ? JSON.parse(fields[7]) : null,
    }
  })
}

// Load the CSV file
const csvPath = join(__dirname, 'Expanded_Diary_Entries.csv')
const csvContent = readFileSync(csvPath, 'utf-8')
export const mockVoiceEntries = parseCSV(csvContent)
