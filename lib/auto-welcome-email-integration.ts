/**
 * Integração automática de e-mail de boas-vindas
 * Este serviço é chamado automaticamente sempre que um novo paciente é cadastrado
 * em qualquer ponto do sistema (newsletter, agendamento público, área médica, área da secretária)
 */

export interface WelcomeEmailData {
  name: string;
  email: string;
  source: 'newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review';
  additionalData?: {
    whatsapp?: string;
    birthDate?: string;
    patientId?: string;
  };
}

/**
 * Envia e-mail de boas-vindas automaticamente para novos pacientes
 * Esta função é chamada sempre que um novo contato de comunicação é criado
 */
export async function sendAutoWelcomeEmail(data: WelcomeEmailData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(` [AUTO-WELCOME] Iniciando envio para: ${data.name} (${data.email})`);
    console.log(` [AUTO-WELCOME] Origem: ${data.source}`);

    // Chamar API para enviar e-mail de boas-vindas
    const response = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        source: data.source,
        additionalData: data.additionalData
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log(` [AUTO-WELCOME] E-mail enviado com sucesso para: ${data.email}`);
      return {
        success: true,
        message: 'E-mail de boas-vindas enviado com sucesso'
      };
    } else {
      console.error(` [AUTO-WELCOME] Erro ao enviar para: ${data.email}`, result.error);
      return {
        success: false,
        message: result.error || 'Erro ao enviar e-mail de boas-vindas'
      };
    }
  } catch (error) {
    console.error(` [AUTO-WELCOME] Erro crítico ao enviar para: ${data.email}`, error);
    return {
      success: false,
      message: 'Erro interno ao processar e-mail de boas-vindas'
    };
  }
}

/**
 * Integra o envio automático de e-mail de boas-vindas no sistema de comunicação
 * Esta função deve ser chamada após a criação de um novo contato
 */
export function integrateWelcomeEmailInCommunicationSystem(
  contactData: {
    name: string;
    email?: string;
    source: 'newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review';
    whatsapp?: string;
    birthDate?: string;
    patientId?: string;
    emailPreferences?: {
      subscribed?: boolean;
    };
  }
): void {
  // Verificar se o contato tem e-mail e está inscrito para receber e-mails
  if (contactData.email && contactData.emailPreferences?.subscribed !== false) {
    // Enviar e-mail de boas-vindas de forma assíncrona (não bloqueia o processo principal)
    setTimeout(async () => {
      try {
        await sendAutoWelcomeEmail({
          name: contactData.name,
          email: contactData.email!,
          source: contactData.source,
          additionalData: {
            whatsapp: contactData.whatsapp,
            birthDate: contactData.birthDate,
            patientId: contactData.patientId
          }
        });
      } catch (error) {
        console.error('[AUTO-WELCOME] Erro ao processar e-mail de boas-vindas:', error);
      }
    }, 100); // Pequeno delay para não impactar a performance
  } else {
    console.log(`ℹ [AUTO-WELCOME] Pulando envio para ${contactData.name}: sem e-mail ou não inscrito`);
  }
}
