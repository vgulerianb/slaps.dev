# Security

runmix **runs real processes** on your machine with the **user’s privileges**. It is a convenience layer for agents and automation, **not** a sandbox.

## What runmix enforces

- **`cwd`** passed to `run()` must resolve **inside** the workspace (`effectiveRoot`); otherwise it throws.
- **Read-only mode** blocks writes through the provided **`fs`** adapter; it does **not** stop a shell command from redirecting to arbitrary paths unless you control the command.
- **Timeouts** send **SIGKILL** after `timeoutMs` (per engine implementation).

## What it does not enforce

- No seccomp, no containers, no VM—**bash/python/node** can invoke any binary on `PATH`.
- **SQL** uses the host’s **`sqlite3`** CLI with the process environment you supply.
- **Overlay** still executes with full user permissions; `apply()` overwrites files in the real root.

## Recommendations

1. Run agents under a **dedicated OS user** or **container** with minimal filesystem access.
2. Prefer **read-only** or **overlay** when exploring untrusted code; review before `apply()`.
3. Set **tight `timeoutMs` and `maxOutputBytes`** for untrusted workloads.
4. Do not expose `Runtime` directly over the public internet without an additional security boundary.

## Dependency note

The npm package depends on **`minimatch`** for glob handling only; execution uses Node **`child_process`**.
