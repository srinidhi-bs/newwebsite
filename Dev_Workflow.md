Basic info:
1. I'm Srinidhi (Benglauru, Karnataka, India).
2. I'm an accountant by profession and learning coding for passion.

Github details:
1. Have proper version control system for managing our code. Use git and github.
2. email id: mailsrinidhibs@gmail.com
3. Name: Srinidhi BS and Claude
4. github username: https://github.com/srinidhi-bs

Working details:
1. I work on a Lenovo Thinkpad p14s gen 5 AMD with Win 11, 64gb ram.
2. Since I'm learning to code, all your code generation should include extensive commenting.
3. I don't know the best way to plan the architecture/tech stack for an app. I know what I want to build but don't know how to do it. So, I'll request for features, you decide the way to implement the features.
4. I like examples to understand concepts.
5. You are running on Claude Code on WSL. But my scripts must run directly on Windows and not via WSL. So, our apps should run both on WSL (to test) and on Windows (to use).
6. Please don't make any assumptions. Always ask me if you have any doubts or if some info is missing. DO NOT add your own assumed to-dos unless I ask you.
7. When we are implementing a feature, if there is a better way to implement something, please tell me that instead of blindly following what I ask you to do.
8. Please add extensive logging to all the functions in the apps that we develop. This will help us debug issues better.

Development Methodology:
I use a systematic 6-file approach for all projects to manage token usage and maintain context across chat sessions:

Core Files (read at start of each chat):
1. CLAUDE.md (≤400 lines): Project overview, architecture, and essential context
2. TODO_CURRENT.md (≤200 lines): Active sprint/phase tasks only
3. FUNCTION_MAP.md (≤750 lines): File structure + function signatures + call relationships
4. PROJECT_PHASES.md (≤100 lines): High-level project roadmap

Supporting Files (read only when needed):
5. TODO_FUTURE.md (unlimited): Future phase tasks
6. TODO_COMPLETED.md (unlimited): Archived completed tasks for historical reference

File Maintenance Rules:
- FUNCTION_MAP.md: ❌ NO line numbers, NO "Process:" steps, NO change history | ✅ ONLY signatures, signals, API endpoints
- Keep each file focused on its single purpose - never duplicate info across files

🚨 FILE UPDATE ENFORCEMENT RULES (STRICT) 🚨

PRINCIPLE: Minimal viable update. Prevention > Cleanup. Next session can ask questions if needed.

FUNCTION_MAP.md Updates (Limit: ≤1500 lines):
✅ DO ADD (signature-only format):
- Function/method signature with parameters and return type
- Qt signals (name and parameter types only)
- API endpoints (method + URL + one-line description)

❌ DO NOT ADD:
- Multi-line descriptions of what function does
- Implementation details, internal logic, or algorithm explanations
- "Features:", "Integration:", "Performance:", "Test Coverage:" sections
- Example usage code or parameter explanations
- Test results, statistics, validation notes, or performance metrics
- "Used for...", "Purpose...", "Returns..." explanations beyond class-level
- Procedural steps or workflow descriptions

✅ GOOD: `- calculate_daily_emas(symbol, target_date=None)` → dict
❌ BAD: Adding bullet points explaining what it calculates, queries, returns, or is used for

TODO_CURRENT.md Updates (Limit: ≤200 lines):
✅ DO ADD:
- ✅ Task X.X: Brief task name (commit: hash)

❌ DO NOT ADD:
- Implementation summaries or "What we did" narratives
- Test results, statistics, or performance metrics
- "Files Modified:", "Changes Made:", "Key Features:" sections
- Detailed step-by-step of what was implemented
- Bug fix descriptions or resolution notes

✅ GOOD: ✅ Task 2.3: Batch Indicator Calculator Script (commit: c6cdc6c)
❌ BAD: Adding "Implementation Summary:", test results, file lists, or feature descriptions

CLAUDE.md Updates (Limit: ≤400 lines):
✅ DO UPDATE:
- Current phase status line
- Last updated timestamp
- Next session action line

❌ DO NOT ADD:
- New sections describing completed work
- Implementation details for features
- Test results or validation notes
- Database schema expansions (unless major phase change)
- Duplicate info already in PROJECT_PHASES or FUNCTION_MAP

PROJECT_PHASES.md Updates (Limit: ≤100 lines):
✅ ONLY UPDATE WHEN:
- A major phase completes (Phase 1, Phase 2, Phase 3, etc.)
- Starting a new major phase

❌ DO NOT ADD:
- Sub-phases (1.5, 1.6, 1.7, etc.) - these belong in TODO_FUTURE
- Individual task completion notes
- Detailed deliverables for micro-iterations

TODO_COMPLETED.md Updates (unlimited):
✅ WHEN TO ARCHIVE:
- When entire phase completes (e.g., all Phase 1 tasks done, and NOT when an individual 1.x task is complete)
- Never archive mid-phase - keep current phase visible for context

✅ HOW TO ARCHIVE:
- Move complete phase with all task details from TODO_CURRENT.md
- Organize by phase with phase summary at top (completion date, total tasks, key achievements)
- Keep full task details (deliverables, acceptance criteria, actual time)
- Format: ## Phase X: Phase Name (COMPLETED YYYY-MM-DD)

✅ WHAT TO KEEP IN TODO_CURRENT.md:
- One-line summary of archived phases with reference
- Example: "## Completed Phases (see TODO_COMPLETED.md for details)"
- Example: "- ✅ Phase 1: Foundation & Google Sheets Integration (10 tasks, completed 2025-11-14)"

Pre-Edit Checklist (Review BEFORE modifying any file):
1. ❓ Am I adding ONLY the new function signature (not descriptions)?
2. ❓ Am I avoiding "Features:", "Performance:", "Test Coverage:" sections?
3. ❓ Am I marking tasks complete without implementation summaries?
4. ❓ Would this info be better in TODO_FUTURE.md instead?
5. ❓ Is this update ESSENTIAL for the next session to understand context?

If answer to #5 is NO → DO NOT ADD IT.

Self-Check: If you (Claude) find yourself writing paragraphs → STOP → Delete → Write 1 line instead.

Chat Session Workflow:
- Each session = Let's run → 1 TODO_CURRENT task → develop → test → Let's rest → update files → commit → new chat
- Total core context: ~900 lines maximum (token efficient)
- When TODO_CURRENT empties: promote tasks from TODO_FUTURE
- When phase completes: archive completed phase to TODO_COMPLETED.md to keep TODO_CURRENT.md lean
- Always update FUNCTION_MAP when adding/modifying functions
- Commit only after my "let's rest" message. DO NOT commit without me explicitly asking you to commit or before I say "Let's rest".

Task Management:
- Break large features into small, testable tasks (1-3 hours each)
- Include prerequisites and time estimates
- Archive completed phases to TODO_COMPLETED.md when phase finishes to maintain lean TODO_CURRENT.md
- Use git commits as natural checkpoint system

Session Commands:
Automated code-words for seamless session management across all projects:

"Let's run" (Session Start):
- Auto-read: CLAUDE.md + TODO_CURRENT.md + PROJECT_PHASES.md + relevant FUNCTION_MAP sections
- Check git status for uncommitted changes
- Identify next priority task from TODO_CURRENT
- Provide brief status and ask if we can start working

"Let's rest" (Session End):
- Update TODO_CURRENT.md with session progress
- Update FUNCTION_MAP.md with functions added/modified
- Update other files if significant changes made
- Archive completed phase to TODO_COMPLETED.md if phase is finished
- Git commit with descriptive session summary
- Push changes to GitHub
- Provide clear handoff notes for next session. Update the handoff notes in session_notes/ folder (Filename pattern: session_XX_YYYY-MM-DD_brief_task_description.md. Example filename: session_04_2025-11-13_authentication.md)

Additional Commands:
- "Status check": Quick project overview without starting work
- "What's next?": Show next priority task details
- "Quick fix": Lightweight session for small changes
- "Debug mode": Enhanced context loading for troubleshooting
