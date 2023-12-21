import { fetchContent } from "./fetchContent.js";
import { preprocessContent } from "./preprocessContent.js";
import { uploadConversation } from "./uploadConversation.js";

async function processContent() {
  const url = "https://www.debates.org/voter-education/debate-transcripts/september-29-2020-debate-transcript/";

  try {
    const fetchedContentName = await fetchContent(url);
    const preprocessedContentName = await preprocessContent(fetchedContentName);
    await uploadConversation(preprocessedContentName);
    console.log("Done");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

processContent();
