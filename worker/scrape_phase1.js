const puppeteer = require('puppeteer');
const axios = require('axios');

const BLOG_URL = 'https://beyondchats.com/blogs/';
const LARAVEL_API = 'http://127.0.0.1:8000/api/articles';

async function scrapePhase1() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.goto(BLOG_URL, { waitUntil: 'networkidle2' });

        const articleLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.includes('/blogs/') && !href.includes('#') && href !== 'https://beyondchats.com/blogs/')
                .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
                .slice(0, 5);
        });

        console.log(`   Found ${articleLinks.length} links.`);

        for (const link of articleLinks) {
            const articlePage = await browser.newPage();
            
            try {
                await articlePage.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });

                const data = await articlePage.evaluate(() => {
                    const title = document.querySelector('h1')?.innerText || document.title;
                    
                
                    const paragraphs = Array.from(document.querySelectorAll('article p, .blog-content p, main p'));
                    
                    
                    const cleanContent = paragraphs
                        .slice(0, 8) 
                        .map(p => `<p>${p.innerText}</p>`)
                        .join('');

                    return { title, cleanContent };
                });

                if (data.cleanContent.length < 50) {
                    continue; 
                }

                // Save to DB
                await axios.post(LARAVEL_API, {
                    title: data.title,
                    content: data.cleanContent, 
                    source_url: link,
                    is_updated: false
                });

            } catch (err) {
                console.error(`Failed: ${err.message}`);
            } finally {
                await articlePage.close();
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
        console.log("\n Scrape Complete!");
    }
}

scrapePhase1();