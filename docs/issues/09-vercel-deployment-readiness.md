## Parent PRD

#1

## What to build

Prepare the application for live demo use on Vercel so the deployed version reflects the same end-to-end behavior as local development. This slice should cover deploy configuration, environment handling, and live acceptance checks for the hosted application.

## Acceptance criteria

- [ ] The app is deployable on Vercel with frontend and API routes working together against the processed dataset
- [ ] Required environment variables for the optional LLM layer are handled securely in deployment
- [ ] The live deployment passes the acceptance checks described in the parent PRD for strong matches, weak matches, validation, and graceful LLM fallback

## Blocked by

- Blocked by #2
- Blocked by #4
- Blocked by #6

## User stories addressed

- User story 35
- User story 36
- User story 38
- User story 40

