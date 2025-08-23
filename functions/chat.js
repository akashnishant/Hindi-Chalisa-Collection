export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await request.json();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
