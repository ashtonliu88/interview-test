/**
 * @typedef {Object} VoiceEntry
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} audio_url
 * @property {string} transcript_raw
 * @property {string} transcript_user
 * @property {string} language_detected
 * @property {string} language_rendered
 * @property {string[]} tags_model
 * @property {string[]} tags_user
 * @property {string|null} category
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 * @property {number|null} emotion_score_score
 * @property {number[]|null} embedding
 * @property {string|null} [emotion_score_log] - Optional / extended columns in the real DB
 * @property {string|null} [tags_log]
 * @property {string|null} [tags_log_user_original]
 * @property {string|null} [entry_emoji]
 * @property {string|null} [emoji_source]
 * @property {string|null} [emoji_log]
 * @property {string|null} [reminder_date]
 * @property {string|null} [idea_status]
 */

/**
 * @typedef {Object} ProcessedResult
 * @property {string} summary
 * @property {Record<string, number>} tagFrequencies
 * @property {any[]} conflictAnalyses
 * @property {number} totalConflicts
 * @property {Record<string, number>} conflictTypes
 */

// Export empty object to make this a valid module
export {}; 