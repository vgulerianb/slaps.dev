# Security

agentpad **runs real processes** on your machine with the **user’s privileges**. It is a convenience layer for agents and automation, **not** a sandbox.

## What agentpad enforces

- **`cwd`** passed to `run()` must resolve **inside** the workspace (`effectiveRoot` / `effective_root`); otherwise it throws.
- **Read-only mode** blocks writes through the library’s filesystem helpers; it does **not** stop a shell command from redirecting to arbitrary paths unless you control the command.
- **Timeouts** send **SIGKILL** after the configured timeout (per engine implementation).

## What it does not enforce

- No seccomp, no containers, no VM—**bash/python/node** can invoke any binary on `PATH`.
{% ts %}
- **SQL** uses the host’s **`sqlite3`** CLI with the process environment you supply.
{% /ts %}
{% py %}
- **SQL** uses the standard-library **`sqlite3`** module with the process environment you supply.
{% /py %}
- **Overlay** still executes with full user permissions; `apply()` overwrites files in the real root.

## Recommendations

1. Run agents under a **dedicated OS user** or **container** with minimal filesystem access.
2. Prefer **read-only** or **overlay** when exploring untrusted code; review before `apply()`.
3. Set **tight timeouts and output limits** for untrusted workloads.
4. Do not expose `Runtime` directly over the public internet without an additional security boundary.

## Dependency note

{% ts %}
The npm package depends on **`minimatch`** for glob handling only; execution uses Node **`child_process`**.
{% /ts %}

{% py %}
Glob scoping uses **`fnmatch`** against include/exclude patterns; execution uses the standard library **`subprocess`**.
{% /py %}
