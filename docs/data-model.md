# FutureFlow AI — Data Model & ER Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    PROCESS ||--o{ ACTIVITY : "has current"
    PROCESS ||--o{ PROBLEM : "diagnosed with"
    PROCESS ||--o{ OPPORTUNITY : "has"
    PROCESS ||--o{ FUTURE_ACTIVITY : "redesigned into"
    PROCESS ||--o{ BENEFIT : "yields"
    PROCESS ||--o{ PROCESS_COMPARISON_CACHE : "caches"
    ACTIVITY ||--o{ OPPORTUNITY : "addressed by"

    PROCESS {
        string id PK
        string name
        string industry
        string description
        datetime createdAt
        datetime updatedAt
    }

    ACTIVITY {
        string id PK
        string processId FK
        string name
        int sequence
        string type
    }

    PROBLEM {
        string id PK
        string processId FK
        string description
        string severity
    }

    OPPORTUNITY {
        string id PK
        string processId FK
        string activityId FK
        string opportunity
        string technology
        string automationPotential
    }

    FUTURE_ACTIVITY {
        string id PK
        string processId FK
        string activityIdRef
        string newActivityName
        string roleResponsibility
        int sequence
    }

    BENEFIT {
        string id PK
        string processId FK
        string benefitType
        string description
        string confidence
        string assumptions
    }

    PROCESS_COMPARISON_CACHE {
        string id PK
        string processId FK
        datetime generatedAt
    }
```

## Schema Justification
- **Traceability**: `Opportunity.activityId` maps every AI innovation directly to the source manual step.
- **Responsibility Classification**: `FutureActivity.roleResponsibility` is strictly enforced as `human | ai | hybrid`.
- **Relational Integrity**: Foreign key constraints and cascade deletes ensure clean re-runs without orphaned entities.
