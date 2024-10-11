export function fuzzyMatch(pattern: string, str: string): boolean {
  let patternIdx = 0
  let strIdx = 0
  const patternLength = pattern.length
  const strLength = str.length

  while (patternIdx < patternLength && strIdx < strLength) {
    if (pattern[patternIdx].toLowerCase() === str[strIdx].toLowerCase()) {
      patternIdx++
    }
    strIdx++
  }

  return patternIdx === patternLength
}

export function scoreMatch(pattern: string, str: string): number {
  if (!fuzzyMatch(pattern, str))
    return -1

  let score = 0
  let patternIdx = 0
  let consecutiveMatches = 0

  for (let strIdx = 0; strIdx < str.length; strIdx++) {
    if (pattern[patternIdx]?.toLowerCase() === str[strIdx].toLowerCase()) {
      score += 1 + consecutiveMatches
      consecutiveMatches++
      patternIdx++
    }
    else {
      consecutiveMatches = 0
    }
  }

  return score
}
