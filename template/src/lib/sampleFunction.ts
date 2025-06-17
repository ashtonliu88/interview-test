/**
 * processEntries
 * --------------
 * PURE function — no IO, no mutation, deterministic
 * Processes diary entries and detects conflicting internal perspectives.
 * @param {VoiceEntry[]} entries - Array of voice entries to process
 * @returns {ProcessedResult} - Processed result with conflict analysis
 */
// @ts-ignore: ESLint parser doesn't support TS parameter syntax
export function processEntries(entries) {
  const tagFrequencies = new Map()
  const conflictAnalyses = []
  const conflictTypes = new Map()
  
  for (const entry of entries) {
    if (entry.tags_user) {
      for (const tag of entry.tags_user) {
        tagFrequencies.set(tag, (tagFrequencies.get(tag) || 0) + 1)
      }
    }
  }
  
  for (const entry of entries) {
    if (!entry.transcript_user) {
      const analysis = {
        entryId: entry.id,
        hasConflict: false,
        signals: [],
        voiceSplit: null
      }
      conflictAnalyses.push(analysis)
      continue
    }
    
    const text = entry.transcript_user.toLowerCase()
    const originalText = entry.transcript_user
    
    //most common conflic words
    const conflictWords = ['but', 'however', 'though', 'yet', 'although', 'while']
    
    let hasConflict = false
    let voice1 = ''
    let voice2 = ''
    let conflictType = 'none'
    
    //conflict
    for (const word of conflictWords) {
      const wordIndex = text.indexOf(' ' + word + ' ')
      if (wordIndex !== -1) {
        hasConflict = true
        // split
        const parts = originalText.split(new RegExp(`\\s+${word}\\s+`, 'i'))
        if (parts.length >= 2) {
          voice1 = parts[0].trim()
          voice2 = parts.slice(1).join(' ' + word + ' ').trim()
          
          if (text.includes('should') && text.includes('want')) {
            conflictType = 'rational-vs-emotional'
          } else if (text.includes('feel') && text.includes('think')) {
            conflictType = 'emotional-vs-rational'
          } else {
            conflictType = 'general-contradiction'
          }
        }
        break
      }
    }
    
    const analysis = {
      entryId: entry.id,
      hasConflict: hasConflict,
      signals: hasConflict ? ['contradiction detected'] : [],
      voiceSplit: hasConflict && voice1 && voice2 ? {
        voice1: {
          text: voice1,
          type: voice1.toLowerCase().includes('should') ? 'rational' : 'emotional',
          sentiment: voice1.toLowerCase().includes('want') ? 'positive' : 'neutral'
        },
        voice2: {
          text: voice2,
          type: voice2.toLowerCase().includes('feel') ? 'emotional' : 'rational',
          sentiment: voice2.toLowerCase().includes('not') || voice2.toLowerCase().includes('don\'t') ? 'negative' : 'neutral'
        },
        conflictType: conflictType,
        confidence: 0.8
      } : null
    }
    
    if (hasConflict && voice1 && voice2 && analysis.voiceSplit) {
      const currentCount = conflictTypes.get(conflictType)
      conflictTypes.set(conflictType, currentCount ? currentCount + 1 : 1)
    }
    
    conflictAnalyses.push(analysis)
  }
  
  const totalConflicts = conflictAnalyses.filter(a => a.hasConflict).length
  
  //map conversion
  const tagFreqObj = Object.fromEntries(tagFrequencies)
  const conflictTypesObj = Object.fromEntries(conflictTypes)
  
  return {
    summary: `Analysed ${entries.length} entries, found ${totalConflicts} with internal conflicts`,
    tagFrequencies: tagFreqObj,
    conflictAnalyses: conflictAnalyses,
    totalConflicts: totalConflicts,
    conflictTypes: conflictTypesObj,
  }
}

export default processEntries 