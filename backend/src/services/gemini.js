function getGeminiModel() {
  return process.env.GEMINI_MODEL || 'gemini-1.5-flash';
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

function fallbackAnalysis(text) {
  const lower = text.toLowerCase();
  const criticalWords = ['chest pain', 'breath', 'unconscious', 'bleeding', 'stroke'];
  const highRisk = criticalWords.some((w) => lower.includes(w));
  return {
    severity: highRisk ? 'high' : 'moderate',
    emergencyLevel: highRisk ? 'Urgent' : 'Monitor Closely',
    possibleDisease: highRisk ? 'Cardio-respiratory emergency suspicion' : 'Viral or general systemic condition',
    confidenceScore: highRisk ? 86 : 68,
    explanation: 'This is an AI-assisted suggestion, not a final diagnosis. Please contact a doctor for confirmation.',
    recommendations: highRisk
      ? ['Go to nearest emergency hospital now.', 'Do not travel alone.', 'Keep emergency contact informed.']
      : ['Hydrate and rest.', 'Track symptoms every 2-3 hours.', 'Seek doctor visit if worsening.'],
    firstAid: highRisk
      ? ['Keep patient seated upright.', 'Loosen tight clothing.', 'If severe chest pain continues, call emergency services immediately.']
      : ['Drink fluids and take rest.', 'Use a thermometer to monitor fever.', 'Avoid self-medication without advice.'],
    department: highRisk ? 'Emergency Medicine' : 'General Medicine'
  };
}

export async function analyzeWithGemini(text, language) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  if (!apiKey) {
    return fallbackAnalysis(text);
  }

  const prompt = `You are a healthcare triage assistant. User language: ${language}. Analyze the symptoms and return strict JSON keys: severity(low|moderate|high|critical), emergencyLevel, possibleDisease, confidenceScore(0-100), explanation(simple words), recommendations(array of short items), firstAid(array), department.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${prompt}\n\nSymptoms: ${text}` }] }],
      generationConfig: { response_mime_type: 'application/json' }
    })
  });

  if (!response.ok) return fallbackAnalysis(text);
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return fallbackAnalysis(text);

  try {
    return JSON.parse(rawText);
  } catch {
    return fallbackAnalysis(text);
  }
}

export async function analyzeReportsWithGemini(files) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  if (!apiKey) {
    return {
      summary: 'Reports uploaded successfully. AI summary is available after Gemini key setup.',
      redFlags: ['Please verify abnormal values with your doctor.'],
      specialist: 'General Physician'
    };
  }

  const prompt = 'Summarize uploaded reports in simple language for normal patient. Return strict JSON with keys summary, redFlags(array), specialist.';

  const contents = [{ parts: [{ text: prompt }] }];
  for (const f of files) {
    contents[0].parts.push({ inline_data: { mime_type: f.type || 'application/pdf', data: f.base64 } });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { response_mime_type: 'application/json' } })
  });

  if (!response.ok) {
    return { summary: 'Could not analyze report right now.', redFlags: [], specialist: 'General Physician' };
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    return JSON.parse(rawText);
  } catch {
    return { summary: rawText || 'Could not analyze report.', redFlags: [], specialist: 'General Physician' };
  }
}
