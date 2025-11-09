import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Load and process the PDF document from buffer
async function loadAndProcessPDF(pdfBuffer: Buffer): Promise<{ fullText: string; chunks: string[] }> {
  console.log("Loading PDF document from buffer...");
  const uint8Array = new Uint8Array(pdfBuffer);
  const blob = new Blob([uint8Array], { type: 'application/pdf' });

  const loader = new PDFLoader(blob);
  const docs = await loader.load();
  const fullText = docs.map(doc => doc.pageContent).join("\n\n");

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 300,
  });

  const splits = await textSplitter.splitDocuments(docs);
  const chunks = splits.map(doc => doc.pageContent);

  console.log(`Loaded and processed ${docs.length} pages, created ${chunks.length} chunks`);

  return { fullText, chunks };
}

function getRelevantChunks(chunks: string[], question: string, topK: number = 3): string[] {
  const questionLower = question.toLowerCase();
  const keywords = questionLower
    .split(/\s+/)
    .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'does', 'have', 'that', 'this', 'with', 'from'].includes(word));
  const scoredChunks = chunks.map((chunk, index) => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    keywords.forEach(keyword => {
      const matches = (chunkLower.match(new RegExp(keyword, 'g')) || []).length;
      score += matches;
    });

    if (chunkLower.includes('objective')) score += 2;
    if (chunkLower.includes('key result')) score += 2;
    if (chunkLower.includes('target')) score += 1;
    if (chunkLower.includes('metric')) score += 1;

    return { chunk, score, index };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK).map(item => item.chunk);
}

async function analyzeOKRWithAI(question: string, pdfBuffer: Buffer): Promise<string> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const { fullText, chunks } = await loadAndProcessPDF(pdfBuffer);
  const relevantChunks = getRelevantChunks(chunks, question, 3);
  const context = chunks.length <= 5 ? fullText : relevantChunks.join("\n\n---\n\n");
  const prompt = `You are an expert at analyzing OKR (Objectives and Key Results) documents. You have been provided with content from a company's OKR document.
      CONTEXT FROM OKR DOCUMENT:
      ${context}

      QUESTION:
      ${question}

      INSTRUCTIONS:
      1. Answer the question based ONLY on the information provided in the context above
      2. Be specific and cite relevant objectives, key results, or metrics when possible
      3. If the context doesn't contain enough information to answer the question, clearly state that
      4. Format your response in a clear, professional manner using markdown
      5. Use bullet points or numbered lists when appropriate
      6. If discussing metrics or progress, include specific numbers mentioned in the document
      7. Structure your answer with clear headings if the answer has multiple parts

      Please provide a comprehensive answer:`;
  const response = await model.invoke([new HumanMessage(prompt)]);
  const answer = response.content as string;

  return answer;
}
export async function analyzeOKR(question: string, pdfBuffer: Buffer): Promise<string> {
  return analyzeOKRWithAI(question, pdfBuffer);
}
export async function getOKRSummary(pdfBuffer: Buffer): Promise<string> {
  const { fullText } = await loadAndProcessPDF(pdfBuffer);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const prompt = `You are an expert at analyzing OKR (Objectives and Key Results) documents. Please provide a comprehensive summary of the following OKR document.
    DOCUMENT CONTENT:
    ${fullText}

    INSTRUCTIONS:
    Please create a well-structured summary that includes:
    1. An overview of the document (company, time period, scope)
    2. All objectives organized by department/team
    3. Key results for each objective with their targets and metrics
    4. Any notable themes or priorities across objectives

    Format the summary in clear, readable markdown with:
    - Clear headings for each department/team
    - Bullet points for objectives
    - Sub-bullets for key results
    - Bold text for important metrics or targets

    Provide a comprehensive summary:`;
  const response = await model.invoke([new HumanMessage(prompt)]);
  return response.content as string;
}