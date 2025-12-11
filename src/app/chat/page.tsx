"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Подключаемся к WebSocket (public echo)
    const ws = new WebSocket("wss://ws.postman-echo.com/raw")

    ws.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      // Получаем echo от сервера и показываем как ответ ассистента
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        text: event.data,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }

    ws.onerror = (event) => {
      console.error("WebSocket error event:", event)
    }

    ws.onclose = (event) => {
      console.log(
        "WebSocket disconnected",
        "code:",
        event.code,
        "reason:",
        event.reason,
        "wasClean:",
        event.wasClean
      )
      setIsConnected(false)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    // Автоскролл к последнему сообщению
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || !wsRef.current || !isConnected) return

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Отправляем через WebSocket
    wsRef.current.send(inputValue)

    // Очищаем поле ввода
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Чат</h1>
        <p className="text-sm text-muted-foreground">
          {isConnected ? (
            <span className="text-green-600">● Подключено</span>
          ) : (
            <span className="text-red-600">● Отключено</span>
          )}
        </p>
      </div>

      {/* Область сообщений */}
      <ScrollArea className="flex-1 rounded-lg border p-4 mb-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Начните разговор...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Аватар */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Сообщение */}
                <div
                  className={cn(
                    "flex flex-col gap-1 rounded-lg px-4 py-2 max-w-[70%]",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Поле ввода */}
      <form onSubmit={handleSendMessage} className="flex gap-2 items-center mt-2 py-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            isConnected ? "Введите сообщение..." : "Нет подключения к WebSocket"
          }
          className="flex-1 h-12 text-base border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-0 shadow-sm"
        />
        <Button
          type="submit"
          disabled={!inputValue.trim()}
          className="h-12 px-4 text-base"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
