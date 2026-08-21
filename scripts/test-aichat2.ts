import "dotenv/config";

const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + process.env.GEMINI_API_KEY;
const resp = await fetch(URL, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: "dis bonjour" }] }],
  }),
});
console.log("status:", resp.status);
const txt = await resp.text();
console.log("body:", txt.slice(0, 600));
