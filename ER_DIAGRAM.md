# Event Booking System - Database Schema (ER Diagram)

You can copy and paste the text block below into any Markdown viewer that supports Mermaid (like GitHub), or paste it into [Mermaid Live Editor](https://mermaid.live/) to instantly generate an image of your Database Schema for your project report!

```mermaid
erDiagram
    USERS {
        int id PK
        varchar name
        varchar email
        varchar password_hash
        enum role "student or organizer"
        timestamp created_at
    }

    EVENTS {
        int id PK
        int organizer_id FK
        varchar title
        text description
        date event_date
        time event_time
        varchar venue
        int capacity
        decimal price
        varchar banner_url
        enum status "upcoming, ongoing, past, cancelled"
        timestamp created_at
    }

    BOOKINGS {
        int id PK
        int user_id FK
        int event_id FK
        int seats
        decimal total_amount
        enum status "confirmed, cancelled"
        timestamp booked_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        text message
        boolean is_read
        timestamp created_at
    }

    %% Relationships
    USERS ||--o{ EVENTS : "creates (if organizer)"
    USERS ||--o{ BOOKINGS : "makes (if student)"
    USERS ||--o{ NOTIFICATIONS : "receives"
    EVENTS ||--o{ BOOKINGS : "receives"
```
