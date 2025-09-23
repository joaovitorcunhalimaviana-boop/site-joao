'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundPattern from '../../components/ui/background-pattern';
import { BrazilianDateInput } from '../../components/ui/brazilian-date-input';
import { BrazilianDatePicker } from '../../components/ui/brazilian-date-picker';
import { TimePicker } from '../../components/ui/time-picker';
import { InteractiveCalendar } from '../../components/ui/interactive-calendar';
import { isoDateToBrazilianDisplay, getTodayISO } from '../../lib/date-utils';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthDate: string;
  insurance: {
    type: 'particular' | 'unimed' | 'outro';
    plan?: string;
  };
  createdAt: string;
}

interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida';
  notes?: string;
}

export default function AreaSecretaria() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'patients' | 'schedule'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [_selectedPatient, _setSelectedPatient] = useState<Patient | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    return getTodayISO();
  });
  const [showMenu, setShowMenu] = useState(false);

  // Formulário de novo paciente
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
    cpf: '',
    insurance: {
      type: 'particular'
    }
  });

  // Formulário de agendamento
  const [newConsultation, setNewConsultation] = useState({
    patientId: '',
    date: '',
    time: '',
    type: 'consulta',
    notes: ''
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    // Sistema simplificado - sem verificações complexas de autenticação
    const userData = localStorage.getItem('currentUser')
    
    if (userData) {
      const user = JSON.parse(userData)
      console.log('Usuário logado:', user.username)
    }
  }

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Filtrar consultas válidas (apenas agendadas e confirmadas - excluir canceladas e concluídas)
  const validConsultations = consultations.filter(consultation => {
    return consultation.status === 'agendada' || consultation.status === 'confirmada'
  });

  const syncDataFromBackup = async () => {
    try {
      console.log('🔄 Sincronizando dados do backup...');
      const response = await fetch('/api/backup-patients');
      
      if (response.ok) {
        const data = await response.json();
        if (data.patients && data.patients.length > 0) {
          console.log(`✅ Encontrados ${data.patients.length} pacientes no backup`);
          
          // Verificar se há dados no localStorage
          const localData = localStorage.getItem('unified-patients');
          if (!localData || JSON.parse(localData).length === 0) {
            console.log('🔄 Restaurando dados do backup para localStorage');
            localStorage.setItem('unified-patients', JSON.stringify(data.patients));
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao sincronizar backup:', error);
    }
  };

  const loadData = async () => {
    try {
      console.log('Carregando dados da área da secretária...');
      
      // Primeiro, tentar sincronizar dados do backup
      await syncDataFromBackup();
      
      // Carregar pacientes
      const patientsResponse = await fetch('/api/unified-appointments?action=all-patients');
      if (patientsResponse.ok) {
        const patientsResult = await patientsResponse.json();
        if (patientsResult.success) {
          console.log('Pacientes carregados:', patientsResult.patients);
          setPatients(patientsResult.patients || []);
        } else {
          console.error('Erro ao carregar pacientes:', patientsResult.error);
        }
      } else {
        console.error('Erro na requisição de pacientes:', patientsResponse.status);
      }
      
      // Carregar todos os agendamentos
      const appointmentsResponse = await fetch('/api/unified-appointments?action=all-appointments');
      if (appointmentsResponse.ok) {
        const appointmentsResult = await appointmentsResponse.json();
        if (appointmentsResult.success && appointmentsResult.appointments) {
          // Converter agendamentos para consultas
          const appointmentsAsConsultations = (appointmentsResult.appointments || []).map((appointment: any) => ({
            id: appointment.id,
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
            type: appointment.appointmentType,
            status: appointment.status === 'agendada' ? 'agendada' : 
                   appointment.status === 'confirmada' ? 'confirmada' :
                   appointment.status === 'concluida' ? 'concluida' : 'cancelada',
            notes: appointment.notes
          }));
          setConsultations(appointmentsAsConsultations);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setPatients([]);
      setConsultations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConsultation = async (consultationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar e excluir este agendamento?')) {
      return;
    }

    try {
      const response = await fetch('/api/unified-appointments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-appointment',
          appointmentId: consultationId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remover completamente a consulta da lista
          setConsultations(prev => 
            prev.filter(consultation => consultation.id !== consultationId)
          );
          alert('Agendamento cancelado e excluído com sucesso!');
        } else {
          alert('Erro ao cancelar agendamento: ' + result.error);
        }
      } else {
        alert('Erro ao cancelar agendamento');
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento');
    }
  };



  const handleEditConsultation = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setNewConsultation({
      patientId: consultation.patientId,
      date: consultation.date,
      time: consultation.time,
      type: consultation.type,
      notes: consultation.notes || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsultation) return;

    try {
      const patient = patients.find(p => p.id === newConsultation.patientId);
      if (!patient) {
        alert('Paciente não encontrado');
        return;
      }

      const response = await fetch('/api/unified-appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-appointment',
          appointmentId: editingConsultation.id,
          appointmentDate: newConsultation.date,
          appointmentTime: newConsultation.time,
          appointmentType: newConsultation.type,
          notes: newConsultation.notes
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Atualizar a lista de consultas
          setConsultations(prev => 
            prev.map(consultation => 
              consultation.id === editingConsultation.id 
                ? {
                    ...consultation,
                    date: newConsultation.date,
                    time: newConsultation.time,
                    type: newConsultation.type,
                    notes: newConsultation.notes
                  }
                : consultation
            )
          );
          setShowEditForm(false);
          setEditingConsultation(null);
          setNewConsultation({ patientId: '', date: '', time: '', type: 'consulta', notes: '' });
          alert('Agendamento atualizado com sucesso!');
        } else {
          alert('Erro ao atualizar agendamento: ' + result.error);
        }
      } else {
        alert('Erro ao atualizar agendamento');
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      alert('Erro ao atualizar agendamento');
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/unified-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_patient',
          patientData: {
            ...newPatient,
            source: 'secretary_area'
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resultado da criação do paciente:', result);
        if (result.success && result.patient) {
          // Atualizar lista local
          setPatients(prevPatients => [...prevPatients, result.patient]);
          
          // Recarregar dados para garantir sincronização
          await loadData();
          
          console.log('Paciente criado com sucesso:', result.patient);
        }
        setNewPatient({
          name: '',
          email: '',
          phone: '',
          whatsapp: '',
          birthDate: '',
          cpf: '',
          insurance: {
            type: 'particular'
          }
        });
        setShowNewPatientForm(false);
        alert('Paciente cadastrado com sucesso!');
      } else {
        const error = await response.json();
        console.error('Erro ao cadastrar paciente:', error);
        alert(error.error || 'Erro ao cadastrar paciente');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cadastrar paciente');
    }
  };

  const handleScheduleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find(p => p.id === newConsultation.patientId);
      if (!patient) {
        alert('Paciente não encontrado');
        return;
      }

      const appointmentData = {
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientWhatsapp: patient.whatsapp,
        patientEmail: patient.email,
        patientBirthDate: patient.birthDate,
        insuranceType: patient.insurance.type,
        insurancePlan: patient.insurance.plan,
        appointmentDate: newConsultation.date,
        appointmentTime: newConsultation.time,
        appointmentType: newConsultation.type,
        status: 'agendada',
        source: 'secretary_area',
        notes: newConsultation.notes,
        createdBy: 'secretary'
      };

      const response = await fetch('/api/unified-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-appointment',
          ...appointmentData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.appointment) {
          // Converter agendamento para consulta para exibição
          const consultation = {
            id: result.appointment.id,
            patientId: result.appointment.patientId,
            patientName: result.appointment.patientName,
            date: result.appointment.appointmentDate,
            time: result.appointment.appointmentTime,
            type: result.appointment.appointmentType,
            status: result.appointment.status,
            notes: result.appointment.notes
          };
          setConsultations([...consultations, consultation]);
        }
        setNewConsultation({
          patientId: '',
          date: '',
          time: '',
          type: 'consulta',
          notes: ''
        });
        setShowScheduleForm(false);
        alert('Consulta agendada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao agendar consulta');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao agendar consulta');
    }
  };

  // Filtrar pacientes únicos por ID para evitar duplicatas
  const uniquePatients = (patients || []).reduce((acc: Patient[], patient) => {
    if (patient && patient.id && !acc.find(p => p.id === patient.id)) {
      acc.push(patient);
    }
    return acc;
  }, []);

  const filteredPatients = uniquePatients.filter(patient =>
    patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient?.phone?.includes(searchTerm)
  );

  // Consultas de hoje (todas as consultas do dia atual)
  const todayConsultations = (consultations || []).filter(consultation => {
    const today = getTodayISO();
    return consultation?.date === today;
  });

  // Consultas agendadas de hoje
  const todayScheduledConsultations = todayConsultations.filter(consultation => 
    consultation.status === 'agendada' || consultation.status === 'confirmada'
  );

  // Consultas concluídas de hoje
  const todayCompletedConsultations = todayConsultations.filter(consultation => 
    consultation.status === 'concluida'
  );

  // Consultas da data selecionada
  const selectedDateConsultations = (validConsultations || []).filter(consultation => {
    return consultation?.date === selectedDate;
  }).sort((a, b) => {
    return a.time.localeCompare(b.time);
  });





  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando área da secretária...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <BackgroundPattern />
      <div className="relative isolate">
        
        {/* Header */}
        <div className="pt-20 pb-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Área da Secretária</h1>
                  <p className="text-gray-300 text-lg mt-2">Gestão de Pacientes e Agendamentos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative">
                {/* Menu Hambúrguer */}
                 <div className="relative menu-container">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white hover:bg-gray-900/50 rounded-xl transition-all duration-200 border border-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => { router.push('/'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Página Inicial
                        </button>
                        <button
                          onClick={() => { router.push('/especialidades'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Especialidades
                        </button>
                        
                        {/* Submenu de Condições Médicas */}
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Condições Tratadas</p>
                          <button
                            onClick={() => { router.push('/hemorroidas'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Hemorroidas
                          </button>
                          <button
                            onClick={() => { router.push('/fistula-anal'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Fístula Anal
                          </button>
                          <button
                            onClick={() => { router.push('/fissura-anal'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Fissura Anal
                          </button>
                          <button
                            onClick={() => { router.push('/plicoma'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Plicoma
                          </button>
                          <button
                            onClick={() => { router.push('/cisto-pilonidal'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Cisto Pilonidal
                          </button>
                          <button
                            onClick={() => { router.push('/cancer-colorretal'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Câncer Colorretal
                          </button>
                          <button
                            onClick={() => { router.push('/constipacao-intestinal'); setShowMenu(false); }}
                            className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded"
                          >
                            — Constipação Intestinal
                          </button>
                        </div>
                        <button
                          onClick={() => { router.push('/agendamento'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Marque sua Consulta
                        </button>
                        <button
                          onClick={() => { router.push('/teleconsulta'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Teleconsulta
                        </button>
                        <button
                          onClick={() => { router.push('/urgencias'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Urgências
                        </button>
                        <button
                          onClick={() => { router.push('/visitas-domiciliares'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Visitas Domiciliares
                        </button>
                        <button
                          onClick={() => { router.push('/avaliacoes'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Avaliações
                        </button>
                        <button
                          onClick={() => { router.push('/contato'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          Contato
                        </button>
                        <div className="border-t border-gray-700 my-2"></div>
                        <button
                          onClick={() => { router.push('/login-medico'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-3"
                        >
                          🔐 Login Médico
                        </button>
                        <button
                          onClick={() => { router.push('/login-secretaria'); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-3"
                        >
                          🔐 Login Secretária
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Estatísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-300 text-sm font-medium">Total de Pacientes</p>
                <p className="text-3xl font-bold text-white mt-1">{patients.length}</p>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-300 text-sm font-medium">Consultas Hoje</p>
                <p className="text-3xl font-bold text-white mt-1">{todayConsultations.length}</p>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-300 text-sm font-medium">Agendadas Hoje</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {todayScheduledConsultations.length}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-300 text-sm font-medium">Concluídas Hoje</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {todayCompletedConsultations.length}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 ${
                  activeTab === 'patients'
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                Pacientes ({patients.length})
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                Agendamentos ({validConsultations.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'patients' && (
              <div>
                {/* Controles de Pacientes */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Buscar paciente por nome, telefone ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewPatientForm(true)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-blue-500"
                  >
                    + Novo Paciente
                  </button>
                </div>

                {/* Lista de Pacientes */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Telefone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          WhatsApp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Convênio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{patient.name}</div>
                              <div className="text-sm text-gray-300">{patient.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {patient.whatsapp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {patient.insurance.type === 'particular' ? 'Particular' : 
                             patient.insurance.type === 'unimed' ? 'UNIMED' : 
                             patient.insurance.plan || patient.insurance.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => router.push(`/prontuario/${patient.id}`)}
                              className="text-blue-400 hover:text-blue-300 mr-3">
                              Ver Prontuário
                            </button>
                            <button
                              onClick={() => {
                                _setSelectedPatient(patient);
                                setNewConsultation(prev => ({ ...prev, patientId: patient.id }));
                                setShowScheduleForm(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 mr-3"
                            >
                              Agendar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                {/* Seletor de Data */}
                <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Agenda do Dia</h3>
                      <p className="text-sm text-gray-300">Selecione a data para visualizar os agendamentos</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-300">Data:</label>
                      <BrazilianDatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="DD/MM/AAAA"
                      />
                    </div>
                  </div>
                </div>

                {/* Controles de Agendamento */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-white">Agendamentos</h3>
                  <button
                    onClick={() => setShowScheduleForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-blue-500"
                  >
                    + Nova Consulta
                  </button>
                </div>

                {/* Lista de Consultas da Data Selecionada */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Consultas do Dia Selecionado</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                      {selectedDateConsultations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                            Nenhuma consulta agendada para esta data
                          </td>
                        </tr>
                      ) : (
                        selectedDateConsultations.map((consultation) => (
                          <tr key={consultation.id} className="hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {consultation.patientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {isoDateToBrazilianDisplay(consultation.date)} às {consultation.time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {consultation.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                consultation.status === 'agendada' ? 'bg-yellow-100 text-yellow-800' :
                                consultation.status === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                                consultation.status === 'concluida' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {consultation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditConsultation(consultation)}
                                className="text-blue-400 hover:text-blue-300 mr-3"
                                disabled={consultation.status === 'cancelada'}
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => handleCancelConsultation(consultation.id)}
                                className="text-blue-400 hover:text-blue-300"
                                disabled={consultation.status === 'cancelada'}
                              >
                                Cancelar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Novo Paciente */}
      {showNewPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Cadastrar Novo Paciente</h2>
                <button
                  onClick={() => setShowNewPatientForm(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatient.cpf}
                      onChange={(e) => {
                        const formatted = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{3})(\d)/, '$1.$2')
                          .replace(/(\d{3})(\d)/, '$1.$2')
                          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                          .slice(0, 14);
                        setNewPatient({ ...newPatient, cpf: formatted });
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Data de Nascimento *
                    </label>
                    <BrazilianDateInput
                      required
                      value={newPatient.birthDate}
                      onChange={(value) => setNewPatient({ ...newPatient, birthDate: value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="dd/mm/aaaa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Convênio *
                    </label>
                    <select
                      required
                      value={newPatient.insurance.type}
                      onChange={(e) => setNewPatient({ ...newPatient, insurance: { type: e.target.value as 'particular' | 'unimed' | 'outro' } })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="particular">Particular</option>
                      <option value="unimed">Unimed</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Número de WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPatient.whatsapp}
                      onChange={(e) => setNewPatient({ ...newPatient, whatsapp: formatPhone(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Número de Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: formatPhone(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="exemplo@email.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPatientForm(false)}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Cadastrar Paciente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agendar Consulta */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Agendar Consulta</h2>
                </div>
                <button
                  onClick={() => {
                    setShowScheduleForm(false);
                    _setSelectedPatient(null);
                    setNewConsultation({
                      patientId: '',
                      date: '',
                      time: '',
                      type: 'consulta',
                      notes: ''
                    });
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleScheduleConsultation} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Paciente *
                  </label>
                  <select
                    required
                    value={newConsultation.patientId}
                    onChange={(e) => setNewConsultation({ ...newConsultation, patientId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                  >
                    <option value="" className="bg-gray-700 text-white">Selecione o paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id} className="bg-gray-700 text-white">
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data *
                  </label>
                  <BrazilianDateInput
                    required
                    value={newConsultation.date}
                    onChange={(value) => setNewConsultation({ ...newConsultation, date: value })}
                    min={getTodayISO()}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horário *
                  </label>
                  <TimePicker
                    value={newConsultation.time}
                    onChange={(time) => setNewConsultation({ ...newConsultation, time })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                    placeholder="HH:MM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Consulta *
                  </label>
                  <select
                    required
                    value={newConsultation.type}
                    onChange={(e) => setNewConsultation({ ...newConsultation, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                  >
                    <option value="consulta" className="bg-gray-700 text-white">Consulta</option>
                    <option value="retorno" className="bg-gray-700 text-white">Retorno</option>
                    <option value="urgencia" className="bg-gray-700 text-white">Urgência</option>
                    <option value="teleconsulta" className="bg-gray-700 text-white">Teleconsulta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={newConsultation.notes}
                    onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                    rows={3}
                    placeholder="Observações sobre a consulta..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      _setSelectedPatient(null);
                      setNewConsultation({
                        patientId: '',
                        date: '',
                        time: '',
                        type: 'consulta',
                        notes: ''
                      });
                    }}
                    className="px-6 py-3 text-gray-300 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-blue-500/25"
                  >
                    Agendar Consulta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Consulta */}
      {showEditForm && editingConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Editar Consulta</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingConsultation(null);
                    setNewConsultation({
                      patientId: '',
                      date: '',
                      time: '',
                      type: 'consulta',
                      notes: ''
                    });
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateConsultation} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Paciente *
                  </label>
                  <select
                    required
                    value={newConsultation.patientId}
                    onChange={(e) => setNewConsultation({ ...newConsultation, patientId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 transition-all"
                  >
                    <option value="" className="bg-gray-700 text-white">Selecione o paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id} className="bg-gray-700 text-white">
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data *
                  </label>
                  <BrazilianDateInput
                    required
                    value={newConsultation.date}
                    onChange={(value) => setNewConsultation({ ...newConsultation, date: value })}
                    min={getTodayISO()}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horário *
                  </label>
                  <TimePicker
                    value={newConsultation.time}
                    onChange={(time) => setNewConsultation({ ...newConsultation, time })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                    placeholder="HH:MM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Consulta *
                  </label>
                  <select
                    required
                    value={newConsultation.type}
                    onChange={(e) => setNewConsultation({ ...newConsultation, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white transition-all"
                  >
                    <option value="consulta" className="bg-gray-700 text-white">Consulta</option>
                    <option value="retorno" className="bg-gray-700 text-white">Retorno</option>
                    <option value="urgencia" className="bg-gray-700 text-white">Urgência</option>
                    <option value="teleconsulta" className="bg-gray-700 text-white">Teleconsulta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={newConsultation.notes}
                    onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                    rows={3}
                    placeholder="Observações sobre a consulta..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingConsultation(null);
                      setNewConsultation({
                        patientId: '',
                        date: '',
                        time: '',
                        type: 'consulta',
                        notes: ''
                      });
                    }}
                    className="px-6 py-3 text-gray-300 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg hover:shadow-green-500/25"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Calendar */}
      <div className="mt-8">
        <InteractiveCalendar
          onDateSelect={(date) => {
            console.log('Data selecionada:', date);
            // Aqui você pode adicionar lógica adicional se necessário
          }}
          selectedDate={selectedDate}
          appointments={consultations.map(consultation => ({
            id: consultation.id,
            patientName: consultation.patientName,
            status: consultation.status,
            time: consultation.time,
            date: consultation.date
          }))}
        />
      </div>
      </div>
    </div>
  );
}