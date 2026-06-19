<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## React Doctor

Scan the React codebase for performance, architecture, accessibility, and security issues:

```bash
npm run doctor          # full scan
npm run doctor:changed  # only changes vs main
npm run doctor:score    # health score only
```

Config: `doctor.config.ts`. CI runs on pull requests via `.github/workflows/react-doctor.yml`. Agent skill: `.agents/skills/react-doctor/`.
