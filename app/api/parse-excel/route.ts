import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Limit file size to 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        error: `File too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse Excel/CSV
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    console.log("[Excel Parse] Raw data:", JSON.stringify(data, null, 2))
    console.log("[Excel Parse] First row keys:", data[0] ? Object.keys(data[0]) : [])

    // Map to question format - if only one language provided, use it for both
    const questions = data.map((row: any) => {
      // Handle both spaces and underscores in column names
      const qEn = row['Question EN'] || row.Question_EN || row.question_en || row.Question || row.question || ""
      const qAr = row['Question AR'] || row.Question_AR || row.question_ar || ""
      const aEn = row['Answer EN'] || row.Answer_EN || row.answer_en || row.Answer || row.answer || ""
      const aAr = row['Answer AR'] || row.Answer_AR || row.answer_ar || ""
      
      return {
        question_en: qEn || qAr,
        question_ar: qAr || qEn,
        answer_en: aEn || aAr,
        answer_ar: aAr || aEn,
      }
    })

    console.log("[Excel Parse] Parsed questions:", questions.length)

    return NextResponse.json({ success: true, questions })
  } catch (error: any) {
    console.error("Excel parsing error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
