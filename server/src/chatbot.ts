import { vectorStore } from "./config/vectorDb";
import { ChatVertexAI } from "@langchain/google-vertexai";

export async function handleChat(user_query: string) {
  try {
    const similaritySearchResults = await vectorStore.similaritySearch(
      user_query,
      1,
    );
    const res = similaritySearchResults[0];
    const metadata = res.metadata;
    const matched_info = { title: res.pageContent, ...metadata };

    const context = `Information: ${JSON.stringify(matched_info)} and the user query: ${user_query}`;

    console.log(context);

    const model = new ChatVertexAI({
      model: "gemini-1.5-flash",
      temperature: 0,
    });

    const sys_prompt = `
	 Instructions:
        - Be helpful and answer questions concisely keeping friendly tone.
		- If you don't know the answer, say 'I don't know.'
        - Use the provided context to ensure accuracy and relevance.
        - Incorporate your preexisting knowledge to enhance responses.
        - Here's the context:
         Context: ${context}
	`;
    const modelQuery = await model.invoke(sys_prompt);
    return modelQuery.content;
  } catch (err) {
    console.log(err);
  }
}
