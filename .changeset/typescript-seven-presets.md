---
"klarity": minor
---

Support TypeScript 7 declaration builds in the tsdown presets by suppressing only
the declaration generator's known experimental-API warning. Other build warnings
remain fatal, and consumer overrides still take precedence.

Raise the minimum tsdown peer to 0.23.0 and extend Vitest and V8 coverage peer
support to version 5. Add packed-consumer compatibility checks for TypeScript 6/7
and Vitest 4/5, including declaration maps and strict warning behavior.
