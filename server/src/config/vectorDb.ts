import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import "dotenv/config";

const embeddings = new VertexAIEmbeddings({
  model: "text-embedding-004",
});

export const vectorStore = new Chroma(embeddings, {
  collectionName: "events",
  url: "http://chromadb:8000",
  collectionMetadata: {
    "hnsw:space": "cosine",
  },
});

if (vectorStore) console.log("vectorStore connected");
