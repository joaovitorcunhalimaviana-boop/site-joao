/**
 * Templates de email otimizados para clientes de email (Gmail, Outlook, etc.)
 * Seguem as melhores práticas para compatibilidade máxima
 */

export interface EmailTemplateData {
  patientName?: string;
  content?: string;
  healthTip?: string;
  clinicNews?: string;
  unsubscribeUrl?: string;
}

/**
 * Template base para emails - compatível com Gmail, Outlook, Apple Mail, etc.
 */
function getBaseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Newsletter - Dr. João Vitor Viana</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Template específico para newsletter
 */
export function getNewsletterTemplate(data: EmailTemplateData): string {
  const {
    patientName = 'Paciente',
    content = '',
    healthTip = '',
    clinicNews = '',
    unsubscribeUrl = '#'
  } = data;

  const newsletterContent = `
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-decoration: none;"> Newsletter Semanal</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Dr. João Vitor Viana - Clínica Médica</p>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">Olá, ${patientName}!</h2>
        
        <p style="line-height: 1.6; margin: 0 0 20px 0; color: #374151; font-size: 16px;">Esperamos que você esteja bem! Esta semana preparamos algumas dicas importantes para sua saúde e bem-estar.</p>
        
        ${content ? `
        <div style="margin: 20px 0;">
          ${content}
        </div>
        ` : ''}
        
        ${healthTip ? `
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;"> Dica de Saúde da Semana</h3>
          <p style="color: #374151; margin: 0; line-height: 1.6; font-size: 15px;">${healthTip}</p>
        </div>
        ` : ''}
        
        ${clinicNews ? `
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;"> Novidades da Clínica</h3>
          <p style="color: #374151; margin: 0; line-height: 1.6; font-size: 15px;">${clinicNews}</p>
        </div>
        ` : ''}
      </td>
    </tr>
    
    <!-- Contact Section -->
    <tr>
      <td style="background-color: #1e3a8a; padding: 30px; border-radius: 0 0 8px 8px;">
        <h3 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; font-weight: bold; text-align: center;">Entre em Contato</h3>
        <p style="color: #e0e7ff; margin: 0 0 20px 0; text-align: center; font-size: 16px;">Fale conosco através dos nossos canais de atendimento</p>
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="50%" style="padding-right: 10px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-weight: bold; font-size: 16px;"> Telefone</p>
              <p style="color: #e0e7ff; margin: 0; font-size: 14px;">(83) 3225-1747</p>
            </td>
            <td width="50%" style="padding-left: 10px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-weight: bold; font-size: 16px;"> WhatsApp</p>
              <p style="color: #e0e7ff; margin: 0; font-size: 14px;">(83) 99999-9999</p>
            </td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #ffffff; margin: 0 0 10px 0; font-weight: bold; font-size: 16px;"> Endereço</p>
          <p style="color: #e0e7ff; margin: 0; font-size: 14px; line-height: 1.4;">Rua Exemplo, 123 - Centro<br>João Pessoa - PB, 58000-000</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #3b82f6;">
          <p style="color: #e0e7ff; margin: 0 0 10px 0; font-size: 12px;">Você está recebendo este email porque se inscreveu em nossa newsletter.</p>
          <a href="${unsubscribeUrl}" style="color: #93c5fd; text-decoration: underline; font-size: 12px;">Cancelar inscrição</a>
        </div>
      </td>
    </tr>
  `;

  return getBaseEmailTemplate(newsletterContent);
}
