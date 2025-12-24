<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use App\Models\Article;

class ScrapeBeyondChats extends Command
{
    protected $signature = 'scrape:start';
    protected $description = 'Scrape articles from BeyondChats';

    public function handle()
    {
        $this->info('Starting Scraper...');
        
        $response = Http::get('https://beyondchats.com/blogs/');
        
        if ($response->failed()) {
            $this->error('Failed to connect to BeyondChats.');
            return;
        }

        $crawler = new Crawler($response->body());
        $crawler->filter('.post-card')->slice(0, 5)->each(function ($node) {
            try {
                $title = $node->filter('h2')->text();
                $link = $node->filter('a')->attr('href');
                
                $this->info("Found: $title");
                $subResponse = Http::get($link);
                $subCrawler = new Crawler($subResponse->body());
                
                $content = $subCrawler->filter('.post-content')->count() > 0 
                    ? $subCrawler->filter('.post-content')->text() 
                    : 'No content found';

                //  Save to DB
                Article::updateOrCreate(
                    ['source_url' => $link],
                    [
                        'title' => $title,
                        'content' => $content,
                        'is_updated' => false
                    ]
                );
            } catch (\Exception $e) {
                $this->error("Error scraping article: " . $e->getMessage());
            }
        });

        $this->info('Scraping Done.');
    }
}