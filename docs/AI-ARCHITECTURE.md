# 🧠 DWPTS AI Architecture & Intelligence Specification

## 1. High-Level AI Orchestration Pipeline
DWPTS integrates an enterprise AI intelligence layer with deterministic heuristic fallback, ensuring zero downtime even during third-party LLM outages.

```mermaid
flowchart TD
    UserQuery["User Natural Language Prompt"] --> IntentParser["AI Intent & Context Parser"]
    IntentParser --> SecurityAuth["Multi-Tenant Authorization Filter"]
    SecurityAuth --> Router{"Query Classification"}
    
    Router -->|Analytics Inquiries| AnalyticsEngine["Structured Analytics Query Handler"]
    Router -->|Corporate SOP Questions| RAGEngine["RAG Vector Index & Semantic Search"]
    Router -->|Daily Work Planning| PlanParser["Natural Language Work Item Parser"]
    Router -->|Effort Estimation| EstimationEngine["Historical Effort Estimator"]
    
    AnalyticsEngine --> ResultSynthesizer["AI Result Synthesizer & Insights"]
    RAGEngine --> ResultSynthesizer
    PlanParser --> ResultSynthesizer
    EstimationEngine --> ResultSynthesizer
    
    ResultSynthesizer --> Guardrails["Human-in-the-loop Guardrails & Cost Tracker"]
    Guardrails --> Output["Grounded, Cited & Authorized Response"]
```

## 2. Core AI Capabilities
1. **AI Daily Work Copilot (`/daily-work`)**:
   - Task prioritization based on deadline urgency, category impact (Bug Fix vs Development), and daily capacity limit.
   - Natural language work planner translating conversational text into structured draft entries.
2. **"Ask DWPTS" Natural Language Analytics (`/ai-assistant`)**:
   - Natural language queries (*"Who worked > 40h?"*, *"Analyze team utilization"*).
   - Translates into safe, validated analytical handlers with **zero direct SQL execution**.
3. **RAG Corporate Knowledge Base (`/knowledge`)**:
   - Corporate SOP repository with semantic similarity matching and **explicit source document citations**.
