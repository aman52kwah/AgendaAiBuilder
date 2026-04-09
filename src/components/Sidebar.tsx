/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, FileText, Send, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/types";

interface SidebarProps {
  onFileUpload: (text: string) => void;
  onChatSubmit: (message: string) => void;
  chatHistory: ChatMessage[];
  isProcessing: boolean;
}

export function Sidebar({ onFileUpload, onChatSubmit, chatHistory, isProcessing }: SidebarProps) {
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onFileUpload(text);
    };
    reader.readAsText(file);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;
    onChatSubmit(chatInput);
    setChatInput("");
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Document Source</h2>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".txt,.md,.doc,.docx,.pdf"
            />
            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">Upload Document</p>
              <p className="text-xs text-muted-foreground mt-1">TXT, MD, PDF or DOCX</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Refinement Chat
            </h2>
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </div>

          <ScrollArea className="flex-1 -mx-2 px-2 h-[400px]">
            <div className="space-y-4 pb-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">
                    Upload a document first, then use this chat to refine your agenda.
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`
                      max-w-[90%] px-3 py-2 rounded-2xl text-sm
                      ${msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted text-foreground rounded-tl-none'}
                    `}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleChatSubmit} className="relative pt-2">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Refine the agenda..."
              className="pr-10 bg-muted/50 border-none focus-visible:ring-1"
              disabled={isProcessing}
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute right-1 top-[13px] h-7 w-7"
              disabled={isProcessing || !chatInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
