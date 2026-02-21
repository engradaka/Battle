import { NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("[PDF Parse] Starting...")
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Limit file size to 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[PDF Parse] File size limit exceeded: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
      return NextResponse.json({ 
        success: false, 
        error: `File too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
      }, { status: 400 })
    }

    console.log("[PDF Parse] File:", file.name, file.type, file.size)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Use dynamic import for pdf-parse to avoid webpack issues
    const pdfParse = await import('pdf-parse') as any
    const pdf = pdfParse.default || pdfParse
    const data = await pdf(buffer)
    const text = data.text
    console.log("[PDF Parse] Text extracted, length:", text.length)

    const questions = extractQuestions(text)
    console.log("[PDF Parse] Questions found:", questions.length)
    
    return NextResponse.json({ success: true, questions })
  } catch (error: any) {
    console.error("[PDF Parse] Error:", error.message, error.stack)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}

function extractQuestions(text: string) {
  const questions: any[] = []
  const lines = text.split("\n").map(l => l.trim()).filter(l => l)
  
  // Pattern 1: Numbered Q&A (1. Question / Answer: ...)
  // Pattern 2: Q: / A: format
  // Pattern 3: Question? / Answer on next line
  // Pattern 4: Arabic support
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let question = ""
    let answer = ""
    let isArabic = /[\u0600-\u06FF]/.test(line)
    
    // Pattern 1: Numbered questions (1. / 1) / Q1. / Question 1:)
    if (line.match(/^(\d+[\.\)\:]|Q\d+[\.\:]|Question\s+\d+:)/i)) {
      question = line.replace(/^(\d+[\.\)\:]|Q\d+[\.\:]|Question\s+\d+:)/i, "").trim()
      
      // Look for answer in next lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j]
        
        // Check if it's an answer line
        if (nextLine.match(/^(Answer|A|الإجابة|ج)[:)\.]?\s*/i)) {
          answer = nextLine.replace(/^(Answer|A|الإجابة|ج)[:)\.]?\s*/i, "").trim()
          i = j // Skip processed lines
          break
        }
        // If next line is another question, use previous line as answer
        else if (nextLine.match(/^(\d+[\.\)\:]|Q\d+[\.\:]|Question\s+\d+:)/i)) {
          answer = lines[j - 1]
          i = j - 1
          break
        }
      }
    }
    
    // Pattern 2: Q: / A: format
    else if (line.match(/^(Q|Question|س|سؤال)[:)\.]?\s*/i)) {
      question = line.replace(/^(Q|Question|س|سؤال)[:)\.]?\s*/i, "").trim()
      
      // Look for A: in next lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].match(/^(A|Answer|ج|الإجابة)[:)\.]?\s*/i)) {
          answer = lines[j].replace(/^(A|Answer|ج|الإجابة)[:)\.]?\s*/i, "").trim()
          i = j
          break
        }
      }
    }
    
    // Pattern 3: Question ending with ?
    else if (line.includes("?") || line.includes("؟")) {
      question = line
      
      // Next non-empty line is likely the answer
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        // Make sure it's not another question
        if (!nextLine.includes("?") && !nextLine.includes("؟") && 
            !nextLine.match(/^(\d+[\.\)\:]|Q\d+|Question)/i)) {
          answer = nextLine
          i++
        }
      }
    }
    
    // Add if valid Q&A pair found
    if (question && answer) {
      const isQuestionArabic = /[\u0600-\u06FF]/.test(question)
      const isAnswerArabic = /[\u0600-\u06FF]/.test(answer)
      
      questions.push({
        question_en: isQuestionArabic ? "" : question,
        question_ar: isQuestionArabic ? question : "",
        answer_en: isAnswerArabic ? "" : answer,
        answer_ar: isAnswerArabic ? answer : "",
      })
    }
  }
  
  // Pattern 4: Table format detection (Question | Answer)
  if (questions.length === 0) {
    const tableQuestions = extractFromTable(lines)
    questions.push(...tableQuestions)
  }
  
  return questions
}

function extractFromTable(lines: string[]) {
  const questions: any[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for pipe-separated or tab-separated format
    if (line.includes("|") || line.includes("\t")) {
      const parts = line.split(/[|\t]/).map(p => p.trim()).filter(p => p)
      
      if (parts.length >= 2) {
        const [question, answer] = parts
        
        // Skip header rows
        if (question.toLowerCase().includes("question") || 
            question.toLowerCase().includes("answer")) {
          continue
        }
        
        const isQuestionArabic = /[\u0600-\u06FF]/.test(question)
        const isAnswerArabic = /[\u0600-\u06FF]/.test(answer)
        
        questions.push({
          question_en: isQuestionArabic ? "" : question,
          question_ar: isQuestionArabic ? question : "",
          answer_en: isAnswerArabic ? "" : answer,
          answer_ar: isAnswerArabic ? answer : "",
        })
      }
    }
  }
  
  return questions
}
