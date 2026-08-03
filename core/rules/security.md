# Security

## Secrets

- Never hardcode credentials, tokens, or keys. Read them from the environment.
- Never log, print, or echo secret values. Mask them as `[REDACTED:<type>]`.
- Do not commit `.env` files or private keys.

## Input and output

- Treat all external input as untrusted; validate and normalize at boundaries.
- Use parameterized queries; never build SQL by string concatenation.
- Encode output for its destination (HTML, shell, SQL) to prevent injection.

## Dependencies

- Prefer well-maintained dependencies; review new ones before adding them.
- Keep dependencies patched; watch for known vulnerabilities.

## Access

- Apply least privilege to tokens, service accounts, and file permissions.
- Enforce authorization on every request, not just authentication.
- Separate environments; never point tools at production by default.

## Handling sensitive data

- Do not read, store, or transmit PII/PHI/PCI unless explicitly required.
- When sensitive data must be handled, minimize scope and retention.
