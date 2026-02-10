/**
 * 10 Professional Email Newsletter Templates
 * Using the site's color palette:
 * - Gold: hsl(45 87% 51%) - #D4A838 - Primary accent
 * - Navy: hsl(207 45% 15%) - #152A3D - Primary dark
 * - Slate: hsl(0 0% 37%) - #5E5E5E - Secondary
 * - Cream: hsl(0 0% 98%) - #FAFAFA - Background light
 * - White: hsl(0 0% 100%) - #FFFFFF - Pure white
 */

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
  previewImage?: string;
}

export const newsletterEmailTemplates: EmailTemplate[] = [
  {
    id: "elegant-header",
    name: "Cabeçalho Elegante",
    description: "Design clássico com header dourado e conteúdo em navy",
    subject: "Boletim Informativo - {{month}}",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background: linear-gradient(135deg, #D4A838 0%, #E5C76B 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; font-weight: 600; }
    .header .subtitle { color: #152A3D; font-size: 14px; margin-top: 10px; opacity: 0.8; }
    .content { padding: 40px 30px; background-color: #FFFFFF; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-bottom: 20px; }
    .content p { color: #5E5E5E; font-size: 16px; line-height: 1.7; margin-bottom: 20px; }
    .content strong { color: #152A3D; }
    .highlight-box { background-color: #FAFAFA; border-left: 4px solid #D4A838; padding: 20px; margin: 25px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #D4A838 0%, #E5C76B 100%); color: #152A3D; text-decoration: none; padding: 15px 35px; border-radius: 5px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #152A3D; color: #FFFFFF; padding: 30px; text-align: center; font-size: 13px; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dra. Thalita Advocacia</h1>
      <p class="subtitle">Excelência em Direito</p>
    </div>
    <div class="content">
      <h2>{{title}}</h2>
      <p>{{content}}</p>
      <div class="highlight-box">
        <strong>Dica Jurídica:</strong> {{tip}}
      </div>
      <p>{{additionalContent}}</p>
      <center>
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </center>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "minimal-clean",
    name: "Minimalista Clean",
    description: "Design minimalista com foco no conteúdo e toques dourados sutis",
    subject: "Atualizações Jurídicas - {{date}}",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background-color: #FFFFFF; padding: 50px 40px 30px; text-align: center; border-bottom: 3px solid #D4A838; }
    .header h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; margin: 0; font-weight: 500; letter-spacing: -0.5px; }
    .divider { width: 60px; height: 2px; background-color: #D4A838; margin: 20px auto; }
    .content { padding: 40px; background-color: #FFFFFF; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin-bottom: 25px; font-weight: 500; }
    .content p { color: #5E5E5E; font-size: 15px; line-height: 1.8; margin-bottom: 20px; }
    .content h3 { color: #152A3D; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-left: 3px solid #D4A838; padding-left: 15px; }
    .cta-button { display: inline-block; background-color: #152A3D; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 3px; font-weight: 500; margin: 25px 0; font-size: 14px; letter-spacing: 0.5px; }
    .footer { background-color: #FAFAFA; color: #5E5E5E; padding: 40px; text-align: center; font-size: 12px; border-top: 1px solid #E5E5E5; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dra. Thalita</h1>
      <div class="divider"></div>
      <p style="color: #5E5E5E; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Advocacia Especializada</p>
    </div>
    <div class="content">
      <h2>{{title}}</h2>
      <p>{{intro}}</p>
      <h3>{{section1Title}}</h3>
      <p>{{section1Content}}</p>
      <h3>{{section2Title}}</h3>
      <p>{{section2Content}}</p>
      <center>
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </center>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 15px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "professional-navy",
    name: "Profissional Navy",
    description: "Design corporativo com dominância do azul marinho e detalhes dourados",
    subject: "Informe Jurídico Corporativo",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #152A3D; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background-color: #152A3D; padding: 45px 40px; text-align: center; position: relative; }
    .header::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 3px; background-color: #D4A838; }
    .header h1 { color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; font-weight: 600; }
    .header .tagline { color: #D4A838; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-top: 12px; }
    .content { padding: 45px 40px; background-color: #FFFFFF; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #D4A838; }
    .content p { color: #5E5E5E; font-size: 15px; line-height: 1.75; margin-bottom: 20px; }
    .content strong { color: #152A3D; }
    .info-box { background-color: #FAFAFA; border: 1px solid #E5E5E5; padding: 25px; margin: 25px 0; border-radius: 5px; }
    .info-box h4 { color: #152A3D; margin-top: 0; font-size: 16px; margin-bottom: 12px; }
    .cta-button { display: inline-block; background-color: #D4A838; color: #152A3D; text-decoration: none; padding: 16px 40px; border-radius: 3px; font-weight: 600; margin: 25px 0; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
    .footer { background-color: #152A3D; color: #FFFFFF; padding: 35px; text-align: center; font-size: 13px; }
    .footer .gold-line { width: 50px; height: 2px; background-color: #D4A838; margin: 15px auto; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dra. Thalita Advocacia</h1>
      <p class="tagline">Excelência & Compromisso</p>
    </div>
    <div class="content">
      <h2>{{title}}</h2>
      <p>{{intro}}</p>
      <div class="info-box">
        <h4>📋 {{highlightTitle}}</h4>
        <p>{{highlightContent}}</p>
      </div>
      <p>{{mainContent}}</p>
      <center>
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </center>
    </div>
    <div class="footer">
      <div class="gold-line"></div>
      <p>{{footerText}}</p>
      <p style="margin-top: 15px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "modern-card",
    name: "Moderno Card",
    description: "Design moderno com cards e sombras elegantes",
    subject: "Novidades e Atualizações - {{month}}",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #152A3D 0%, #2A4055 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; }
    .header .subtitle { color: #D4A838; font-size: 13px; margin-top: 8px; }
    .main-card { background-color: #FFFFFF; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 4px 20px rgba(21, 42, 61, 0.08); }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin-bottom: 20px; }
    .content p { color: #5E5E5E; font-size: 15px; line-height: 1.7; margin-bottom: 18px; }
    .feature-grid { display: grid; gap: 15px; margin: 25px 0; }
    .feature-item { background-color: #FAFAFA; padding: 20px; border-radius: 8px; border-left: 4px solid #D4A838; }
    .feature-item h4 { color: #152A3D; margin: 0 0 8px 0; font-size: 15px; }
    .feature-item p { color: #5E5E5E; margin: 0; font-size: 13px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #D4A838 0%, #C49A2F 100%); color: #152A3D; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 4px 15px rgba(212, 168, 56, 0.3); }
    .footer { text-align: center; padding: 30px; color: #5E5E5E; font-size: 12px; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dra. Thalita</h1>
      <p class="subtitle">Advocacia</p>
    </div>
    <div class="main-card">
      <div class="content">
        <h2>{{title}}</h2>
        <p>{{intro}}</p>
        <div class="feature-grid">
          <div class="feature-item">
            <h4>📝 {{feature1Title}}</h4>
            <p>{{feature1Content}}</p>
          </div>
          <div class="feature-item">
            <h4>⚖️ {{feature2Title}}</h4>
            <p>{{feature2Content}}</p>
          </div>
          <div class="feature-item">
            <h4>📅 {{feature3Title}}</h4>
            <p>{{feature3Content}}</p>
          </div>
        </div>
        <center>
          <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
        </center>
      </div>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "sidebar-layout",
    name: "Layout com Sidebar",
    description: "Design com sidebar dourada e conteúdo principal em navy",
    subject: "Newsletter Jurídica Especial",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .wrapper { display: flex; flex-direction: row; }
    .sidebar { background: linear-gradient(180deg, #D4A838 0%, #C49A2F 100%); padding: 40px 25px; width: 180px; text-align: center; }
    .sidebar h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; margin: 0 0 30px 0; writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); letter-spacing: 3px; }
    .sidebar .nav-item { color: #152A3D; font-size: 11px; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; }
    .main-content { flex: 1; padding: 40px; }
    .main-content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #D4A838; }
    .main-content p { color: #5E5E5E; font-size: 14px; line-height: 1.8; margin-bottom: 18px; }
    .highlight { background-color: #FAFAFA; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .highlight strong { color: #D4A838; }
    .cta-button { display: inline-block; background-color: #152A3D; color: #FFFFFF; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: 500; margin: 15px 0; font-size: 13px; }
    .footer { background-color: #152A3D; color: #FFFFFF; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #D4A838; text-decoration: none; }
    @media (max-width: 480px) {
      .wrapper { flex-direction: column; }
      .sidebar { width: auto; padding: 30px; }
      .sidebar h1 { writing-mode: horizontal-tb; transform: none; margin-bottom: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="wrapper">
      <div class="sidebar">
        <h1>Dra. Thalita</h1>
        <div class="nav-item">Direito Civil</div>
        <div class="nav-item">Direito Trabalhista</div>
        <div class="nav-item">Direito Empresarial</div>
      </div>
      <div class="main-content">
        <h2>{{title}}</h2>
        <p>{{intro}}</p>
        <div class="highlight">
          <strong>💡 {{highlightTitle}}</strong><br><br>
          {{highlightContent}}
        </div>
        <p>{{mainContent}}</p>
        <center>
          <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
        </center>
      </div>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "hero-banner",
    name: "Hero Banner",
    description: "Design com banner hero dourado e conteúdo em cards",
    subject: "Informações Jurídicas Importantes",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .hero { background: linear-gradient(135deg, #D4A838 0%, #E8C96A 50%, #D4A838 100%); padding: 60px 40px; text-align: center; position: relative; overflow: hidden; }
    .hero::before { content: '⚖️'; position: absolute; top: 20px; right: 30px; font-size: 60px; opacity: 0.1; }
    .hero::after { content: '⚖️'; position: absolute; bottom: 20px; left: 30px; font-size: 60px; opacity: 0.1; }
    .hero h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; margin: 0; position: relative; z-index: 1; }
    .hero .subtitle { color: #152A3D; font-size: 14px; margin-top: 10px; opacity: 0.9; position: relative; z-index: 1; }
    .content { padding: 40px; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin-bottom: 20px; }
    .content p { color: #5E5E5E"; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
    .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
    .info-card { background-color: #FAFAFA; padding: 20px; border-radius: 8px; text-align: center; border-top: 3px solid #D4A838; }
    .info-card .icon { font-size: 28px; margin-bottom: 10px; }
    .info-card h4 { color: #152A3D; margin: 0 0 8px 0; font-size: 14px; }
    .info-card p { color: #5E5E5E; margin: 0; font-size: 12px; }
    .cta-section { background-color: #152A3D; padding: 35px 40px; text-align: center; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #D4A838 0%, #E8C96A 100%); color: #152A3D; text-decoration: none; padding: 16px 45px; border-radius: 5px; font-weight: 600; font-size: 14px; }
    .footer { background-color: #FAFAFA; padding: 30px; text-align: center; font-size: 12px; color: #5E5E5E; }
    .footer a { color: #D4A838; text-decoration: none; }
    @media (max-width: 480px) {
      .card-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>Dra. Thalita Advocacia</h1>
      <p class="subtitle">Seu Direito, Nossa Prioridade</p>
    </div>
    <div class="content">
      <h2>{{title}}</h2>
      <p>{{intro}}</p>
      <div class="card-grid">
        <div class="info-card">
          <div class="icon">📋</div>
          <h4>{{card1Title}}</h4>
          <p>{{card1Content}}</p>
        </div>
        <div class="info-card">
          <div class="icon">⚖️</div>
          <h4>{{card2Title}}</h4>
          <p>{{card2Content}}</p>
        </div>
      </div>
      <p>{{mainContent}}</p>
    </div>
    <div class="cta-section">
      <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "newsletter-list",
    name: "Lista de Notícias",
    description: "Design com lista de itens e numeração dourada",
    subject: "Resumo Semanal - {{week}}",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background-color: #152A3D; padding: 35px 40px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0; }
    .header .date { color: #D4A838; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 40px; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-bottom: 30px; }
    .news-item { display: flex; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #E5E5E5; }
    .news-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .news-number { background: linear-gradient(135deg, #D4A838 0%, #E8C96A 100%); color: #152A3D; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-right: 20px; flex-shrink: 0; }
    .news-content h3 { color: #152A3D; margin: 0 0 10px 0; font-size: 18px; font-family: 'Playfair Display', Georgia, serif; }
    .news-content p { color: #5E5E5E; margin: 0; font-size: 14px; line-height: 1.6; }
    .cta-box { background-color: #FAFAFA; padding: 30px; text-align: center; margin-top: 30px; border-radius: 8px; }
    .cta-button { display: inline-block; background-color: #D4A838; color: #152A3D; text-decoration: none; padding: 14px 35px; border-radius: 5px; font-weight: 600; font-size: 14px; }
    .footer { background-color: #152A3D; color: #FFFFFF; padding: 30px; text-align: center; font-size: 12px; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Boletim Jurídico</h1>
      <span class="date">{{currentDate}}</span>
    </div>
    <div class="content">
      <h2>{{title}}</h2>
      
      <div class="news-item">
        <div class="news-number">1</div>
        <div class="news-content">
          <h3>{{item1Title}}</h3>
          <p>{{item1Content}}</p>
        </div>
      </div>
      
      <div class="news-item">
        <div class="news-number">2</div>
        <div class="news-content">
          <h3>{{item2Title}}</h3>
          <p>{{item2Content}}</p>
        </div>
      </div>
      
      <div class="news-item">
        <div class="news-number">3</div>
        <div class="news-content">
          <h3>{{item3Title}}</h3>
          <p>{{item3Content}}</p>
        </div>
      </div>
      
      <div class="cta-box">
        <p style="color: #5E5E5E; margin-bottom: 20px;">{{ctaDescription}}</p>
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </div>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "two-column",
    name: "Duas Colunas",
    description: "Design com layout em duas colunas para conteúdo diversificado",
    subject: "Atualizações e Dicas Jurídicas",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background: linear-gradient(90deg, #152A3D 0%, #2A4055 100%); padding: 40px; text-align: center; }
    .header h1 { color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; }
    .header .tagline { color: #D4A838; font-size: 13px; margin-top: 8px; letter-spacing: 2px; }
    .two-col { display: flex; flex-direction: row; }
    .col-left { flex: 1; background-color: #FAFAFA; padding: 35px; }
    .col-right { flex: 1; background-color: #FFFFFF; padding: 35px; }
    .col-left h3, .col-right h3 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #D4A838; }
    .col-left p, .col-right p { color: #5E5E5E; font-size: 14px; line-height: 1.7; margin-bottom: 15px; }
    .tip-box { background-color: #152A3D; color: #FFFFFF; padding: 20px; border-radius: 5px; margin-top: 20px; }
    .tip-box strong { color: #D4A838; }
    .update-item { padding: 15px 0; border-bottom: 1px solid #E5E5E5; }
    .update-item:last-child { border-bottom: none; }
    .update-item h4 { color: #152A3D; margin: 0 0 5px 0; font-size: 14px; }
    .update-item p { color: #5E5E5E; margin: 0; font-size: 12px; }
    .cta-section { background-color: #D4A838; padding: 30px; text-align: center; }
    .cta-button { display: inline-block; background-color: #152A3D; color: #FFFFFF; text-decoration: none; padding: 14px 35px; border-radius: 5px; font-weight: 600; font-size: 14px; }
    .footer { background-color: #152A3D; color: #FFFFFF; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #D4A838; text-decoration: none; }
    @media (max-width: 480px) {
      .two-col { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dra. Thalita Advocacia</h1>
      <p class="tagline">EXCELÊNCIA JURÍDICA</p>
    </div>
    <div class="two-col">
      <div class="col-left">
        <h3>💡 Dica do Mês</h3>
        <p>{{tipIntro}}</p>
        <div class="tip-box">
          <strong>{{tipTitle}}</strong><br><br>
          {{tipContent}}
        </div>
        <p>{{tipAdditional}}</p>
      </div>
      <div class="col-right">
        <h3>📰 Atualizações</h3>
        <div class="update-item">
          <h4>{{update1Title}}</h4>
          <p>{{update1Content}}</p>
        </div>
        <div class="update-item">
          <h4>{{update2Title}}</h4>
          <p>{{update2Content}}</p>
        </div>
        <div class="update-item">
          <h4>{{update3Title}}</h4>
          <p>{{update3Content}}</p>
        </div>
      </div>
    </div>
    <div class="cta-section">
      <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "accent-border",
    name: "Borda de Destaque",
    description: "Design com bordas douradas em todo o conteúdo",
    subject: "Informe Jurídico Mensal",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border: 3px solid #D4A838; border-radius: 8px; overflow: hidden; }
    .header { background-color: #FFFFFF; padding: 35px; text-align: center; border-bottom: 2px solid #D4A838; }
    .header h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; }
    .header .subtitle { color: #D4A838; font-size: 12px; margin-top: 8px; letter-spacing: 3px; text-transform: uppercase; }
    .content { padding: 40px; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin-bottom: 25px; text-align: center; }
    .content p { color: #5E5E5E; font-size: 15px; line-height: 1.8; margin-bottom: 20px; }
    .border-box { border: 2px solid #D4A838; padding: 25px; margin: 25px 0; border-radius: 5px; }
    .border-box h3 { color: #152A3D; margin: 0 0 15px 0; font-size: 18px; font-family: 'Playfair Display', Georgia, serif; }
    .border-box p { color: #5E5E5E; margin: 0; font-size: 14px; }
    .cta-button { display: inline-block; background-color: #D4A838; color: #152A3D; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: 600; margin: 20px 0; border: 2px solid #D4A838; }
    .cta-button:hover { background-color: #152A3D; color: #D4A838; }
    .footer { background-color: #FAFAFA; padding: 30px; text-align: center; font-size: 12px; color: #5E5E5E; border-top: 2px solid #D4A838; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dra. Thalita Advocacia</h1>
      <p class="subtitle">Informe Jurídico</p>
    </div>
    <div class="content">
      <h2>{{title}}</h2>
      <p>{{intro}}</p>
      
      <div class="border-box">
        <h3>📋 {{section1Title}}</h3>
        <p>{{section1Content}}</p>
      </div>
      
      <p>{{middleContent}}</p>
      
      <div class="border-box">
        <h3>⚖️ {{section2Title}}</h3>
        <p>{{section2Content}}</p>
      </div>
      
      <center>
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </center>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "gradient-bg",
    name: "Fundo em Gradiente",
    description: "Design com fundo em gradiente e conteúdo em cards brancos",
    subject: "Newsletter Especial - {{topic}}",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background: linear-gradient(180deg, #152A3D 0%, #2A4055 50%, #152A3D 100%); min-height: 100vh; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .main-card { background-color: #FFFFFF; border-radius: 12px; padding: 50px 40px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
    .header { text-align: center; margin-bottom: 40px; }
    .header .logo { color: #D4A838; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .header h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; }
    .header .line { width: 80px; height: 3px; background: linear-gradient(90deg, #D4A838 0%, #E8C96A 100%); margin: 20px auto; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin-bottom: 25px; }
    .content p { color: #5E5E5E; font-size: 15px; line-height: 1.8; margin-bottom: 20px; }
    .feature-list { margin: 30px 0; }
    .feature-item { display: flex; align-items: flex-start; margin-bottom: 20px; }
    .feature-icon { color: #D4A838; font-size: 20px; margin-right: 15px; flex-shrink: 0; }
    .feature-text h4 { color: #152A3D; margin: 0 0 5px 0; font-size: 16px; }
    .feature-text p { color: #5E5E5E; margin: 0; font-size: 14px; }
    .cta-section { background: linear-gradient(90deg, #D4A838 0%, #E8C96A 100%); padding: 30px; margin: 40px -40px -50px -40px; border-radius: 0 0 12px 12px; text-align: center; }
    .cta-button { display: inline-block; background-color: #152A3D; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 5px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; padding: 30px; color: #FFFFFF; font-size: 12px; opacity: 0.8; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="main-card">
      <div class="header">
        <p class="logo">Dra. Thalita</p>
        <h1>{{title}}</h1>
        <div class="line"></div>
      </div>
      <div class="content">
        <p>{{intro}}</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-text">
              <h4>{{feature1Title}}</h4>
              <p>{{feature1Content}}</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-text">
              <h4>{{feature2Title}}</h4>
              <p>{{feature2Content}}</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-text">
              <h4>{{feature3Title}}</h4>
              <p>{{feature3Content}}</p>
            </div>
          </div>
        </div>
        
        <p>{{additionalContent}}</p>
      </div>
      <div class="cta-section">
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </div>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "announcement",
    name: "Comunicado Oficial",
    description: "Design formal para comunicados e anúncios importantes",
    subject: "Comunicado Importante - {{topic}}",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #FAFAFA; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .top-bar { background-color: #D4A838; height: 8px; }
    .header { padding: 40px 50px; background-color: #FFFFFF; }
    .header .badge { display: inline-block; background-color: #152A3D; color: #FFFFFF; padding: 8px 20px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
    .header h1 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; line-height: 1.3; }
    .divider { height: 1px; background-color: #E5E5E5; margin: 0 50px; }
    .content { padding: 40px 50px; }
    .content h2 { color: #152A3D; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; margin-bottom: 25px; }
    .content p { color: #5E5E5E; font-size: 15px; line-height: 1.8; margin-bottom: 20px; }
    .important-notice { background-color: #FAFAFA; border-left: 5px solid #D4A838; padding: 25px; margin: 30px 0; }
    .important-notice strong { color: #152A3D; font-size: 16px; display: block; margin-bottom: 10px; }
    .important-notice p { color: #5E5E5E; margin: 0; font-size: 14px; }
    .contact-info { background-color: #152A3D; color: #FFFFFF; padding: 30px; margin: 30px -50px -40px -50px; }
    .contact-info h4 { color: #D4A838; margin: 0 0 15px 0; font-size: 16px; }
    .contact-info p { color: #FFFFFF; margin: 5px 0; font-size: 14px; }
    .cta-button { display: inline-block; background-color: #D4A838; color: #152A3D; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: 600; margin: 10px 0; }
    .footer { background-color: #FAFAFA; padding: 30px 50px; text-align: center; font-size: 12px; color: #5E5E5E; border-top: 1px solid #E5E5E5; }
    .footer a { color: #D4A838; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-bar"></div>
    <div class="header">
      <span class="badge">Comunicado Oficial</span>
      <h1>{{title}}</h1>
    </div>
    <div class="divider"></div>
    <div class="content">
      <p>{{intro}}</p>
      
      <div class="important-notice">
        <strong>⚠️ {{noticeTitle}}</strong>
        <p>{{noticeContent}}</p>
      </div>
      
      <p>{{mainContent}}</p>
      
      <h2>{{detailsTitle}}</h2>
      <p>{{detailsContent}}</p>
      
      <center>
        <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
      </center>
      
      <div class="contact-info">
        <h4>Dúvidas? Entre em contato:</h4>
        <p>📧 {{contactEmail}}</p>
        <p>📞 {{contactPhone}}</p>
      </div>
    </div>
    <div class="footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px;"><a href="{{unsubscribeLink}}">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`
  }
];
