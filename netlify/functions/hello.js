export async function handler(event) {
  const VERSION = 14;

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "GET",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version: VERSION }),
  };
}
