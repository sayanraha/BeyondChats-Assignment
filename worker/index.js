require("dotenv").config();
const axios = require("axios");

async function runSmartWorker() {
  try {
    console.log("Fetching full article list...");

    const response = await axios.get(`${process.env.LARAVEL_API_URL}/articles`);
    const allArticles = response.data;

    const originals = allArticles.filter((a) => !a.is_updated);

    const aiVersions = allArticles.filter((a) => a.is_updated);

    const pendingArticles = originals.filter((orig) => {
      const expectedTitle = orig.title + " (AI Updated)";
      const alreadyExists = aiVersions.find((ai) => ai.title === expectedTitle);
      return !alreadyExists;
    });

    console.log(
      `   Found ${pendingArticles.length} pending articles to process.`
    );

    if (pendingArticles.length === 0) {
      console.log("All articles are already updated! No work left.");
      return;
    }

    // Loop through the pending ones
    for (const article of pendingArticles) {
      console.log(`\nProcessing: "${article.title}"`);
      const fakeLinks = [
        "https://techcrunch.com/ai-trends-2025",
        "https://wired.com/future-tech",
      ];
      const mockNewContent = `
                <h3>${article.title} (Updated Edition)</h3>
                <p><strong>[AI Analysis]:</strong> This article has been revised with the latest industry data to ensure accuracy.</p>
                <p>${article.content.substring(0, 150)}...</p>
                <p>Industry experts suggest that this topic is evolving rapidly. Our analysis indicates a 40% growth in this sector.</p>
                <hr>
                <h4>References:</h4>
                <ul>
                    <li><a href="${fakeLinks[0]}">TechCrunch Analysis</a></li>
                    <li><a href="${fakeLinks[1]}">Wired Report</a></li>
                </ul>
            `;

      // Save to DB
      await axios.post(`${process.env.LARAVEL_API_URL}/articles`, {
        title: article.title + " (AI Updated)",
        content: mockNewContent,
        source_url: article.source_url,
        is_updated: true,
        citations: JSON.stringify(fakeLinks),
      });
      console.log("Created AI Version!");

      await new Promise((r) => setTimeout(r, 500));
    }

    console.log("\n Success : All articles have been processed.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

runSmartWorker();
