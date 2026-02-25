# Question Rotation System - Critical Analysis

## 🔴 CRITICAL ISSUE FOUND

Your question rotation system has a **major flaw** that prevents it from working as intended!

## The Problem

### What Should Happen:

1. Load all used questions from database
2. When selecting a question, prioritize unused questions
3. After answering, mark question as used in database
4. Next time game loads, avoid those used questions
5. Once all questions in a category are used, start over

### What Actually Happens:

1. ✅ Loads used questions from database on game start
2. ✅ Prioritizes unused questions initially
3. ✅ Marks questions as used in database after answering
4. ❌ **NEVER REFRESHES** the question map with new unused questions
5. ❌ Questions can repeat in the SAME game session

## The Root Cause

### Issue #1: Questions Map Never Updates

```typescript
// This runs ONCE when game starts
const initializeGame = async () => {
  // Get used questions from database
  const usedQuestionIds = await getUsedQuestions()

  // Build question map with unused questions
  const map: Record<string, Question[]> = {}
  for (const category of categoriesData || []) {
    for (const diamonds of [10, 25, 50, 75, 100]) {
      const key = `${category.id}-${diamonds}`
      const question = getQuestionForCategoryPoint(
        category.id,
        diamonds,
        sortedQuestions,
        usedQuestionIds // ❌ This is from game start, never updated!
      )
      map[key] = question ? [question] : []
    }
  }
  setRotatedQuestionsMap(map)
}
```

**Problem:** The `usedQuestionIds` is fetched ONCE at game start. When you answer a question:

- It's added to `gameState.answeredQuestions` (local state)
- It's saved to database via `saveUsedQuestion()`
- But `rotatedQuestionsMap` is NEVER regenerated with the new used questions!

### Issue #2: Same Question Can Appear Multiple Times

```typescript
const handleQuestionClick = (question: Question) => {
  // Only checks local state, not database
  if (gameState.answeredQuestions.includes(question.id)) return

  // ... answer the question ...

  // Saves to database
  saveUsedQuestion(selectedQuestion.id)

  // ❌ But rotatedQuestionsMap still has this question available!
}
```

### Issue #3: No Rotation After Answer

When a question is answered, the map should be updated to show the NEXT unused question for that category/diamond combination. Currently it doesn't.

## Real-World Impact

### Scenario 1: Same Game Session

```
Game starts:
- Category "Sports", 25 diamonds has 5 questions
- Used questions in DB: [Q1, Q2]
- Map shows: Q3 (correct - first unused)

Player answers Q3:
- Q3 saved to database ✅
- gameState.answeredQuestions includes Q3 ✅
- Map still shows Q3 ❌ (should show Q4)

If player clicks same spot again:
- handleQuestionClick blocks it (checks gameState) ✅
- But if they refresh page... ❌
```

### Scenario 2: New Game Session

```
Game 1:
- Player answers Q3, Q4, Q5
- All saved to database ✅

Game 2 (new session):
- Loads used questions: [Q1, Q2, Q3, Q4, Q5]
- Map correctly shows: (no questions available) ✅
- System works as intended ✅

BUT... if all questions are used:
- getQuestionForCategoryPoint returns first USED question
- So Q1 appears again
- This is INTENDED behavior (rotation) ✅
```

## The Fix

### Solution 1: Refresh Map After Each Answer (Recommended)

```typescript
const handleSubmitAnswer = async (correct: boolean, team: 1 | 2) => {
  // ... existing answer logic ...

  // Save question as used
  await saveUsedQuestion(selectedQuestion.id)

  // ✅ REFRESH THE QUESTION MAP
  await refreshQuestionMap()

  // ... rest of the code ...
}

const refreshQuestionMap = async () => {
  // Get CURRENT used questions from database
  const usedQuestionIds = await getUsedQuestions()

  // Rebuild the map with updated used questions
  const map: Record<string, Question[]> = {}
  for (const category of categories) {
    for (const diamonds of [10, 25, 50, 75, 100]) {
      const key = `${category.id}-${diamonds}`
      const question = getQuestionForCategoryPoint(
        category.id,
        diamonds,
        questions,
        usedQuestionIds // ✅ Fresh from database!
      )
      map[key] = question ? [question] : []
    }
  }
  setRotatedQuestionsMap(map)
}
```

### Solution 2: Track Used Questions in State (Simpler)

```typescript
const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])

const initializeGame = async () => {
  // ... existing code ...

  // Load and store used questions in state
  const usedIds = await getUsedQuestions()
  setUsedQuestionIds(usedIds)

  // Build map
  const map = buildQuestionMap(categories, questions, usedIds)
  setRotatedQuestionsMap(map)
}

const handleSubmitAnswer = async (correct: boolean, team: 1 | 2) => {
  // ... existing answer logic ...

  // Save to database
  await saveUsedQuestion(selectedQuestion.id)

  // ✅ Update local state
  setUsedQuestionIds(prev => [...prev, selectedQuestion.id])

  // ✅ Rebuild map with updated used questions
  const map = buildQuestionMap(categories, questions, [...usedQuestionIds, selectedQuestion.id])
  setRotatedQuestionsMap(map)
}

// Helper function
const buildQuestionMap = (categories: Category[], questions: Question[], usedIds: string[]) => {
  const map: Record<string, Question[]> = {}
  for (const category of categories) {
    for (const diamonds of [10, 25, 50, 75, 100]) {
      const key = `${category.id}-${diamonds}`
      const question = getQuestionForCategoryPoint(category.id, diamonds, questions, usedIds)
      map[key] = question ? [question] : []
    }
  }
  return map
}
```

### Solution 3: Real-Time Updates (Advanced)

```typescript
// Use Supabase real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('used_questions_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'used_questions',
      },
      async payload => {
        // Question was used, refresh map
        await refreshQuestionMap()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## Testing the Fix

### Test Case 1: Single Category Exhaustion

```
Setup:
- Category "Sports" with 3 questions (Q1, Q2, Q3)
- All 25 diamonds

Expected Behavior:
1. Game 1: Shows Q1 → Answer → Shows Q2 → Answer → Shows Q3 → Answer
2. Game 2: Shows Q1 again (rotation complete)

Current Behavior:
1. Game 1: Shows Q1 → Answer → Still shows Q1 (blocked by state)
2. Game 2: Shows Q2 (correct, but Game 1 was wrong)
```

### Test Case 2: Multiple Games

```
Setup:
- 10 questions per category

Expected:
- Game 1: Use 5 questions
- Game 2: Use remaining 5 questions
- Game 3: Start over with first 5

Current:
- Works correctly between games ✅
- But within a game, map doesn't update ❌
```

## Recommended Implementation

I recommend **Solution 2** because:

1. ✅ Simple to implement
2. ✅ No extra database calls
3. ✅ State-based, React-friendly
4. ✅ Easy to test
5. ✅ Maintains existing logic

**Solution 1** is also good but requires database call after each answer (slower).

**Solution 3** is overkill for this use case.

## Additional Improvements

### 1. Add Visual Feedback

```typescript
// Show how many questions are left
<Badge>
  {unusedCount} / {totalCount} questions remaining
</Badge>
```

### 2. Reset Button

```typescript
// Allow admin to reset used questions
const resetUsedQuestions = async (categoryId?: string) => {
  if (categoryId) {
    // Reset specific category
    await supabase.from('used_questions').delete().in('question_id', questionsInCategory)
  } else {
    // Reset all
    await supabase.from('used_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  }
}
```

### 3. Better Rotation Logic

```typescript
// Instead of just returning first used question when all are used,
// return the LEAST RECENTLY used question

function getQuestionForCategoryPoint(
  categoryId: string,
  diamonds: number,
  allQuestions: Question[],
  usedQuestionIds: string[],
  usedQuestionsWithDates: Array<{ id: string; used_at: Date }> // ✅ Add timestamps
): Question | null {
  const questions = allQuestions.filter(
    q => q.category_id === categoryId && q.diamonds === diamonds
  )

  if (questions.length === 0) return null

  const unusedQuestions = questions.filter(q => !usedQuestionIds.includes(q.id))

  if (unusedQuestions.length > 0) {
    return shuffle(unusedQuestions)[0]
  }

  // ✅ All used, return LEAST RECENTLY used
  const questionsWithDates = questions.map(q => ({
    question: q,
    usedAt: usedQuestionsWithDates.find(u => u.id === q.id)?.used_at,
  }))

  questionsWithDates.sort((a, b) => {
    if (!a.usedAt) return -1
    if (!b.usedAt) return 1
    return a.usedAt.getTime() - b.usedAt.getTime()
  })

  return questionsWithDates[0].question
}
```

## Summary

**Current Status:** ⚠️ Partially Working

- ✅ Works between game sessions
- ❌ Doesn't update within a game session
- ❌ Map never refreshes after answers

**Impact:** Medium-High

- Questions won't repeat in same session (blocked by state)
- But map shows wrong questions
- Confusing UX (same question appears to be available)

**Fix Difficulty:** Easy (30 minutes)

**Priority:** High (this is your main feature!)

## Next Steps

1. Implement Solution 2 (state-based tracking)
2. Add visual feedback for remaining questions
3. Test thoroughly with small question sets
4. Consider adding reset functionality
5. Add least-recently-used logic for better rotation

Would you like me to implement the fix for you?
