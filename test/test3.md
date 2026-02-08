# Complex Mermaid Diagrams Test

## flowchart LR Test

```mermaid
flowchart LR
    A[Starting Point] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

```mermaid
flowchart LR
    DB[(Database)] --> Auth[Authentication]
    Auth --> API[API Server]
    API --> Cache[(Redis)]
    API --> DB
    Cache --> API
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    participant Cache

    Client->>Server: HTTP GET /api/data
    activate Server
    Server->>Cache: HGET user:123
    Cache-->>Server: data (hit)
    Server->>Client: 200 OK
    deactivate Server
```

## Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +eat()
        +sleep()
    }

    class Bird {
        +fly()
        +layEggs()
    }

    class Fish {
        +swim()
        +gills()
    }

    Animal <|-- Bird
    Animal <|-- Fish
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```

## Error Handling Example

```mermaid
flowchart TD
    A[Start] --> B{Check Error?}
    B -->|Yes| C[Log Error]
    C --> D[Show Message]
    D --> E[Return Null]
    B -->|No| F[Process Data]
    F --> G{Success?}
    G -->|Yes| H[Return Result]
    G -->|No| C
```

## Gantt Chart (not supported by beautiful-mermaid)

```mermaid
gantt
    title Project Development
    dateFormat  YYYY-MM-DD
    section Section
    Task 1           :a1, 2024-01-01, 30d
    Task 2           :after a1  , 20d
    section Another
    Task 3           :2024-01-12  , 12d
    Task 4           : 24d
```

## Regular Text

This is regular text between mermaid diagrams.

- Point 1
- Point 2
- Point 3

`Inline code` is also supported.

**Bold** and *italic* text work fine.

