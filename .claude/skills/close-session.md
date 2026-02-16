# Close Session Skill

When this skill is invoked, perform the following steps:

## 1. Summarize the Session

Write a concise summary of what was accomplished during this session, including:
- Main tasks completed
- Key files modified
- Important decisions made
- Any bugs fixed or features added
- Technical details worth noting for future sessions

## 2. Update CLAUDE.md

Read the current CLAUDE.md file and update it:

### Session Log Entry
Append a new entry to the "Session Log" section at the bottom of CLAUDE.md with:
- Today's date as the header (format: `### YYYY-MM-DD: Brief Title`)
- Bulleted list of accomplishments
- Any relevant technical notes
- Next steps if applicable

### Update Other Sections (if needed)
- Update "Current Status" if project status changed
- Update "TODO / Remaining Work" if tasks were completed or new ones identified
- Update "Project Structure" if new files/folders were added
- Update any other sections that are now outdated

## 3. Confirm Completion

After updating CLAUDE.md, confirm to the user:
- Display the session summary
- Confirm the CLAUDE.md was updated
- Mention any sections that were modified

## Important Notes
- Keep summaries concise but comprehensive
- Use consistent formatting with existing session log entries
- Don't remove existing session log entries
- Focus on information that will be useful for future sessions
