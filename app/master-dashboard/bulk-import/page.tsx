"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, FileSpreadsheet, ArrowLeft, Save, Trash2, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ParsedQuestion {
  id: string
  question_en: string
  question_ar: string
  answer_en: string
  answer_ar: string
  category_id: string
  diamonds: number
}

interface Category {
  id: string
  name_en: string
  name_ar: string
}

export default function BulkImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [questions, setQuestions] = useState<ParsedQuestion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [fileType, setFileType] = useState<"pdf" | "excel" | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("id, name_en, name_ar")
    if (!error && data) {
      setCategories(data)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const ext = selectedFile.name.split(".").pop()?.toLowerCase()
      if (ext === "pdf") setFileType("pdf")
      else if (["xlsx", "xls", "csv"].includes(ext || "")) setFileType("excel")
      else {
        toast.error("Unsupported file format")
        setFile(null)
      }
    }
  }

  const handleParse = async () => {
    if (!file || !fileType) return

    // Disable PDF temporarily due to Next.js compatibility issues
    if (fileType === "pdf") {
      toast.error("PDF parsing is temporarily disabled. Please use Excel/CSV format.")
      return
    }

    setParsing(true)
    
    try {
      // Parse file directly in the browser instead of using API
      if (fileType === "excel") {
        const arrayBuffer = await file.arrayBuffer()
        
        // Dynamically import xlsx to avoid build issues
        const XLSX = await import('xlsx')
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(sheet)
        
        console.log("Parsed data:", data)
        
        const parsedQuestions: ParsedQuestion[] = data.map((row: any, index: number) => {
          // Handle both spaces and underscores in column names
          const qEn = row['Question EN'] || row.Question_EN || row.question_en || row.Question || row.question || ""
          const qAr = row['Question AR'] || row.Question_AR || row.question_ar || ""
          const aEn = row['Answer EN'] || row.Answer_EN || row.answer_en || row.Answer || row.answer || ""
          const aAr = row['Answer AR'] || row.Answer_AR || row.answer_ar || ""
          
          return {
            id: `temp-${index}`,
            question_en: qEn || qAr,
            question_ar: qAr || qEn,
            answer_en: aEn || aAr,
            answer_ar: aAr || aEn,
            category_id: "",
            diamonds: 10,
          }
        })
        
        console.log("Parsed questions:", parsedQuestions)
        setQuestions(parsedQuestions)
        toast.success(`Parsed ${parsedQuestions.length} questions!`)
      }
    } catch (error) {
      console.error("Parse error:", error)
      toast.error("Error parsing file. Please check the format.")
    } finally {
      setParsing(false)
    }
  }

  const updateQuestion = (id: string, field: keyof ParsedQuestion, value: any) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleBulkImport = async () => {
    const validQuestions = questions.filter(q => q.category_id && q.question_en && q.answer_en)
    
    if (validQuestions.length === 0) {
      toast.error("No valid questions to import")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("diamond_questions").insert(
        validQuestions.map(q => ({
          category_id: q.category_id,
          question_en: q.question_en,
          question_ar: q.question_ar,
          answer_en: q.answer_en,
          answer_ar: q.answer_ar,
          diamonds: q.diamonds,
        }))
      )

      if (error) throw error

      toast.success(`Imported ${validQuestions.length} questions!`)
      setQuestions([])
      setFile(null)
    } catch (error) {
      toast.error("Failed to import questions")
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = `Question,Answer
Who won 2022 World Cup?,Argentina
What is the capital of France?,Paris`
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template.csv"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Bulk Import Questions</h1>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="flex-1" />
                <Button onClick={handleParse} disabled={!file || parsing}>
                  {parsing ? "Parsing..." : "Parse"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">Excel or CSV only (PDF temporarily disabled)</p>
            </div>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{questions.length} Questions</CardTitle>
                <Button onClick={handleBulkImport} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Importing..." : "Import All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Diamonds</TableHead>
                      <TableHead>Question EN</TableHead>
                      <TableHead>Question AR</TableHead>
                      <TableHead>Answer EN</TableHead>
                      <TableHead>Answer AR</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <Select value={q.category_id} onValueChange={(v) => updateQuestion(q.id, "category_id", v)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={q.diamonds.toString()} onValueChange={(v) => updateQuestion(q.id, "diamonds", parseInt(v))}>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="75">75</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input value={q.question_en} onChange={(e) => updateQuestion(q.id, "question_en", e.target.value)} className="w-[200px]" />
                        </TableCell>
                        <TableCell>
                          <Input value={q.question_ar} onChange={(e) => updateQuestion(q.id, "question_ar", e.target.value)} className="w-[200px]" dir="rtl" />
                        </TableCell>
                        <TableCell>
                          <Input value={q.answer_en} onChange={(e) => updateQuestion(q.id, "answer_en", e.target.value)} className="w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Input value={q.answer_ar} onChange={(e) => updateQuestion(q.id, "answer_ar", e.target.value)} className="w-[150px]" dir="rtl" />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
