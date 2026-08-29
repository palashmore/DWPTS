import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-knowledge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="knowledge-page">
      <div class="page-title-row">
        <div>
          <h2>📚 RAG Corporate Knowledge Base & SOP Repository</h2>
          <p class="subtitle">Semantic vector search, corporate SOP retrieval, and grounded question answering with direct source citations</p>
        </div>
      </div>

      <!-- Semantic Search Box -->
      <div class="dwpts-card search-card">
        <form (ngSubmit)="queryKnowledge()" class="search-form">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            name="searchQuery" 
            placeholder="Ask questions about company SOPs, capacity overload policy, Excel import schema, or security rules..." 
            [disabled]="isSearching" 
            required />
          <button type="submit" class="btn btn-primary btn-pill cta-glow" [disabled]="!searchQuery.trim() || isSearching">
            <span>{{ isSearching ? 'Searching...' : 'Semantic Search' }}</span>
          </button>
        </form>

        <!-- Grounded Answer Card -->
        <div class="grounded-answer-box" *ngIf="ragResult">
          <div class="answer-header">
            <span class="badge status-optimal">✨ AI Grounded Answer</span>
            <span class="confidence-badge">Confidence: {{ (ragResult.confidenceScore * 100) | number:'1.0-0' }}%</span>
          </div>
          <p class="answer-text">{{ ragResult.groundedAnswer }}</p>
          <div class="source-citation">
            <span class="citation-icon">📌</span>
            <div>
              <span class="source-doc">Source Document: <strong>{{ ragResult.sourceDocument }}</strong></span>
              <span class="source-section">{{ ragResult.sourceSection }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Indexed SOPs & Documents Directory -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>Indexed Corporate Documents ({{ documents.length }})</h3>
            <span class="subtitle">Embedded knowledge articles powering semantic retrieval</span>
          </div>
        </div>

        <div class="docs-grid">
          <div class="doc-card" *ngFor="let doc of documents">
            <div class="doc-card-header">
              <span class="doc-icon">📄</span>
              <div>
                <span class="doc-title">{{ doc.title }}</span>
                <span class="doc-category">{{ doc.category }}</span>
              </div>
            </div>
            <p class="doc-content">{{ doc.content }}</p>
            <div class="doc-footer">
              <span class="doc-section">{{ doc.section }}</span>
              <span class="doc-date">{{ doc.uploadedAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .cta-glow { box-shadow: var(--gold-glow-subtle); }

    .search-card { padding: 24px; }
    .search-form {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--bg-navy-deep);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-pill);
      padding: 6px 10px 6px 20px;
      input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 14px;
        outline: none;
      }
    }
    .search-icon { font-size: 20px; color: var(--gold-highlight); }

    .grounded-answer-box {
      margin-top: 24px;
      background: var(--bg-surface-elevated);
      border: 1px solid rgba(52, 211, 153, 0.4);
      border-radius: var(--radius-lg);
      padding: 20px;
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .answer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .confidence-badge { font-size: 11px; font-weight: 800; color: #34D399; }
    .answer-text { font-size: 14px; color: var(--text-primary); line-height: 1.6; }

    .source-citation {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 12px;
    }
    .citation-icon { font-size: 18px; color: var(--gold-highlight); }
    .source-doc { color: var(--text-platinum); display: block; }
    .source-section { color: var(--gold-highlight); font-weight: 600; font-size: 11px; }

    /* Docs Grid */
    .docs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px; }
    .doc-card { background: var(--bg-navy-deep); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
    .doc-card-header { display: flex; align-items: center; gap: 12px; }
    .doc-icon { font-size: 24px; }
    .doc-title { font-size: 13.5px; font-weight: 800; color: var(--text-primary); display: block; }
    .doc-category { font-size: 11px; color: var(--gold-highlight); font-weight: 600; }
    .doc-content { font-size: 12px; color: var(--text-platinum); line-height: 1.5; }
    .doc-footer { display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; }
    .doc-section { font-weight: 700; color: var(--text-gold); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class KnowledgeComponent implements OnInit {
  searchQuery = '';
  isSearching = false;
  ragResult: any = null;
  documents: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getKnowledgeDocuments().subscribe(res => this.documents = res.data || []);
  }

  queryKnowledge() {
    if (!this.searchQuery.trim()) return;
    this.isSearching = true;
    this.api.queryKnowledgeBase(this.searchQuery).subscribe({
      next: res => {
        this.isSearching = false;
        this.ragResult = res.data;
      },
      error: () => this.isSearching = false
    });
  }
}
