# Data Flow Diagrams — Online Examination and Result Management System

## DFD Level 0 — Context Diagram

```mermaid
graph LR
    Admin((Admin)) -->|Manage System| OES[Online Exam System]
    Student((Student)) -->|Take Exams| OES
    OES -->|Results & Reports| Admin
    OES -->|Results & Certificates| Student
    OES -->|Email Notifications| Email[Email Service]
```

## DFD Level 1

```mermaid
graph TB
    Admin((Admin))
    Student((Student))

    subgraph System["Online Exam System"]
        P1["1.0 Authentication"]
        P2["2.0 Student Management"]
        P3["3.0 Exam Management"]
        P4["4.0 Question Management"]
        P5["5.0 Examination Engine"]
        P6["6.0 Result Processing"]
        P7["7.0 Report Generation"]
    end

    DB[(MySQL Database)]

    Admin -->|Login Credentials| P1
    Student -->|Registration/Login| P1
    P1 -->|JWT Token| Admin
    P1 -->|JWT Token| Student
    P1 <-->|User Data| DB

    Admin -->|CRUD Operations| P2
    P2 <-->|Student Records| DB

    Admin -->|Create/Edit Exams| P3
    P3 <-->|Exam Data| DB

    Admin -->|Add/Edit Questions| P4
    P4 <-->|Question Data| DB

    Student -->|Start/Submit Exam| P5
    P5 <-->|Attempt & Answer Data| DB
    P5 -->|Completed Exam| P6

    P6 -->|Calculate Grades| P6
    P6 <-->|Result Data| DB
    P6 -->|Result| Student

    Admin -->|Request Reports| P7
    P7 <-->|Result Data| DB
    P7 -->|PDF/Excel| Admin
```

## DFD Level 2 — Examination Engine (Process 5.0)

```mermaid
graph TB
    Student((Student))

    subgraph ExamEngine["5.0 Examination Engine"]
        P51["5.1 Validate Exam Access"]
        P52["5.2 Load Questions"]
        P53["5.3 Create Attempt"]
        P54["5.4 Collect Answers"]
        P55["5.5 Submit & Evaluate"]
        P56["5.6 Calculate Result"]
    end

    DB[(MySQL Database)]

    Student -->|Start Exam Request| P51
    P51 <-->|Check Attempt Status| DB
    P51 -->|Access Granted| P52
    P52 <-->|Fetch Random Questions| DB
    P52 -->|Questions| P53
    P53 <-->|Create Attempt Record| DB
    P53 -->|Attempt ID + Questions| Student

    Student -->|Answer Selections| P54
    P54 -->|All Answers| P55

    Student -->|Submit / Timer Expires| P55
    P55 <-->|Save Answers| DB
    P55 -->|Answers| P56
    P56 <-->|Get Correct Answers| DB
    P56 -->|Score Comparison| P56
    P56 <-->|Save Result| DB
    P56 -->|Grade & Status| Student
```

## DFD Level 2 — Result Processing (Process 6.0)

```mermaid
graph TB
    ExamEngine["5.0 Exam Engine"]

    subgraph ResultProc["6.0 Result Processing"]
        P61["6.1 Score Calculation"]
        P62["6.2 Percentage Calculation"]
        P63["6.3 Grade Assignment"]
        P64["6.4 Pass/Fail Determination"]
        P65["6.5 Store Result"]
    end

    DB[(MySQL Database)]
    Student((Student))

    ExamEngine -->|Raw Answers| P61
    P61 -->|Score| P62
    P62 -->|Percentage| P63
    P63 -->|Grade| P64
    P64 -->|Status| P65
    P65 <-->|INSERT Result| DB
    P65 -->|Complete Result| Student
```
