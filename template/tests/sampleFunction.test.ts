// @ts-nocheck
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, it, expect } from 'vitest'
import { mockVoiceEntries } from '../src/lib/mockData.js'
import processEntries from '../src/lib/sampleFunction.js'

describe('processEntries', () => {
  it('counts reflection tag correctly', () => {
    const result = processEntries(mockVoiceEntries)
    expect(result.tagFrequencies.reflection).toBe(mockVoiceEntries.length)
  })

  it('returns correct structure for empty array', () => {
    const result = processEntries([])
    expect(result).toEqual({
      summary: 'Analysed 0 entries, found 0 with internal conflicts',
      tagFrequencies: {},
      conflictAnalyses: [],
      totalConflicts: 0,
      conflictTypes: {}
    })
  })

  it('handles entries without transcript_user', () => {
    const entries = [
      { id: '1', tags_user: ['test'], transcript_user: null },
      { id: '2', tags_user: ['test'], transcript_user: undefined },
      { id: '3', tags_user: ['test'], transcript_user: '' }
    ]
    const result = processEntries(entries)
    expect(result.conflictAnalyses).toHaveLength(3)
    expect(result.totalConflicts).toBe(0)
    expect(result.tagFrequencies.test).toBe(3)
  })

  it('handles entries without tags_user', () => {
    const entries = [
      { id: '1', transcript_user: 'I feel happy today' },
      { id: '2', tags_user: null, transcript_user: 'I feel sad today' },
      { id: '3', tags_user: undefined, transcript_user: 'I feel okay today' }
    ]
    const result = processEntries(entries)
    expect(result.tagFrequencies).toEqual({})
    expect(result.conflictAnalyses).toHaveLength(3)
  })

  it('detects conflicts with "but" keyword', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I want to exercise but I feel too tired'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(1)
    expect(result.conflictAnalyses[0].hasConflict).toBe(true)
    expect(result.conflictAnalyses[0].voiceSplit).toBeTruthy()
    expect(result.conflictAnalyses[0].voiceSplit.voice1.text).toBe('I want to exercise')
    expect(result.conflictAnalyses[0].voiceSplit.voice2.text).toBe('I feel too tired')
  })

  it('detects conflicts with "however" keyword', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I should study however I want to relax'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(1)
    expect(result.conflictAnalyses[0].hasConflict).toBe(true)
    expect(result.conflictAnalyses[0].voiceSplit.conflictType).toBe('rational-vs-emotional')
  })

  it('detects conflicts with "though" keyword', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I think I am ready though I feel nervous'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(1)
    expect(result.conflictAnalyses[0].hasConflict).toBe(true)
    expect(result.conflictAnalyses[0].voiceSplit.conflictType).toBe('emotional-vs-rational')
  })

  it('detects conflicts with other conflict words', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I am confident yet I have doubts'
      },
      {
        id: '2',
        tags_user: ['reflection'],
        transcript_user: 'I am happy although I feel sad inside'
      },
      {
        id: '3',
        tags_user: ['reflection'],
        transcript_user: 'I love my job while I hate the commute'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(3)
    entries.forEach((_, index) => {
      expect(result.conflictAnalyses[index].hasConflict).toBe(true)
      expect(result.conflictAnalyses[index].voiceSplit).toBeTruthy()
    })
  })

  it('classifies voice types correctly', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I should work but I want to play'
      }
    ]
    const result = processEntries(entries)
    const voiceSplit = result.conflictAnalyses[0].voiceSplit
    expect(voiceSplit.voice1.type).toBe('rational')
    expect(voiceSplit.voice2.type).toBe('rational')
    expect(voiceSplit.voice1.sentiment).toBe('neutral')
    expect(voiceSplit.voice2.sentiment).toBe('neutral')
  })

  it('classifies emotional vs rational correctly', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I feel excited but I think it is risky'
      }
    ]
    const result = processEntries(entries)
    const voiceSplit = result.conflictAnalyses[0].voiceSplit
    expect(voiceSplit.voice1.type).toBe('emotional')
    expect(voiceSplit.voice2.type).toBe('rational')
  })

  it('detects negative sentiment correctly', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I like this but I don\'t want to continue'
      }
    ]
    const result = processEntries(entries)
    const voiceSplit = result.conflictAnalyses[0].voiceSplit
    expect(voiceSplit.voice2.sentiment).toBe('negative')
  })

  it('handles entries without conflicts', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I feel happy and excited today'
      },
      {
        id: '2',
        tags_user: ['reflection'],
        transcript_user: 'I want to succeed and I will work hard'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(0)
    expect(result.conflictAnalyses[0].hasConflict).toBe(false)
    expect(result.conflictAnalyses[1].hasConflict).toBe(false)
    expect(result.conflictAnalyses[0].voiceSplit).toBe(null)
    expect(result.conflictAnalyses[1].voiceSplit).toBe(null)
  })

  it('counts conflict types correctly', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I should study but I want to play'
      },
      {
        id: '2',
        tags_user: ['reflection'],
        transcript_user: 'I think it is good but I feel worried'
      },
      {
        id: '3',
        tags_user: ['reflection'],
        transcript_user: 'I am ready but I have concerns'
      }
    ]
    const result = processEntries(entries)
    expect(result.conflictTypes['rational-vs-emotional']).toBe(1)
    expect(result.conflictTypes['emotional-vs-rational']).toBe(1)
    expect(result.conflictTypes['general-contradiction']).toBe(1)
  })

  it('handles multiple conflict words in single entry', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I want to go but I am tired however I should try'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(1) // Should only detect first conflict
    expect(result.conflictAnalyses[0].hasConflict).toBe(true)
  })

  it('provides correct summary', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I want to go but I am tired'
      },
      {
        id: '2',
        tags_user: ['reflection'],
        transcript_user: 'I feel happy today'
      }
    ]
    const result = processEntries(entries)
    expect(result.summary).toBe('Analysed 2 entries, found 1 with internal conflicts')
  })

  it('handles case sensitivity in conflict detection', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I WANT TO GO BUT I AM TIRED'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(1)
    expect(result.conflictAnalyses[0].hasConflict).toBe(true)
  })

  it('handles entries with empty transcript_user string', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: ''
      }
    ]
    const result = processEntries(entries)
    expect(result.conflictAnalyses).toHaveLength(1)
    expect(result.conflictAnalyses[0].hasConflict).toBe(false)
    expect(result.totalConflicts).toBe(0)
  })

  it('handles conflict words at the beginning or end', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'but I want to try'
      },
      {
        id: '2',
        tags_user: ['reflection'],
        transcript_user: 'I want to try but'
      }
    ]
    const result = processEntries(entries)
    // These should not be detected as conflicts because they don't have proper format
    expect(result.totalConflicts).toBe(0)
  })

  it('handles entries where conflict words do not produce valid splits', () => {
    const entries = [
      {
        id: '1',
        tags_user: ['reflection'],
        transcript_user: 'I like this but'
      }
    ]
    const result = processEntries(entries)
    expect(result.totalConflicts).toBe(0)
    expect(result.conflictAnalyses[0].hasConflict).toBe(false)
  })
}) 