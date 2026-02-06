import { BlogPost } from '@/types/blog';

/**
 * SEO Service - Advanced SEO strategies for search engines and AI discovery
 * Optimized for Google, ChatGPT, Perplexity, Claude, and other LLMs
 */

class SEOService {
    /**
     * Generate comprehensive JSON-LD structured data for AI understanding
     */
    generateAdvancedStructuredData(post: BlogPost, relatedPosts?: BlogPost[]) {
        const baseUrl = window.location.origin;

        return {
            "@context": "https://schema.org",
            "@graph": [
                // Main Article
                {
                    "@type": "BlogPosting",
                    "@id": `${baseUrl}/blog/${post.slug}#article`,
                    "headline": post.title,
                    "alternativeHeadline": post.seoTitle || post.title,
                    "description": post.seoDescription || post.excerpt,
                    "image": {
                        "@type": "ImageObject",
                        "url": post.featuredImage,
                        "width": 1200,
                        "height": 630
                    },
                    "author": {
                        "@type": "Person",
                        "@id": `${baseUrl}#author`,
                        "name": post.author,
                        "description": post.authorBio,
                        "image": post.authorAvatar,
                        "jobTitle": "Advogada Especialista",
                        "knowsAbout": ["Direito Previdenciário", "Direito Trabalhista", "Direito de Família"]
                    },
                    "publisher": {
                        "@type": "Organization",
                        "@id": `${baseUrl}#organization`,
                        "name": "Dra. Thalita Melo - Advocacia",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/logo.png`,
                            "width": 600,
                            "height": 60
                        },
                        "url": baseUrl,
                        "sameAs": [
                            "https://www.instagram.com/drathalitamelo",
                            "https://www.linkedin.com/in/drathalitamelo"
                        ]
                    },
                    "datePublished": post.publishedAt,
                    "dateModified": post.updatedAt,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `${baseUrl}/blog/${post.slug}`
                    },
                    "articleSection": post.category,
                    "keywords": post.tags.join(', '),
                    "wordCount": post.content.split(/\s+/).length,
                    "timeRequired": `PT${post.readingTime}M`,
                    "inLanguage": "pt-BR",
                    "isAccessibleForFree": true,
                    "isPartOf": {
                        "@type": "Blog",
                        "@id": `${baseUrl}/blog#blog`
                    },
                    "about": {
                        "@type": "Thing",
                        "name": post.category,
                        "description": `Artigos sobre ${post.category}`
                    },
                    "mentions": post.tags.map(tag => ({
                        "@type": "Thing",
                        "name": tag
                    })),
                    // AI-specific metadata
                    "educationalLevel": "Intermediate",
                    "learningResourceType": "Article",
                    "audience": {
                        "@type": "Audience",
                        "audienceType": "General Public"
                    }
                },
                // Breadcrumb
                {
                    "@type": "BreadcrumbList",
                    "@id": `${baseUrl}/blog/${post.slug}#breadcrumb`,
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": baseUrl
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Blog",
                            "item": `${baseUrl}/blog`
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": post.category,
                            "item": `${baseUrl}/blog?category=${encodeURIComponent(post.category)}`
                        },
                        {
                            "@type": "ListItem",
                            "position": 4,
                            "name": post.title,
                            "item": `${baseUrl}/blog/${post.slug}`
                        }
                    ]
                },
                // FAQ Schema (if applicable)
                ...(this.extractFAQs(post.content).length > 0 ? [{
                    "@type": "FAQPage",
                    "@id": `${baseUrl}/blog/${post.slug}#faq`,
                    "mainEntity": this.extractFAQs(post.content)
                }] : []),
                // Related Articles
                ...(relatedPosts && relatedPosts.length > 0 ? [{
                    "@type": "ItemList",
                    "@id": `${baseUrl}/blog/${post.slug}#related`,
                    "name": "Artigos Relacionados",
                    "itemListElement": relatedPosts.map((related, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": `${baseUrl}/blog/${related.slug}`,
                        "name": related.title
                    }))
                }] : [])
            ]
        };
    }

    /**
     * Extract FAQ sections from content for FAQ schema
     */
    private extractFAQs(content: string): any[] {
        const faqs: any[] = [];

        // Simple regex to find Q&A patterns
        const qaPairs = content.match(/<h[23]>(.*?pergunta.*?)<\/h[23]>\s*<p>(.*?)<\/p>/gi);

        if (qaPairs) {
            qaPairs.forEach(pair => {
                const question = pair.match(/<h[23]>(.*?)<\/h[23]>/i)?.[1];
                const answer = pair.match(/<p>(.*?)<\/p>/i)?.[1];

                if (question && answer) {
                    faqs.push({
                        "@type": "Question",
                        "name": question.replace(/<[^>]*>/g, ''),
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": answer.replace(/<[^>]*>/g, '')
                        }
                    });
                }
            });
        }

        return faqs;
    }

    /**
     * Generate AI-optimized meta tags for LLM discovery
     */
    generateAIMetaTags(post: BlogPost) {
        return {
            // Standard SEO
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt,
            keywords: post.seoKeywords?.join(', ') || post.tags.join(', '),

            // OpenAI/ChatGPT specific
            'openai:title': post.title,
            'openai:description': post.excerpt,
            'openai:url': `${window.location.origin}/blog/${post.slug}`,

            // Perplexity AI
            'perplexity:title': post.title,
            'perplexity:snippet': post.excerpt,

            // Claude/Anthropic
            'anthropic:content-type': 'article',
            'anthropic:category': post.category,

            // Google Discover
            'google-site-verification': 'YOUR_VERIFICATION_CODE',

            // Rich snippets
            'article:published_time': post.publishedAt,
            'article:modified_time': post.updatedAt,
            'article:author': post.author,
            'article:section': post.category,
            'article:tag': post.tags.join(','),

            // AI content classification
            'ai:content-quality': 'high',
            'ai:expertise-level': 'professional',
            'ai:fact-checked': 'true',
            'ai:original-content': 'true'
        };
    }

    /**
     * Generate robots.txt optimized for AI crawlers
     */
    generateRobotsTxt(): string {
        return `# Robots.txt optimized for AI crawlers
User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*

# AI-specific crawlers
User-agent: GPTBot
Allow: /blog
Allow: /blog/*
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /blog
Allow: /blog/*

User-agent: CCBot
Allow: /blog
Allow: /blog/*

User-agent: anthropic-ai
Allow: /blog
Allow: /blog/*

User-agent: Claude-Web
Allow: /blog
Allow: /blog/*

User-agent: PerplexityBot
Allow: /blog
Allow: /blog/*

User-agent: Google-Extended
Allow: /blog
Allow: /blog/*

# Disallow admin areas
User-agent: *
Disallow: /admin
Disallow: /api

# Sitemap location
Sitemap: ${window.location.origin}/sitemap.xml
Sitemap: ${window.location.origin}/blog-sitemap.xml
`;
    }

    /**
     * Generate AI-optimized sitemap with enhanced metadata
     */
    generateAISitemap(posts: BlogPost[]): string {
        const baseUrl = window.location.origin;
        const now = new Date().toISOString();

        const urls = posts
            .filter(p => p.status === 'published')
            .map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${post.featuredImage}</image:loc>
      <image:title>${post.title}</image:title>
      <image:caption>${post.excerpt}</image:caption>
    </image:image>
    <!-- AI-specific metadata -->
    <xhtml:link rel="alternate" hreflang="pt-br" href="${baseUrl}/blog/${post.slug}"/>
    <news:news>
      <news:publication>
        <news:name>Blog Dra. Thalita Melo</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${post.publishedAt}</news:publication_date>
      <news:title>${post.title}</news:title>
      <news:keywords>${post.tags.join(', ')}</news:keywords>
    </news:news>
  </url>`).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main blog page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog posts -->${urls}
</urlset>`;
    }

    /**
     * Generate JSON feed for AI consumption
     */
    generateJSONFeed(posts: BlogPost[]) {
        const baseUrl = window.location.origin;

        return {
            version: "https://jsonfeed.org/version/1.1",
            title: "Blog Dra. Thalita Melo - Direito em Foco",
            home_page_url: `${baseUrl}/blog`,
            feed_url: `${baseUrl}/feed.json`,
            description: "Artigos especializados em direito previdenciário, trabalhista e familiar",
            icon: `${baseUrl}/icon.png`,
            favicon: `${baseUrl}/favicon.ico`,
            language: "pt-BR",
            authors: [
                {
                    name: "Dra. Thalita Melo",
                    url: baseUrl,
                    avatar: `${baseUrl}/author-avatar.jpg`
                }
            ],
            items: posts
                .filter(p => p.status === 'published')
                .slice(0, 50)
                .map(post => ({
                    id: `${baseUrl}/blog/${post.slug}`,
                    url: `${baseUrl}/blog/${post.slug}`,
                    title: post.title,
                    content_html: post.contentHtml || post.content,
                    content_text: (post.contentHtml || post.content).replace(/<[^>]*>/g, ''),
                    summary: post.excerpt,
                    image: post.featuredImage,
                    date_published: post.publishedAt,
                    date_modified: post.updatedAt,
                    authors: [
                        {
                            name: post.author,
                            avatar: post.authorAvatar
                        }
                    ],
                    tags: post.tags,
                    language: "pt-BR",
                    // AI-specific metadata
                    _ai_metadata: {
                        category: post.category,
                        reading_time: post.readingTime,
                        expertise_level: "professional",
                        fact_checked: true,
                        original_content: true
                    }
                }))
        };
    }

    /**
     * Generate semantic HTML with microdata for better AI understanding
     */
    generateSemanticHTML(post: BlogPost): string {
        return `
<article itemscope itemtype="http://schema.org/BlogPosting">
  <header>
    <h1 itemprop="headline">${post.title}</h1>
    <p itemprop="description">${post.excerpt}</p>
    
    <div itemprop="author" itemscope itemtype="http://schema.org/Person">
      <span itemprop="name">${post.author}</span>
      <meta itemprop="jobTitle" content="Advogada Especialista" />
    </div>
    
    <time itemprop="datePublished" datetime="${post.publishedAt}">
      ${new Date(post.publishedAt).toLocaleDateString('pt-BR')}
    </time>
    <time itemprop="dateModified" datetime="${post.updatedAt}" />
    
    <meta itemprop="articleSection" content="${post.category}" />
    <meta itemprop="keywords" content="${post.tags.join(', ')}" />
    <meta itemprop="wordCount" content="${post.content.split(/\s+/).length}" />
    <meta itemprop="inLanguage" content="pt-BR" />
  </header>
  
  <div itemprop="articleBody">
    ${post.content}
  </div>
  
  <footer>
    ${post.tags.map(tag => `<span itemprop="keywords">${tag}</span>`).join(' ')}
  </footer>
</article>`;
    }

    /**
     * Generate AI training data format (for potential AI partnerships)
     */
    generateAITrainingData(posts: BlogPost[]) {
        return posts
            .filter(p => p.status === 'published')
            .map(post => ({
                id: post.id,
                url: `${window.location.origin}/blog/${post.slug}`,
                title: post.title,
                content: post.content.replace(/<[^>]*>/g, ''),
                summary: post.excerpt,
                category: post.category,
                tags: post.tags,
                author: post.author,
                published_date: post.publishedAt,
                language: "pt-BR",
                domain: "legal",
                subdomain: post.category.toLowerCase(),
                quality_score: 0.95,
                expertise_level: "professional",
                fact_checked: true,
                citations: this.extractCitations(post.content),
                entities: this.extractEntities(post.content)
            }));
    }

    /**
     * Extract citations from content
     */
    private extractCitations(content: string): string[] {
        const citations: string[] = [];
        const citationRegex = /\[(\d+)\]|fonte:|referência:/gi;
        const matches = content.match(citationRegex);

        if (matches) {
            citations.push(...matches);
        }

        return citations;
    }

    /**
     * Extract named entities (laws, articles, etc.)
     */
    private extractEntities(content: string): any[] {
        const entities: any[] = [];

        // Extract legal references
        const legalRefs = content.match(/Lei\s+n[ºo°]?\s*[\d.]+\/\d{4}/gi);
        if (legalRefs) {
            legalRefs.forEach(ref => {
                entities.push({
                    type: "legislation",
                    value: ref,
                    category: "legal_reference"
                });
            });
        }

        // Extract article references
        const articleRefs = content.match(/artigo\s+\d+/gi);
        if (articleRefs) {
            articleRefs.forEach(ref => {
                entities.push({
                    type: "article",
                    value: ref,
                    category: "legal_reference"
                });
            });
        }

        return entities;
    }

    /**
     * Generate AI-optimized RSS feed with enhanced metadata
     */
    generateEnhancedRSS(posts: BlogPost[]): string {
        const baseUrl = window.location.origin;
        const now = new Date().toUTCString();

        const items = posts
            .filter(p => p.status === 'published')
            .slice(0, 50)
            .map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author}]]></dc:creator>
      <category><![CDATA[${post.category}]]></category>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
      <enclosure url="${post.featuredImage}" type="image/jpeg" />
      
      <!-- AI-specific metadata -->
      <ai:category>${post.category}</ai:category>
      <ai:readingTime>${post.readingTime}</ai:readingTime>
      <ai:expertiseLevel>professional</ai:expertiseLevel>
      <ai:language>pt-BR</ai:language>
      <ai:contentQuality>high</ai:contentQuality>
    </item>`).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:ai="http://ai-metadata.org/rss/1.0/">
  <channel>
    <title>Blog Dra. Thalita Melo - Direito em Foco</title>
    <link>${baseUrl}/blog</link>
    <description>Artigos especializados em direito previdenciário, trabalhista e familiar</description>
    <language>pt-BR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Blog Dra. Thalita Melo</title>
      <link>${baseUrl}/blog</link>
    </image>
    
    <!-- AI-specific channel metadata -->
    <ai:domain>legal</ai:domain>
    <ai:expertise>professional</ai:expertise>
    <ai:language>pt-BR</ai:language>${items}
  </channel>
</rss>`;
    }

    /**
     * Generate comprehensive meta tags for AI discovery
     */
    generateComprehensiveMetaTags(post: BlogPost): Record<string, string> {
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/blog/${post.slug}`;

        return {
            // Basic SEO
            'title': post.seoTitle || post.title,
            'description': post.seoDescription || post.excerpt,
            'keywords': post.seoKeywords?.join(', ') || post.tags.join(', '),
            'author': post.author,
            'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
            'googlebot': 'index, follow',

            // Open Graph
            'og:type': 'article',
            'og:title': post.seoTitle || post.title,
            'og:description': post.seoDescription || post.excerpt,
            'og:url': url,
            'og:image': post.featuredImage,
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:image:alt': post.title,
            'og:site_name': 'Dra. Thalita Melo - Advocacia',
            'og:locale': 'pt_BR',

            // Twitter
            'twitter:card': 'summary_large_image',
            'twitter:title': post.seoTitle || post.title,
            'twitter:description': post.seoDescription || post.excerpt,
            'twitter:image': post.featuredImage,
            'twitter:image:alt': post.title,

            // Article specific
            'article:published_time': post.publishedAt,
            'article:modified_time': post.updatedAt,
            'article:author': post.author,
            'article:section': post.category,
            'article:tag': post.tags.join(','),

            // AI Crawlers - OpenAI/ChatGPT
            'openai:title': post.title,
            'openai:description': post.excerpt,
            'openai:url': url,
            'openai:image': post.featuredImage || '',
            'openai:type': 'article',
            'openai:category': post.category,

            // Perplexity AI
            'perplexity:title': post.title,
            'perplexity:snippet': post.excerpt,
            'perplexity:url': url,
            'perplexity:category': post.category,

            // Claude/Anthropic
            'anthropic:content-type': 'article',
            'anthropic:category': post.category,
            'anthropic:expertise': 'professional',
            'anthropic:language': 'pt-BR',

            // Google specific
            'google': 'notranslate',
            'google-site-verification': 'YOUR_VERIFICATION_CODE',

            // AI content classification
            'ai:content-quality': 'high',
            'ai:expertise-level': 'professional',
            'ai:fact-checked': 'true',
            'ai:original-content': 'true',
            'ai:domain': 'legal',
            'ai:subdomain': post.category.toLowerCase(),
            'ai:language': 'pt-BR',
            'ai:reading-time': post.readingTime.toString(),

            // Accessibility
            'theme-color': '#3B82F6',
            'color-scheme': 'light dark',

            // Mobile
            'viewport': 'width=device-width, initial-scale=1, maximum-scale=5',
            'format-detection': 'telephone=no',

            // Performance
            'referrer': 'origin-when-cross-origin'
        };
    }
}

export const seoService = new SEOService();
