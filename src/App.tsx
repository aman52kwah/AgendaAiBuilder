/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { AgendaTimeline } from "./components/AgendaTimeline";
import { MeetingAgenda, ChatMessage } from "@/types";
import { generateAgendaFromText, refineAgenda } from "./lib/gemini";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Loader2, FileText, Calendar, LayoutDashboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (text: string) => {
    setIsProcessing(true);
    try {
      const newAgenda = await generateAgendaFromText(text);
      setAgenda(newAgenda);
      setChatHistory([
        { role: 'model', content: "I've analyzed your document and created a draft agenda. How would you like to refine it?" }
      ]);
      toast.success("Agenda generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatSubmit = async (message: string) => {
    if (!agenda) {
      toast.error("Please upload a document first.");
      return;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      const updatedAgenda = await refineAgenda(agenda, message, chatHistory);
      setAgenda(updatedAgenda);
      setChatHistory(prev => [...prev, { role: 'model', content: "I've updated the agenda based on your request." }]);
      toast.success("Agenda updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update agenda.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
        {/* Left Sidebar */}
        <aside className="w-80 flex-shrink-0">
          <Sidebar 
            onFileUpload={handleFileUpload} 
            onChatSubmit={handleChatSubmit}
            chatHistory={chatHistory}
            isProcessing={isProcessing}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-muted/10">
          <header className="h-16 border-b bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-bold text-lg tracking-tight">AgendaBuilder AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                {isProcessing ? 'Processing...' : 'Ready'}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-12 px-6">
              {!agenda && !isProcessing && (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-6 bg-muted rounded-full">
                    <LayoutDashboard className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight">No Agenda Yet</h2>
                    <p className="text-muted-foreground">
                      Upload a meeting brief, project doc, or notes in the sidebar to automatically generate a structured timeline.
                    </p>
                  </div>
                </div>
              )}

              {isProcessing && !agenda && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-6">
                        <Skeleton className="h-32 w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agenda && (
                <AgendaTimeline agenda={agenda} />
              )}
            </div>
          </div>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
