"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, ChevronDown, Send, RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function Chatbot({ greeting = "Welcome! I'm here to assist you with your food order. How can I help you today?" }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const scrollAreaRef = useRef(null)

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const userMessage = input.trim()
        if (!userMessage) return

        // Add user message to chat
        setMessages((prev) => [...prev, { role: "user", content: userMessage }])
        setInput("")

        // Send conversation to the API
        const userMessages = [{ role: "user", content: userMessage }]

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userMessages),
        })

        if (!response.ok) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Error: Failed to fetch completion." }])
            return
        }

        // If not streaming on client: get full text
        const text = await response.text()
        setMessages((prev) => [...prev, { role: "assistant", content: text }])
    }

    const handleRegenerate = () => {
        if (messages.length > 0) {
            const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
            if (lastUserMessage) {
                // Just re-submit the last user message
                setMessages((prev) => [...prev, { role: "assistant", content: "Let me try another answer..." }])
                // You’d call the API again with `lastUserMessage` content here if desired
            }
        }
    }

    const toggleExpand = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <Card className={cn(
            "fixed bottom-4 right-4 flex flex-col bg-white overflow-hidden shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            isExpanded ? "rounded-lg h-[600px] w-[350px]" : "rounded-full h-12 w-12"
        )}>
            {isExpanded ? (
                <>
                    <div className="bg-[#BA2B2B] text-white p-4 font-bold text-lg flex justify-between items-center">
                        <span>Chat with our AI Assistant</span>
                        <Button
                            onClick={toggleExpand}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-[#A02626]"
                        >
                            <ChevronDown className="h-6 w-6" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                        {messages.length === 0 && (
                            <Card className="p-3 bg-gray-100 text-black">
                                {greeting}
                            </Card>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
                            >
                                <Card
                                    className={`inline-block p-3 max-w-[80%] ${
                                        message.role === "user"
                                        ? "bg-[#BA2B2B] text-white"
                                        : "bg-gray-100 text-black"
                                    }`}
                                >
                                    {message.content}
                                </Card>
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="p-4 border-t border-gray-200">
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                            <Input
                                type="text"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-grow border-gray-300"
                            />
                            <Button type="submit" className="bg-[#BA2B2B] text-white hover:bg-[#A02626]">
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRegenerate}
                                className="bg-[#BA2B2B] text-white hover:bg-[#A02626]"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </>
            ) : (
                <Button
                    onClick={toggleExpand}
                    className="w-full h-full rounded-full bg-[#BA2B2B] text-white hover:bg-[#A02626]"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </Card>
    )
}
