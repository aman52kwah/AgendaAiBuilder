/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Clock, User, MessageSquare } from "lucide-react";
import { MeetingAgenda } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AgendaTimelineProps {
  agenda: MeetingAgenda;
}

export function AgendaTimeline({ agenda }: AgendaTimelineProps) {
  let currentTime = 0;

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{agenda.title}</h1>
            <p className="text-muted-foreground mt-1">Estimated duration: {agenda.totalDuration} minutes</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm font-mono">
            {agenda.items.length} Topics
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {agenda.stakeholders.map((s, i) => (
            <Badge key={i} variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
              <User className="w-3 h-3" />
              <span>{s.name}</span>
              <span className="text-[10px] opacity-60 uppercase font-bold ml-1">{s.role}</span>
            </Badge>
          ))}
        </div>
      </motion.div>

      <Separator />

      <div className="relative space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border hidden md:block" />

        {agenda.items.map((item, index) => {
          const startTime = currentTime;
          currentTime += item.duration;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative md:pl-12"
            >
              {/* Timeline Dot */}
              <div className="absolute left-3.5 top-6 w-2 h-2 rounded-full bg-primary ring-4 ring-background hidden md:block" />
              
              <Card className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{startTime}m - {currentTime}m</span>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {item.duration} min
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold leading-tight">
                        {item.topic}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
