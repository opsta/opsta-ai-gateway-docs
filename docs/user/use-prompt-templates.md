# Use prompt templates

Your project admin can publish reusable **prompt templates** — a named prompt with `{{variable}}`
placeholders. Instead of hard-coding prompt text in your app, you invoke a template by name and pass
values for its variables. The gateway fills in the template and sends the full request to the model.

## Invoke a template

Call the normal chat-completions endpoint, but send `template` (the name) and `properties` (its
variables) **instead of** a `messages` array:

```bash
curl https://<your-gateway>/v1/chat/completions \
  -H "Authorization: Bearer $OPSTA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "template": "code-review",
        "properties": { "language": "Go", "diff": "<your diff here>" }
      }'
```

The gateway substitutes each `{{variable}}` from `properties`, attaches the template's model, and
forwards a normal request. The response is a standard chat-completion — nothing else in your client
changes.

## Notes

- **Templates are per-project and must be _published_.** Ask your admin which template names exist
  (they manage them under Projects → Templates). Invoking a name that isn't published for your
  project returns **404 `unknown_template`**.
- **Unfilled variables stay literal.** If you omit a `{{variable}}`, the text is sent as-is — pass
  every variable the template expects.
- **You can still call models normally.** Sending a regular `messages` array (no `template` field)
  works exactly as before; templates are opt-in per request.

## Next steps

- [Models & routing](/user/models-and-routing) — the logical models you can call.
- [Connect a client](/user/connect-a-client) — point your OpenAI-compatible tool at the gateway.
