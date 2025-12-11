"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

interface Document {
  fileName: string
  version: string
  size: string
  uploadDate: string
  description: string
}

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts")
      const posts: Post[] = await response.json()
      
      // Transform first 10 posts to document format
      const docs = posts.slice(0, 10).map((post) => ({
        fileName: `${post.title.split(" ").slice(0, 3).join("_")}.pdf`,
        version: `v${post.userId}.${post.id % 10}`,
        size: `${Math.floor(Math.random() * 900 + 100)} KB`,
        uploadDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          .toLocaleDateString("ru-RU"),
        description: post.body,
      }))
      
      setDocuments(docs)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching documents:", error)
      setLoading(false)
    }
  }

  const handleAnalyze = async (doc: Document) => {
    setSelectedDoc(doc)
    setAnalyzing(true)
    setAnalyzeResult(null)

    try {
      // Мокаем запрос POST /api/analyze
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAnalyzeResult("Анализ выполнен")
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Документы</h1>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Документы</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название файла</TableHead>
              <TableHead>Версия</TableHead>
              <TableHead>Размер</TableHead>
              <TableHead>Дата загрузки</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{doc.fileName}</TableCell>
                <TableCell>{doc.version}</TableCell>
                <TableCell>{doc.size}</TableCell>
                <TableCell>{doc.uploadDate}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        Подробнее
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{doc.fileName}</DialogTitle>
                        <DialogDescription>
                          Подробная информация о документе
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Версия</p>
                          <p className="text-sm">{doc.version}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Размер</p>
                          <p className="text-sm">{doc.size}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Дата загрузки</p>
                          <p className="text-sm">{doc.uploadDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Описание</p>
                          <p className="text-sm">{doc.description}</p>
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-4">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAnalyze(doc)}
                            disabled={analyzing}
                          >
                            {analyzing ? "Анализируем..." : "Проанализировать"}
                          </Button>
                          {selectedDoc === doc && analyzeResult && (
                            <p className="text-sm text-green-600">{analyzeResult}</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
