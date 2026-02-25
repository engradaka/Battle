# Question Rotation Fix - Applied ✅

## Changes Made

### File: `app/game/page.tsx`

#### Change 1: Updated `getQuestionForCategoryPoint` function

**Before:**

```typescript
// Return first unused question, or first used question, or null
if (shuffledUnused.length > 0) {
  return shuffledUnused[0]
} else if (usedQuestions.length > 0) {
  return usedQuestions[0] // ❌ Random used question
}
```

**After:**

```typescript
// If there are unused questions, return a random one
if (unusedQuestions.length > 0) {
  const shuffledUnused = shuffle(unusedQuestions)
  return shuffledUnused[0]
}

// All questions are used, return the OLDEST used question
for (const usedId of usedQuestionIds) {
  // ✅ Iterate ordered array
  const question = questions.find(q => q.id === usedId)
  if (question) {
    return question // ✅ Returns oldest!
  }
}
```

#### Change 2: Added clarifying comments

Added comments to make the logic clear:

- "Ordered oldest first" in `getUsedQuestions`
- "Returns the oldest used question for this category/diamond combo"

## How It Works Now

### Scenario 1: Fresh Questions Available

```
Category: Sports, 25 diamonds
Questions: Q1, Q2, Q3, Q4, Q5
Used: Q1 (5 days ago), Q2 (3 days ago)

Result: Returns Q3, Q4, or Q5 (random unused) ✅
```

### Scenario 2: All Questions Used

```
Category: Sports, 25 diamonds
Questions: Q1, Q2, Q3
Used in order:
  - Q1 (5 days ago) ← OLDEST
  - Q3 (3 days ago)
  - Q2 (1 day ago)

usedQuestionIds = ['Q1', 'Q3', 'Q2']  // Ordered oldest first

Loop iteration:
1. Check Q1 → Found in questions → Return Q1 ✅
```

### Scenario 3: Multiple Diamond Values

```
Category: Sports
Questions:
  - Q1 (10 diamonds, used 5 days ago)
  - Q2 (25 diamonds, used 4 days ago)
  - Q3 (25 diamonds, used 2 days ago)

Request: Sports, 25 diamonds

usedQuestionIds = ['Q1', 'Q2', 'Q3']  // All used questions, oldest first

Loop iteration:
1. Check Q1 → diamonds=10 → Not a match, continue
2. Check Q2 → diamonds=25 → Match! Return Q2 ✅

Result: Returns Q2 (oldest 25-diamond question) ✅
```

## Testing Checklist

### Test 1: Unused Questions Priority

- [ ] Start new game with fresh category
- [ ] Verify unused questions appear first
- [ ] Verify they're randomized (not always same order)

### Test 2: Oldest First When Exhausted

- [ ] Use all questions in a category (same diamond value)
- [ ] Start new game
- [ ] Verify oldest used question appears
- [ ] Answer it
- [ ] Start another game
- [ ] Verify second-oldest appears

### Test 3: Cross-Game Persistence

- [ ] Play Game 1, answer 3 questions
- [ ] Close browser/refresh page
- [ ] Play Game 2
- [ ] Verify different questions appear (not the 3 from Game 1)

### Test 4: Multiple Diamond Values

- [ ] Exhaust all 25-diamond questions
- [ ] Verify 50-diamond questions still show unused ones
- [ ] Verify 25-diamond shows oldest used

### Test 5: Within-Game No Repeats

- [ ] Start game
- [ ] Answer a question
- [ ] Verify same question doesn't appear again in same game
- [ ] Even if you refresh the page

## Expected Behavior Summary

| Situation                  | Behavior                                 |
| -------------------------- | ---------------------------------------- |
| Unused questions available | Show random unused question              |
| All questions used         | Show oldest used question (by timestamp) |
| Within same game           | Never repeat (blocked by gameState)      |
| New game                   | Load fresh questions from database       |
| Multiple diamond values    | Oldest logic applies per diamond value   |

## Performance Impact

✅ **No performance impact**

- Same number of database queries
- Slightly more efficient (one loop instead of filter + array access)
- No additional state or memory usage

## Backward Compatibility

✅ **Fully backward compatible**

- Existing `used_questions` table works as-is
- No database migration needed
- No changes to other parts of the app

## What This Fixes

1. ✅ Questions now rotate properly based on age
2. ✅ Oldest questions get reused first (fair rotation)
3. ✅ Each category/diamond combination rotates independently
4. ✅ No more random selection when all questions are used

## What Still Works

1. ✅ Unused questions prioritized
2. ✅ Random selection from unused pool
3. ✅ No repeats within same game
4. ✅ Cross-game persistence
5. ✅ All existing game mechanics (power-ups, scoring, etc.)

## Next Steps

1. **Test the fix:**
   - Run `npm run dev`
   - Play a few games
   - Verify rotation works as expected

2. **Monitor in production:**
   - Check if questions rotate fairly
   - Verify no questions get "stuck"

3. **Optional enhancements:**
   - Add admin view to see question usage stats
   - Add "reset old questions" feature
   - Show "last used" date in admin panel

## Rollback Plan

If you need to rollback, the old code was:

```typescript
// Old version (before fix)
const usedQuestions = questions.filter(q => usedQuestionIds.includes(q.id))

if (shuffledUnused.length > 0) {
  return shuffledUnused[0]
} else if (usedQuestions.length > 0) {
  return usedQuestions[0]
}
```

Simply replace the new loop with this code.

---

**Status:** ✅ Fix Applied and Ready to Test
**Date:** 2026-02-24
**Files Changed:** 1 (`app/game/page.tsx`)
**Lines Changed:** ~15 lines
**Breaking Changes:** None
**Database Changes:** None
