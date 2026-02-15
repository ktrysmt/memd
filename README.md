# memd

> View mermaid-ed markdown in terminal

## Install

```bash
npm install -g memd-cli
```

## Usage


```
Usage: memd [options] [files...]

Render markdown with mermaid diagrams to terminal output

Arguments:
  files             markdown file(s) to render

Options:
  -v, --version     output the version number
  --no-pager        disable pager (less)
  --no-color        disable colored output
  --no-highlight    disable syntax highlighting
  --width <number>  terminal width override
  --ascii           use pure ASCII mode for diagrams (default: unicode)
  -h, --help        display help for command
```


## Example

### File input

```
$ memd test/test1.md
# Hello

This is markdown with mermaid:

    ┌───┐     ┌───┐
    │   │     │   │
    │ A ├────►│ B │
    │   │     │   │
    └───┘     └───┘

More text.

```

### test2.md - flowchart with decision

```
$ memd test/test2.md
# Hello

This is markdown printed in the terminal.

    ┌───────────┐
    │           │
    │   Start   │
    │           │
    └─────┬─────┘
          │
          │
          │
          │
          ▼
    ┌───────────┐
    │           │
    │ Decision? ├──No────┐
    │           │        │
    └─────┬─────┘        │
          │              │
          │              │
         Yes             │
          │              │
          ▼              ▼
    ┌───────────┐     ┌─────┐
    │           │     │     │
    │   Action  ├────►│ End │
    │           │     │     │
    └───────────┘     └─────┘

More text after the diagram.

```

### test3.md - Complex Mermaid diagrams (English)

```
$ memd test/test3.md
# Complex Mermaid Diagrams Test

## flowchart LR Test

    ┌────────────────┐     ┌──────────┐     ┌──────────┐     ┌─────┐
    │                │     │          │     │          │     │     │
    │ Starting Point ├────►│ Decision ├─Yes►│ Action 1 ├────►│ End │
    │                │     │          │     │          │     │     │
    └────────────────┘     └─────┬────┘     └──────────┘     └─────┘
                                 │                              ▲
                                 │                              │
                                 │                              │
                                No                              │
                                 │                              │
                                 │          ┌──────────┐        │
                                 │          │          │        │
                                 └─────────►│ Action 2 ├────────┘
                                            │          │
                                            └──────────┘

    ┌──────────┐     ┌────────────────┐     ┌────────────┐     ┌───────┐
    │          │     │                │     │            │     │       │
    │ Database ├────►│ Authentication ├────►│ API Server ├◄───►┤ Redis │
    │          │     │                │     │            │     │       │
    └──────────┘     └────────────────┘     └──────┬─────┘     └───────┘
          ▲                                        │
          └────────────────────────────────────────┘


## Sequence Diagram

    ┌────────┐              ┌────────┐  ┌──────────┐   ┌───────┐
    │ Client │              │ Server │  │ Database │   │ Cache │
    └────┬───┘              └────┬───┘  └─────┬────┘   └───┬───┘
         │                       │            │            │
         │  HTTP GET /api/data   │            │            │
         │───────────────────────▶            │            │
         │                       │      HGET user:123      │
         │                       │─────────────────────────▶
         │                       │            │            │
         │                       │       data (hit)        │
         │                       ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│
         │                       │            │            │
         │        200 OK         │            │            │
         ◀───────────────────────│            │            │
         │                       │            │            │
    ┌────┴───┐              ┌────┴───┐  ┌─────┴────┐   ┌───┴───┐
    │ Client │              │ Server │  │ Database │   │ Cache │
    └────────┘              └────────┘  └──────────┘   └───────┘

## Class Diagram

    ┌───────────────┐
    │ Animal        │
    ├───────────────┤
    │ +name: String │
    ├───────────────┤
    │ +eat          │
    │ +sleep        │
    └───────────────┘
            △
          ┌─└────────────┐
          │              │
    ┌──────────┐    ┌────────┐
    │ Bird     │    │ Fish   │
    ├──────────┤    ├────────┤
    │          │    │        │
    ├──────────┤    ├────────┤
    │ +fly     │    │ +swim  │
    │ +layEggs │    │ +gills │
    └──────────┘    └────────┘


## State Diagram

    ┌────────┐
    │        │
    │        │
    │        │
    └────┬───┘
         │
         │
         │
         │
         ▼
    ┌────────┐
    │        │
    │ Still  │
    │        │
    └────┬───┘
         ▲
         │
         │
         │
         ▼
    ┌────┴───┐
    │        │
    │ Moving │
    │        │
    └────┬───┘
         │
         │
         │
         │
         ▼
    ┌────────┐
    │        │
    │ Crash  │
    │        │
    └────┬───┘
         │
         │
         │
         │
         ▼
    ┌────────┐
    │        │
    │        │
    │        │
    └────────┘

## Error Handling Example

    ┌──────────────┐
    │              │
    │    Start     │
    │              │
    └───────┬──────┘
            │
            │
            │
            │
            ▼
    ┌──────────────┐
    │              │
    │ Check Error? ├─────No──────┐
    │              │             │
    └───────┬──────┘             │
            │                    │
            │                    │
           Yes                   │
            │                    │
            ▼                    ▼
    ┌──────────────┐     ┌───────────────┐
    │              │     │               │
    │  Log Error   │◄─┐  │  Process Data │
    │              │  │  │               │
    └───────┬──────┘  │  └───────┬───────┘
            │         │          │
            │         │          │
            │         └──────────┤
            │                   No
            ▼                    ▼
    ┌──────────────┐     ┌───────┴───────┐
    │              │     │    Success?   │
    │ Show Message │     │               │
    │              │     │               │
    └───────┬──────┘     └───────┬───────┘
            │                    │
            │                    │
            │                   Yes
            │                    │
            ▼                    ▼
    ┌──────────────┐     ┌───────────────┐
    │              │     │               │
    │ Return Null  │     │ Return Result │
    │              │     │               │
    └──────────────┘     └───────────────┘

## Gantt Chart (not supported by beautiful-mermaid)

    gantt
        title Project Development
        dateFormat  YYYY-MM-DD
        section Section
        Task 1           :a1, 2024-01-01, 30d
        Task 2           :after a1  , 20d
        section Another
        Task 3           :2024-01-12  , 12d
        Task 4           : 24d

## Regular Text

This is regular text between mermaid diagrams.

    * Point 1
    * Point 2
    * Point 3

`Inline code` is also supported.

**Bold** and *italic* text work fine.

```

### Stdin input

```
$ echo '# Hello\n\n```mermaid\nflowchart LR\n    A --> B\n```' | memd
# Hello

    ┌───┐     ┌───┐
    │   │     │   │
    │ A ├────►│ B │
    │   │     │   │
    └───┘     └───┘
```

## Uninstall

```bash
npm remove -g memd-cli
```

## Debug

```bash
# tag
npm install -g git+https://github.com/ktrysmt/memd.git#v1.1.0
# branch
npm install -g git+https://github.com/ktrysmt/memd.git#master
npm install -g git+https://github.com/ktrysmt/memd.git#feature
# hash
npm install -g git+https://github.com/ktrysmt/memd.git#a52a596
```

## Author

[ktrysmt](https://github.com/ktrysmt)
