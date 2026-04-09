/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Stakeholder {
  name: string;
  role: string;
}

export interface AgendaItem {
  id: string;
  topic: string;
  duration: number; // in minutes
  description: string;
  startTime?: string; // ISO string or simple time string
}

export interface MeetingAgenda {
  title: string;
  stakeholders: Stakeholder[];
  items: AgendaItem[];
  totalDuration: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
