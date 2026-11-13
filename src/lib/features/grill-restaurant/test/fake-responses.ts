/**
 * Fake API responses shared by this feature's tests. They go through the AI
 * SDK, which checks every reply, so each is the smallest reply that passes.
 */

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function sseResponse(events: unknown[]) {
  return new Response(
    events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""),
    { headers: { "content-type": "text/event-stream" } },
  );
}

/** One web search action, as OpenAI reports it. */
export type OpenAISearchAction =
  | { type: "search"; query?: string; queries?: string[] }
  | { type: "open_page"; url: string }
  | { type: "find_in_page"; url: string; pattern?: string };

/**
 * A streamed OpenAI Responses API answer: one web search call per action,
 * then a message holding `text`.
 */
export function openaiStream(
  text: string,
  actions: OpenAISearchAction[] = [],
  usage: Record<string, unknown> = { input_tokens: 1000, output_tokens: 100 },
) {
  const searches = actions.flatMap((action, index) => {
    const id = `ws_${index}`;
    return [
      {
        type: "response.output_item.added",
        output_index: index,
        item: { type: "web_search_call", id, status: "in_progress" },
      },
      {
        type: "response.output_item.done",
        output_index: index,
        item: { type: "web_search_call", id, status: "completed", action },
      },
    ];
  });
  const message = { type: "message", id: "msg_1" };
  const index = actions.length;
  return sseResponse([
    {
      type: "response.created",
      response: { id: "resp_1", created_at: 0, model: "gpt-6-luna" },
    },
    ...searches,
    { type: "response.output_item.added", output_index: index, item: message },
    ...(text
      ? [
          {
            type: "response.output_text.delta",
            item_id: "msg_1",
            output_index: index,
            delta: text,
          },
        ]
      : []),
    { type: "response.output_item.done", output_index: index, item: message },
    { type: "response.completed", response: { usage } },
  ]);
}

/** A non-streamed OpenAI Responses API answer holding `text`. */
export function openaiResponse(
  text: string,
  usage: Record<string, unknown> = { input_tokens: 1000, output_tokens: 100 },
) {
  return jsonResponse({
    id: "resp_1",
    created_at: 0,
    model: "gpt-6-luna",
    output: [
      {
        type: "message",
        role: "assistant",
        id: "msg_1",
        content: [{ type: "output_text", text, annotations: [] }],
      },
    ],
    usage,
  });
}

/** A Claude Messages API answer holding `text`. */
export function claudeMessage(text: string) {
  return jsonResponse({
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "claude-opus-5-5",
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  });
}
