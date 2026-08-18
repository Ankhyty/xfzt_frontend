/**
 * Typo-tolerant fuzzy string matching utility
 */

export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

export function fuzzyMatchScore(pattern: string, target: string): number {
  const p = pattern.trim().toLowerCase()
  const t = target.trim().toLowerCase()
  if (!p) return 100
  if (p === t) return 100

  // Direct substring match (Exact contains)
  if (t.includes(p)) return 90

  // Subsequence check (Characters appear in same relative order)
  let pIdx = 0
  for (let i = 0; i < t.length && pIdx < p.length; i++) {
    if (t[i] === p[pIdx]) {
      pIdx++
    }
  }
  if (pIdx === p.length) return 75

  // Sliding window Levenshtein distance on substrings
  const pLen = p.length
  let minDistance = 999
  for (let i = 0; i <= t.length - Math.max(1, pLen - 2); i++) {
    for (let len = Math.max(1, pLen - 1); len <= Math.min(t.length - i, pLen + 2); len++) {
      const windowStr = t.slice(i, i + len)
      const dist = levenshteinDistance(p, windowStr)
      if (dist < minDistance) {
        minDistance = dist
      }
    }
  }

  // If pattern length <= 3, allow max 1 typo. If length > 3, allow up to 2 typos.
  const allowedTypos = pLen <= 3 ? 1 : Math.max(1, Math.floor(pLen / 2.5))
  if (minDistance <= allowedTypos) {
    return 60 - minDistance * 10
  }

  // Character set overlap check for long strings with multiple character differences
  const pSet = new Set(p.split(''))
  let overlap = 0
  for (const ch of pSet) {
    if (t.includes(ch)) overlap++
  }
  const overlapRatio = overlap / pSet.size
  if (overlapRatio >= 0.65 && pLen >= 3) {
    return 30 + Math.round(overlapRatio * 20)
  }

  return 0
}

export function fuzzyFilterAndSort(items: string[], query: string): string[] {
  if (!query.trim()) return items

  const scored = items
    .map((item) => ({
      item,
      score: fuzzyMatchScore(query, item)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map((s) => s.item)
}
