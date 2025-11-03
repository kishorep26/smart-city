'use client'
import { useState } from 'react';
import { classifyIncident } from '../lib/api';

export default function IncidentClassifier() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{category: string, confidence: number} | null>(null);
  const [pending, setPending] = useState(false);

  const predict = async () => {
    setPending(true);
    const res = await classifyIncident(input);
    setResult(res);
    setPending(false);
  };

  return (
    <div className="my-4 p-4 border rounded">
      <h3 className="font-bold mb-2">Try Incident Classification</h3>
      <input
        className="border px-2 py-1 mr-2 rounded"
        placeholder="Describe your incident..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={predict} disabled={pending || !input}
        className="bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-400">
        Classify
      </button>
      {result && (
        <div className="mt-2 text-sm">
          <b>Predicted:</b> <span className="text-blue-600">{result.category}</span>
          <span className="ml-4 text-gray-400">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
