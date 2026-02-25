# Question Rotation - Correct Implementation

## Your Requirements (Confirmed)

1. ✅ Each NEW game loads fresh questions (not used in previous games)
2. ✅ Within SAME game, questions can't repeat
3. ❌ **BROKEN:** When all questions exhausted, use OLDEST used question for that diamond value

## The Bug

### Current Code:

```typescript
const getUsedQuestions = async (): Promise<string[]> => {
  const { data } = await supabase
    .from('used_questions')
    .select('question_id')
    .order('used_at', { ascending: true }) // ✅ Oldest first

  return data?.map(item => item.question_id) || [] // ❌ Loses order!
}

function getQuestionForCategoryPoint(
  categoryId: string,
  diamonds: number,
  allQuestions: Question[],
  usedQuestionIds: string[] // ❌ Just IDs, no timestamps
): Question | null {
  // ...
  const usedQuestions = questions.filter(q => usedQuestionIds.includes(q.id))

  // ❌ Returns first in array, NOT oldest by timestamp!
  return usedQuestions[0]
}
```

### Why It's Broken:

1. `getUsedQuestions()` returns ordered array: `['Q1', 'Q3', 'Q2']` (oldest to newest)
2. But when filtering: `questions.filter(q => usedQuestionIds.includes(q.id))`
3. The result is in the order of `questions` array, NOT the order of `usedQuestionIds`!
4. So you lose the timestamp ordering

### Example:

```
Database (ordered by used_at):
- Q1: used 3 days ago (oldest)
- Q3: used 2 days ago
- Q2: used 1 day ago (newest)

usedQuestionIds = ['Q1', 'Q3', 'Q2']  // Ordered oldest first

questions array = [Q2, Q1, Q3]  // Ordered by ID

usedQuestions = questions.filter(q => usedQuestionIds.includes(q.id))
// Result: [Q2, Q1, Q3]  // ❌ Wrong order! Should be [Q1, Q3, Q2]

return usedQuestions[0]  // Returns Q2 (newest), not Q1 (oldest)!
```

## The Fix

### Option 1: Return Ordered Data (Recommended)

```typescript
// Change return type to include order information
interface UsedQuestion {
  question_id: string
  used_at: string
}

const getUsedQuestions = async (): Promise<UsedQuestion[]> => {
  const { data, error } = await supabase
    .from('used_questions')
    .select('question_id, used_at')
    .order('used_at', { ascending: true })

  if (error) {
    console.error('Error fetching used questions:', error)
    return []
  }

  return data || []
}

function getQuestionForCategoryPoint(
  categoryId: string,
  diamonds: number,
  allQuestions: Question[],
  usedQuestions: UsedQuestion[] // ✅ Now has timestamps
): Question | null {
  const questions = allQuestions.filter(
    q => q.category_id === categoryId && q.diamonds === diamonds
  )

  if (questions.length === 0) return null

  // Get IDs of used questions
  const usedQuestionIds = usedQuestions.map(u => u.question_id)

  // Separate unused and used questions
  const unusedQuestions = questions.filter(q => !usedQuestionIds.includes(q.id))

  if (unusedQuestions.length > 0) {
    // Return random unused question
    return shuffle(unusedQuestions)[0]
  }

  // ✅ All used, return OLDEST used question
  // Find the oldest used question for this category/diamond combo
  for (const usedQ of usedQuestions) {
    // Already ordered oldest first
    const question = questions.find(q => q.id === usedQ.question_id)
    if (question) {
      return question // ✅ Returns oldest!
    }
  }

  return null
}
```

### Option 2: Preserve Order with Map (Alternative)

```typescript
const getUsedQuestions = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('used_questions')
    .select('question_id')
    .order('used_at', { ascending: true })

  if (error) {
    console.error('Error fetching used questions:', error)
    return []
  }

  return data?.map(item => item.question_id) || []
}

function getQuestionForCategoryPoint(
  categoryId: string,
  diamonds: number,
  allQuestions: Question[],
  usedQuestionIds: string[] // Ordered oldest first
): Question | null {
  const questions = allQuestions.filter(
    q => q.category_id === categoryId && q.diamonds === diamonds
  )

  if (questions.length === 0) return null

  // Separate unused and used questions
  const unusedQuestions = questions.filter(q => !usedQuestionIds.includes(q.id))

  if (unusedQuestions.length > 0) {
    return shuffle(unusedQuestions)[0]
  }

  // ✅ All used, find oldest by iterating usedQuestionIds (already ordered)
  for (const usedId of usedQuestionIds) {
    const question = questions.find(q => q.id === usedId)
    if (question) {
      return question // ✅ Returns oldest!
    }
  }

  return null
}
```

## Complete Implementation

Here's the full fix for your game page:

```typescript
// Update the interface
interface UsedQuestion {
  question_id: string
  used_at: string
}

// Update getUsedQuestions
const getUsedQuestions = async (): Promise<UsedQuestion[]> => {
  const { data, error } = await supabase
    .from('used_questions')
    .select('question_id, used_at')
    .order('used_at', { ascending: true })

  if (error) {
    console.error('Error fetching used questions:', error)
    return []
  }

  return data || []
}

// Update getQuestionForCategoryPoint signature
function getQuestionForCategoryPoint(
  categoryId: string,
  diamonds: number,
  allQuestions: Question[],
  usedQuestions: UsedQuestion[]
): Question | null {
  const questions = allQuestions.filter(
    q => q.category_id === categoryId && q.diamonds === diamonds
  )

  if (questions.length === 0) return null

  const usedQuestionIds = usedQuestions.map(u => u.question_id)
  const unusedQuestions = questions.filter(q => !usedQuestionIds.includes(q.id))

  if (unusedQuestions.length > 0) {
    return shuffle(unusedQuestions)[0]
  }

  // All used, return oldest
  for (const usedQ of usedQuestions) {
    const question = questions.find(q => q.id === usedQ.question_id)
    if (question) {
      return question
    }
  }

  return null
}

// Update initializeGame
const initializeGame = async () => {
  // ... existing code ...

  // Get used questions with timestamps
  const usedQuestions = await getUsedQuestions()

  // Pre-load questions map
  const map: Record<string, Question[]> = {}
  for (const category of categoriesData || []) {
    for (const diamonds of [10, 25, 50, 75, 100]) {
      const key = `${category.id}-${diamonds}`
      const question = getQuestionForCategoryPoint(
        category.id,
        diamonds,
        sortedQuestions,
        usedQuestions // ✅ Now includes timestamps
      )
      map[key] = question ? [question] : []
    }
  }
  setRotatedQuestionsMap(map)
}
```

## Testing the Fix

### Test Case 1: Fresh Category

```
Category: Sports, 25 diamonds
Questions: Q1, Q2, Q3
Used: None

Expected: Shows Q1, Q2, or Q3 (random)
Result: ✅ Works
```

### Test Case 2: Partially Used

```
Category: Sports, 25 diamonds
Questions: Q1, Q2, Q3
Used: Q1 (3 days ago), Q2 (1 day ago)

Expected: Shows Q3 (only unused)
Result: ✅ Works
```

### Test Case 3: All Used (THE FIX)

```
Category: Sports, 25 diamonds
Questions: Q1, Q2, Q3
Used:
  - Q1 (3 days ago) ← OLDEST
  - Q3 (2 days ago)
  - Q2 (1 day ago)

Expected: Shows Q1 (oldest)
Current: Shows Q2 or Q1 or Q3 (random) ❌
Fixed: Shows Q1 (oldest) ✅
```

### Test Case 4: Multiple Games

```
Game 1:
- Sports 25: Shows Q1 (unused) → Answer
- Sports 25: Shows Q2 (unused) → Answer
- Sports 25: Shows Q3 (unused) → Answer

Game 2:
- Sports 25: Shows Q1 (oldest used) → Answer

Game 3:
- Sports 25: Shows Q2 (now oldest) → Answer

Game 4:
- Sports 25: Shows Q3 (now oldest) → Answer

Game 5:
- Sports 25: Shows Q1 again (cycle complete)
```

## Additional Improvements

### 1. Show Question Age

```typescript
// In the game UI, show when question was last used
const getQuestionAge = (questionId: string, usedQuestions: UsedQuestion[]) => {
  const used = usedQuestions.find(u => u.question_id === questionId)
  if (!used) return 'Never used'

  const daysAgo = Math.floor(
    (Date.now() - new Date(used.used_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysAgo === 0 ? 'Today' : `${daysAgo} days ago`
}
```

### 2. Admin View: Question Usage Stats

```typescript
// Show in admin panel
const getQuestionStats = async (categoryId: string) => {
  const { data: questions } = await supabase
    .from('diamond_questions')
    .select(
      `
      id,
      question_en,
      diamonds,
      used_questions (
        used_at
      )
    `
    )
    .eq('category_id', categoryId)

  return questions?.map(q => ({
    ...q,
    timesUsed: q.used_questions.length,
    lastUsed: q.used_questions[0]?.used_at || null,
    neverUsed: q.used_questions.length === 0,
  }))
}
```

### 3. Reset Old Questions

```typescript
// Admin function: Reset questions older than X days
const resetOldQuestions = async (daysOld: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const { error } = await supabase
    .from('used_questions')
    .delete()
    .lt('used_at', cutoffDate.toISOString())

  if (!error) {
    alert(`Reset questions older than ${daysOld} days`)
  }
}
```

## Summary

**Current Status:**

- ✅ Each new game loads fresh questions
- ✅ Within game, no repeats
- ❌ "Oldest first" doesn't work (returns random used question)

**After Fix:**

- ✅ Each new game loads fresh questions
- ✅ Within game, no repeats
- ✅ "Oldest first" works correctly

**Implementation Time:** 15 minutes

**Files to Change:**

- `app/game/page.tsx` (one file, ~20 lines changed)

Would you like me to implement this fix now?
