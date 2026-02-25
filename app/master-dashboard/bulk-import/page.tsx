'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Upload, ArrowLeft, Save, Trash2, Download, Edit, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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
  const [fileType, setFileType] = useState<'pdf' | 'excel' | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<ParsedQuestion | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name_en, name_ar')
    if (!error && data) {
      setCategories(data)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const ext = selectedFile.name.split('.').pop()?.toLowerCase()
      if (ext === 'pdf') setFileType('pdf')
      else if (['xlsx', 'xls', 'csv'].includes(ext || '')) setFileType('excel')
      else {
        toast.error('Unsupported file format')
        setFile(null)
      }
    }
  }

  const handleParse = async () => {
    if (!file || !fileType) return

    // Disable PDF temporarily due to Next.js compatibility issues
    if (fileType === 'pdf') {
      toast.error('PDF parsing is temporarily disabled. Please use Excel/CSV format.')
      return
    }

    setParsing(true)

    try {
      // Parse file directly in the browser instead of using API
      if (fileType === 'excel') {
        const arrayBuffer = await file.arrayBuffer()

        // Dynamically import xlsx to avoid build issues
        const XLSX = await import('xlsx')
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(sheet)

        console.log('Parsed data:', data)

        const parsedQuestions: ParsedQuestion[] = data.map((row: any, index: number) => {
          // Handle both spaces and underscores in column names
          const qEn =
            row['Question EN'] ||
            row.Question_EN ||
            row.question_en ||
            row.Question ||
            row.question ||
            ''
          const qAr = row['Question AR'] || row.Question_AR || row.question_ar || ''
          const aEn =
            row['Answer EN'] || row.Answer_EN || row.answer_en || row.Answer || row.answer || ''
          const aAr = row['Answer AR'] || row.Answer_AR || row.answer_ar || ''

          return {
            id: `temp-${index}`,
            question_en: qEn || qAr,
            question_ar: qAr || qEn,
            answer_en: aEn || aAr,
            answer_ar: aAr || aEn,
            category_id: '',
            diamonds: 10,
          }
        })

        console.log('Parsed questions:', parsedQuestions)
        setQuestions(parsedQuestions)
        toast.success(`Parsed ${parsedQuestions.length} questions!`)
      }
    } catch (error) {
      console.error('Parse error:', error)
      toast.error('Error parsing file. Please check the format.')
    } finally {
      setParsing(false)
    }
  }

  const updateQuestion = (id: string, field: keyof ParsedQuestion, value: any) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
    toast.success('Question removed')
  }

  const openEditDialog = (question: ParsedQuestion) => {
    setEditingQuestion({ ...question })
    setIsEditDialogOpen(true)
  }

  const saveEditedQuestion = () => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => (q.id === editingQuestion.id ? editingQuestion : q)))
      setIsEditDialogOpen(false)
      setEditingQuestion(null)
      toast.success('Question updated')
    }
  }

  const handleBulkImport = async () => {
    const validQuestions = questions.filter(q => q.category_id && q.question_en && q.answer_en)

    if (validQuestions.length === 0) {
      toast.error(
        'No valid questions to import. Please assign categories and fill required fields.'
      )
      return
    }

    if (validQuestions.length < questions.length) {
      toast.warning(
        `${questions.length - validQuestions.length} questions will be skipped (missing category or required fields)`
      )
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('diamond_questions').insert(
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

      toast.success(`Successfully imported ${validQuestions.length} questions!`)
      setQuestions([])
      setFile(null)
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import questions')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = `Question EN,Question AR,Answer EN,Answer AR
Who won 2022 World Cup?,من فاز بكأس العالم 2022؟,Argentina,الأرجنتين
What is the capital of France?,ما هي عاصمة فرنسا؟,Paris,باريس`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions_template.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              size="sm"
              className="sm:size-default"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Bulk Import</h1>
          </div>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            size="sm"
            className="sm:size-default w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Upload Card - Responsive */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  onClick={handleParse}
                  disabled={!file || parsing}
                  className="w-full sm:w-auto"
                >
                  {parsing ? 'Parsing...' : 'Parse File'}
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
                </p>
                <p className="text-xs text-gray-500">Note: PDF parsing is temporarily disabled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List - Responsive */}
        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg sm:text-xl">
                  {questions.length} Question{questions.length !== 1 ? 's' : ''} Parsed
                </CardTitle>
                <Button onClick={handleBulkImport} disabled={loading} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {loading
                    ? 'Importing...'
                    : `Import All (${questions.filter(q => q.category_id).length})`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Category</TableHead>
                      <TableHead className="w-[100px]">Diamonds</TableHead>
                      <TableHead className="min-w-[200px]">Question EN</TableHead>
                      <TableHead className="min-w-[200px]">Question AR</TableHead>
                      <TableHead className="min-w-[150px]">Answer EN</TableHead>
                      <TableHead className="min-w-[150px]">Answer AR</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map(q => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <Select
                            value={q.category_id}
                            onValueChange={v => updateQuestion(q.id, 'category_id', v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name_en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={q.diamonds.toString()}
                            onValueChange={v => updateQuestion(q.id, 'diamonds', parseInt(v))}
                          >
                            <SelectTrigger className="w-full">
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
                          <Input
                            value={q.question_en}
                            onChange={e => updateQuestion(q.id, 'question_en', e.target.value)}
                            className="w-full"
                            placeholder="Question in English"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={q.question_ar}
                            onChange={e => updateQuestion(q.id, 'question_ar', e.target.value)}
                            className="w-full"
                            dir="rtl"
                            placeholder="السؤال بالعربية"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={q.answer_en}
                            onChange={e => updateQuestion(q.id, 'answer_en', e.target.value)}
                            className="w-full"
                            placeholder="Answer in English"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={q.answer_ar}
                            onChange={e => updateQuestion(q.id, 'answer_ar', e.target.value)}
                            className="w-full"
                            dir="rtl"
                            placeholder="الإجابة بالعربية"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(q)}>
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {questions.map((q, index) => (
                  <Card key={q.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-500">
                          Question #{index + 1}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(q)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Category */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Category</Label>
                        <Select
                          value={q.category_id}
                          onValueChange={v => updateQuestion(q.id, 'category_id', v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Diamonds */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Diamonds</Label>
                        <Select
                          value={q.diamonds.toString()}
                          onValueChange={v => updateQuestion(q.id, 'diamonds', parseInt(v))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 💎</SelectItem>
                            <SelectItem value="25">25 💎</SelectItem>
                            <SelectItem value="50">50 💎</SelectItem>
                            <SelectItem value="75">75 💎</SelectItem>
                            <SelectItem value="100">100 💎</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Question EN */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Question (English)</Label>
                        <Input
                          value={q.question_en}
                          onChange={e => updateQuestion(q.id, 'question_en', e.target.value)}
                          placeholder="Question in English"
                          className="w-full"
                        />
                      </div>

                      {/* Question AR */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Question (Arabic)</Label>
                        <Input
                          value={q.question_ar}
                          onChange={e => updateQuestion(q.id, 'question_ar', e.target.value)}
                          placeholder="السؤال بالعربية"
                          dir="rtl"
                          className="w-full"
                        />
                      </div>

                      {/* Answer EN */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Answer (English)</Label>
                        <Input
                          value={q.answer_en}
                          onChange={e => updateQuestion(q.id, 'answer_en', e.target.value)}
                          placeholder="Answer in English"
                          className="w-full"
                        />
                      </div>

                      {/* Answer AR */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Answer (Arabic)</Label>
                        <Input
                          value={q.answer_ar}
                          onChange={e => updateQuestion(q.id, 'answer_ar', e.target.value)}
                          placeholder="الإجابة بالعربية"
                          dir="rtl"
                          className="w-full"
                        />
                      </div>

                      {/* Validation Warning */}
                      {(!q.category_id || !q.question_en || !q.answer_en) && (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          ⚠️ Missing required fields (category, question EN, answer EN)
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog with Textarea */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4 py-4">
                {/* Category */}
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={editingQuestion.category_id}
                    onValueChange={v => setEditingQuestion({ ...editingQuestion, category_id: v })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Diamonds */}
                <div>
                  <Label>Diamonds *</Label>
                  <Select
                    value={editingQuestion.diamonds.toString()}
                    onValueChange={v =>
                      setEditingQuestion({ ...editingQuestion, diamonds: parseInt(v) })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 💎</SelectItem>
                      <SelectItem value="25">25 💎</SelectItem>
                      <SelectItem value="50">50 💎</SelectItem>
                      <SelectItem value="75">75 💎</SelectItem>
                      <SelectItem value="100">100 💎</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question EN - Textarea */}
                <div>
                  <Label>Question (English) *</Label>
                  <Textarea
                    value={editingQuestion.question_en}
                    onChange={e =>
                      setEditingQuestion({ ...editingQuestion, question_en: e.target.value })
                    }
                    placeholder="Enter question in English"
                    className="mt-1 min-h-[100px] resize-y"
                    rows={4}
                  />
                </div>

                {/* Question AR - Textarea */}
                <div>
                  <Label>Question (Arabic)</Label>
                  <Textarea
                    value={editingQuestion.question_ar}
                    onChange={e =>
                      setEditingQuestion({ ...editingQuestion, question_ar: e.target.value })
                    }
                    placeholder="أدخل السؤال بالعربية"
                    dir="rtl"
                    className="mt-1 min-h-[100px] resize-y"
                    rows={4}
                  />
                </div>

                {/* Answer EN - Textarea */}
                <div>
                  <Label>Answer (English) *</Label>
                  <Textarea
                    value={editingQuestion.answer_en}
                    onChange={e =>
                      setEditingQuestion({ ...editingQuestion, answer_en: e.target.value })
                    }
                    placeholder="Enter answer in English"
                    className="mt-1 min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>

                {/* Answer AR - Textarea */}
                <div>
                  <Label>Answer (Arabic)</Label>
                  <Textarea
                    value={editingQuestion.answer_ar}
                    onChange={e =>
                      setEditingQuestion({ ...editingQuestion, answer_ar: e.target.value })
                    }
                    placeholder="أدخل الإجابة بالعربية"
                    dir="rtl"
                    className="mt-1 min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveEditedQuestion} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
