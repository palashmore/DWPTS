import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  insights?: string[];
  evidence?: any;
  intent?: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-page">
      <div class="page-title-row">
        <div>
          <h2>🤖 DWPTS AI Copilot & Operational Intelligence</h2>
          <p class="subtitle">Natural language analytics, workload forecasting, capacity anomaly detection, and executive summaries</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-pill" (click)="generateExecutiveSummary()" [disabled]="isLoading">
            <span>✨ Generate Executive Summary</span>
          </button>
        </div>
      </div>

      <!-- Quick Prompt Chips -->
      <div class="prompt-chips-row">
        <span class="chip-label">Suggested Prompts:</span>
        <button class="prompt-chip" (click)="sendPresetPrompt('Who worked more than 40 hours in the recent cycle?')">
          ⏱️ Overtime & 40h+ Audit
        </button>
        <button class="prompt-chip" (click)="sendPresetPrompt('Which team had the highest capacity utilization?')">
          📊 Team Utilization Ranking
        </button>
        <button class="prompt-chip" (click)="sendPresetPrompt('Summarize monthly planned vs actual workload.')">
          📋 Workload Adherence Summary
        </button>
        <button class="prompt-chip" (click)="sendPresetPrompt('Identify capacity overload risks and meeting overhead.')">
          ⚠️ Capacity Risk & Anomaly Check
        </button>
      </div>

      <!-- Chat Stream Container -->
      <div class="dwpts-card chat-card">
        <div class="chat-messages-container">
          <div *ngFor="let msg of messages" class="chat-message-row" [ngClass]="msg.sender">
            <div class="avatar-badge">
              <span>{{ msg.sender === 'ai' ? '🤖' : '👤' }}</span>
            </div>
            <div class="message-bubble">
              <div class="message-header">
                <span class="message-sender-name">{{ msg.sender === 'ai' ? 'DWPTS AI Intelligence' : 'You' }}</span>
                <span class="message-time">{{ msg.timestamp }}</span>
              </div>
              <div class="message-body" [innerHTML]="msg.text"></div>

              <!-- Insights Box -->
              <div class="insights-box" *ngIf="msg.insights && msg.insights.length > 0">
                <span class="insights-title">💡 Operational Insights & Findings:</span>
                <ul>
                  <li *ngFor="let item of msg.insights">{{ item }}</li>
                </ul>
              </div>

              <!-- Evidence & Intent Footer -->
              <div class="message-footer" *ngIf="msg.intent">
                <span class="intent-tag">Intent: {{ msg.intent }}</span>
                <span class="verified-tag">🛡️ Authorized Multi-Tenant Data</span>
              </div>
            </div>
          </div>

          <div *ngIf="isLoading" class="chat-message-row ai">
            <div class="avatar-badge"><span>🤖</span></div>
            <div class="message-bubble loading-bubble">
              <span class="spinner-dot"></span>
              Analyzing operational telemetry, capacity models, and multi-tenant aggregates...
            </div>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <form (ngSubmit)="sendMessage()" class="chat-input-row">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            name="userInput" 
            placeholder="Ask DWPTS anything (e.g. 'Show departments with capacity overload risk' or 'Explain August variance')..." 
            [disabled]="isLoading" 
            autocomplete="off" />
          <button type="submit" class="btn btn-primary btn-pill cta-glow" [disabled]="!userInput.trim() || isLoading">
            <span>Send ➔</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .header-actions { display: flex; gap: 10px; }
    .cta-glow { box-shadow: var(--gold-glow-subtle); }

    .prompt-chips-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .chip-label { font-size: 11px; font-weight: 800; color: var(--gold-highlight); text-transform: uppercase; }
    .prompt-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      color: var(--text-primary);
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-smooth);
      &:hover { background: var(--gold-highlight); color: var(--bg-navy-deep); transform: translateY(-1px); }
    }

    .chat-card {
      display: flex;
      flex-direction: column;
      height: 600px;
      padding: 0;
      overflow: hidden;
    }
    .chat-messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .chat-message-row {
      display: flex;
      gap: 14px;
      max-width: 85%;
    }
    .chat-message-row.user {
      align-self: flex-end;
      flex-direction: row-reverse;
      .message-bubble { background: var(--bg-navy-deep); border-color: var(--gold-highlight); }
    }
    .chat-message-row.ai { align-self: flex-start; }

    .avatar-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-gold);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .message-bubble {
      background: var(--bg-surface);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .message-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .message-sender-name { font-size: 12px; font-weight: 800; color: var(--gold-highlight); }
    .message-time { font-size: 10.5px; color: var(--text-muted); }
    .message-body { font-size: 13.5px; color: var(--text-primary); line-height: 1.5; }

    .insights-box {
      margin-top: 10px;
      background: var(--bg-navy-deep);
      border-left: 3px solid #34D399;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      ul { margin: 6px 0 0 18px; font-size: 12.5px; color: var(--text-platinum); }
    }
    .insights-title { font-size: 11px; font-weight: 800; color: #34D399; text-transform: uppercase; }

    .message-footer { display: flex; gap: 12px; margin-top: 8px; font-size: 10.5px; }
    .intent-tag { background: rgba(96, 165, 250, 0.15); color: #60A5FA; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
    .verified-tag { background: rgba(52, 211, 153, 0.15); color: #34D399; padding: 2px 8px; border-radius: 4px; font-weight: 700; }

    .loading-bubble { color: var(--gold-highlight); font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 10px; }

    .chat-input-row {
      display: flex;
      gap: 12px;
      padding: 16px 24px;
      background: var(--bg-surface-elevated);
      border-top: 1px solid var(--border-primary);
      input {
        flex: 1;
        padding: 12px 18px;
        border-radius: var(--radius-pill);
        background: var(--bg-navy-deep);
        border: 1px solid var(--border-gold);
        color: var(--text-primary);
        font-size: 13.5px;
        outline: none;
      }
    }
  `]
})
export class AIAssistantComponent implements OnInit {
  userInput = '';
  isLoading = false;
  messages: ChatMessage[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.messages.push({
      sender: 'ai',
      text: 'Hello! I am your <strong>DWPTS AI Operational Intelligence Copilot</strong>. I analyze real-time team capacity, workload forecasting, meeting ratios, and planning variance across authorized multi-tenant datasets. How can I assist your workflow today?',
      timestamp: new Date().toLocaleTimeString(),
      insights: [
        'Multi-tenant row-level authorization is active for your session.',
        'Zero direct SQL execution — all inquiries pass through validated analytical query handlers.'
      ],
      intent: 'Greeting'
    });
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    this.messages.push({
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    });

    this.userInput = '';
    this.isLoading = true;

    this.api.askDwpts(text).subscribe({
      next: res => {
        this.isLoading = false;
        const data = res.data;
        this.messages.push({
          sender: 'ai',
          text: data?.explanation || 'Query processed successfully across operational telemetry.',
          timestamp: new Date().toLocaleTimeString(),
          insights: data?.insights || [],
          evidence: data?.structuredData,
          intent: data?.intent
        });
      },
      error: err => {
        this.isLoading = false;
        this.messages.push({
          sender: 'ai',
          text: 'Unable to process query: ' + (err.error?.message || err.message),
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });
  }

  sendPresetPrompt(promptText: string) {
    this.userInput = promptText;
    this.sendMessage();
  }

  generateExecutiveSummary() {
    this.isLoading = true;
    this.api.getAIExecutiveSummary('August 2026').subscribe({
      next: res => {
        this.isLoading = false;
        const s = res.data;
        this.messages.push({
          sender: 'ai',
          text: `<strong>📊 Executive Workload & Capacity Summary (${s?.period}):</strong><br/>${s?.keyObservations}<br/><br/><strong>Top Category:</strong> ${s?.topCategory}<br/><strong>Capacity Utilization:</strong> ${s?.overallUtilization}%`,
          timestamp: new Date().toLocaleTimeString(),
          insights: s?.recommendations || [],
          intent: 'ExecutiveSummary'
        });
      },
      error: () => this.isLoading = false
    });
  }
}
