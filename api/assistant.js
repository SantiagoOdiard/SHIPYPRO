const MODEL = process.env.OPENAI_MODEL || "gpt-5.2";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { messages = [], context = {} } = request.body || {};
  const cleanMessages = sanitizeMessages(messages);

  if (!cleanMessages.length) {
    return response.status(400).json({ error: "Missing messages" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(200).json({
      reply: buildDemoReply(cleanMessages, context),
      mode: "demo",
    });
  }

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: buildInstructions(context),
        input: buildTranscript(cleanMessages),
        max_output_tokens: 900,
      }),
    });

    const payload = await aiResponse.json();
    if (!aiResponse.ok) {
      return response.status(200).json({
        reply: buildDemoReply(cleanMessages, context),
        mode: "demo",
        warning: payload?.error?.message || "OpenAI request failed",
      });
    }

    return response.status(200).json({
      reply: extractOutputText(payload) || buildDemoReply(cleanMessages, context),
      mode: "openai",
      model: MODEL,
    });
  } catch (error) {
    return response.status(200).json({
      reply: buildDemoReply(cleanMessages, context),
      mode: "demo",
      warning: error.message,
    });
  }
};

function sanitizeMessages(messages) {
  return messages
    .filter((message) => ["user", "assistant"].includes(message.role) && message.content)
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: String(message.content).slice(0, 1800),
    }));
}

function buildInstructions(context) {
  return [
    "Sei ShippyPro AI Logistics Copilot, un assistente SaaS esperto di ecommerce logistics.",
    "Rispondi come ChatGPT: naturale, utile, contestuale, conversazionale.",
    "Non limitarti a frasi predefinite: interpreta la domanda dell'utente e ragiona sui dati logistici disponibili.",
    "Quando possibile includi: analisi, dati rilevanti, causa probabile, azione consigliata.",
    "Se la domanda non riguarda logistica, rispondi comunque in modo utile ma torna al contesto operativo.",
    "Usa italiano semplice. Puoi capire anche spagnolo o errori di battitura.",
    `Contesto operativo demo: ${JSON.stringify(context).slice(0, 5000)}`,
  ].join("\n");
}

function buildTranscript(messages) {
  return messages.map((message) => `${message.role === "user" ? "Utente" : "Assistant"}: ${message.content}`).join("\n\n");
}

function extractOutputText(payload) {
  if (payload?.output_text) return payload.output_text;
  return payload?.output
    ?.flatMap((item) => item.content || [])
    ?.map((content) => content.text)
    ?.filter(Boolean)
    ?.join("\n")
    ?.trim();
}

function buildDemoReply(messages, context) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const carriers = context.carriers || [];
  const bestCarrier = [...carriers].sort((a, b) => (b.onTime || 0) - (a.onTime || 0))[0] || { name: "DHL", onTime: 92, avgCost: 8.2 };
  const worstCarrier = [...carriers].sort((a, b) => (a.onTime || 0) - (b.onTime || 0))[0] || { name: "DPD", onTime: 64 };
  const saving = context.costOptimizer?.identifiedSaving || 18760;

  if (last.includes("guadagn") || last.includes("profit") || last.includes("margine")) {
    return `Stai guadagnando meglio dove combini costo medio basso e puntualita alta. Dai dati disponibili, ${bestCarrier.name} e il carrier piu solido con ${bestCarrier.onTime}% on-time e costo medio circa EUR${bestCarrier.avgCost}.\n\nAzione consigliata: aumenta il volume sulle rotte dove ${bestCarrier.name} mantiene SLA alto, e usa carrier piu economici solo per spedizioni non premium. Risparmio stimato monitorato: EUR${saving.toLocaleString("it-IT")}.`;
  }

  if (last.includes("ritard") || last.includes("late") || last.includes("delay")) {
    return `Il problema principale sembra essere la combinazione tra crescita volume e performance bassa di ${worstCarrier.name}, che oggi ha ${worstCarrier.onTime}% on-time.\n\nDati utili: alert predittivi attivi ${context.alerts?.length || 3}, spedizioni in ritardo visibili nel registro e crescita ritardi per paese.\n\nAzione consigliata: sposta temporaneamente le spedizioni premium su ${bestCarrier.name}, controlla le rotte Germania/Francia e aggiorna le promesse di consegna nei checkout a rischio.`;
  }

  if (last.includes("costo") || last.includes("perd") || last.includes("risparm")) {
    return `La perdita economica piu probabile arriva da spedizioni economiche che poi generano ritardi, rimborsi e ticket customer care.\n\nIl risparmio potenziale identificato e EUR${saving.toLocaleString("it-IT")}. La prima azione e confrontare costo medio e SLA: non scegliere solo il carrier piu economico, ma quello con miglior costo per consegna riuscita.`;
  }

  return `Ho capito. Posso analizzare spedizioni, ritardi, costi, resi, carrier e rischi operativi. Se vuoi, posso aiutarti a capire dove stai guadagnando, dove stai perdendo margine, quale carrier conviene usare o quali spedizioni sono a rischio.`;
}
