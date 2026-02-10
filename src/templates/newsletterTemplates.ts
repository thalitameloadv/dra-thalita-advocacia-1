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
  }
