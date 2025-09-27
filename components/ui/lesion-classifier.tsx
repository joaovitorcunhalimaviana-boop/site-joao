'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Search, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Info,
  Microscope,
  Eye,
  Ruler,
  MapPin,
  Clock,
  BookOpen
} from 'lucide-react';
import { CLASSIFICATION_SYSTEMS } from '@/lib/colonoscopy-templates';

interface LesionData {
  size: string;
  location: string;
  morphology: string;
  surface: string;
  pit_pattern: string;
  vascular_pattern: string;
  description: string;
}

interface ClassificationResult {
  system: string;
  classification: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  recommendations?: string[];
}

interface LesionClassifierProps {
  onClassificationSelect?: (classification: string) => void;
  className?: string;
}

export default function LesionClassifier({ onClassificationSelect, className = '' }: LesionClassifierProps) {
  const [lesionData, setLesionData] = useState<LesionData>({
    size: '',
    location: '',
    morphology: '',
    surface: '',
    pit_pattern: '',
    vascular_pattern: '',
    description: ''
  });

  const [classifications, setClassifications] = useState<ClassificationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [quickSearch, setQuickSearch] = useState('');

  // Análise automática baseada nos dados inseridos
  const analyzeClassification = () => {
    setIsAnalyzing(true);
    
    // Simular análise (em uma implementação real, isso seria mais sofisticado)
    setTimeout(() => {
      const results: ClassificationResult[] = [];

      // Classificação Paris
      if (lesionData.morphology || lesionData.size) {
        let parisClass = '';
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        let reasoning = '';

        if (lesionData.morphology.toLowerCase().includes('séssil') || 
            lesionData.morphology.toLowerCase().includes('plano')) {
          if (lesionData.size && parseInt(lesionData.size) > 20) {
            parisClass = 'Is';
            reasoning = 'Lesão séssil > 2cm';
            confidence = 'high';
          } else {
            parisClass = 'IIa';
            reasoning = 'Lesão plana/levemente elevada';
            confidence = 'medium';
          }
        } else if (lesionData.morphology.toLowerCase().includes('pediculado')) {
          parisClass = 'Ip';
          reasoning = 'Lesão pediculada';
          confidence = 'high';
        } else if (lesionData.morphology.toLowerCase().includes('deprimido')) {
          parisClass = 'IIc';
          reasoning = 'Lesão deprimida';
          confidence = 'high';
        }

        if (parisClass) {
          results.push({
            system: 'Paris',
            classification: parisClass,
            description: CLASSIFICATION_SYSTEMS.paris[parisClass] || 'Classificação Paris',
            confidence,
            reasoning,
            recommendations: getParisRecommendations(parisClass)
          });
        }
      }

      // Classificação Kudo
      if (lesionData.pit_pattern) {
        let kudoClass = '';
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        let reasoning = '';

        const pitPattern = lesionData.pit_pattern.toLowerCase();
        if (pitPattern.includes('i') || pitPattern.includes('regular')) {
          kudoClass = 'I';
          reasoning = 'Padrão de criptas regular';
          confidence = 'high';
        } else if (pitPattern.includes('ii')) {
          kudoClass = 'II';
          reasoning = 'Padrão de criptas estrelado/papilífero';
          confidence = 'high';
        } else if (pitPattern.includes('iiil')) {
          kudoClass = 'IIIL';
          reasoning = 'Padrão tubular grande';
          confidence = 'medium';
        } else if (pitPattern.includes('iiis')) {
          kudoClass = 'IIIS';
          reasoning = 'Padrão tubular pequeno';
          confidence = 'medium';
        } else if (pitPattern.includes('iv')) {
          kudoClass = 'IV';
          reasoning = 'Padrão ramificado';
          confidence = 'high';
        } else if (pitPattern.includes('v')) {
          kudoClass = 'V';
          reasoning = 'Padrão irregular/amorfo';
          confidence = 'high';
        }

        if (kudoClass) {
          results.push({
            system: 'Kudo',
            classification: kudoClass,
            description: CLASSIFICATION_SYSTEMS.kudo[kudoClass] || 'Classificação Kudo',
            confidence,
            reasoning,
            recommendations: getKudoRecommendations(kudoClass)
          });
        }
      }

      // Classificação NICE
      if (lesionData.vascular_pattern || lesionData.surface) {
        let niceClass = '';
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        let reasoning = '';

        const surface = lesionData.surface.toLowerCase();
        const vascular = lesionData.vascular_pattern.toLowerCase();

        if (surface.includes('lisa') || vascular.includes('ausente')) {
          niceClass = '1';
          reasoning = 'Superfície lisa, padrão vascular ausente/tênue';
          confidence = 'high';
        } else if (surface.includes('granular') || vascular.includes('regular')) {
          niceClass = '2';
          reasoning = 'Superfície granular, padrão vascular regular';
          confidence = 'high';
        } else if (surface.includes('irregular') || vascular.includes('irregular')) {
          niceClass = '3';
          reasoning = 'Superfície irregular, padrão vascular irregular';
          confidence = 'high';
        }

        if (niceClass) {
          results.push({
            system: 'NICE',
            classification: niceClass,
            description: CLASSIFICATION_SYSTEMS.nice[niceClass] || 'Classificação NICE',
            confidence,
            reasoning,
            recommendations: getNiceRecommendations(niceClass)
          });
        }
      }

      // Classificação Haggitt (para pólipos pediculados)
      if (lesionData.morphology.toLowerCase().includes('pediculado') && lesionData.description) {
        let haggittClass = '';
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        let reasoning = '';

        const desc = lesionData.description.toLowerCase();
        if (desc.includes('cabeça') || desc.includes('topo')) {
          haggittClass = '1';
          reasoning = 'Invasão limitada à cabeça do pólipo';
          confidence = 'medium';
        } else if (desc.includes('pescoço') || desc.includes('colo')) {
          haggittClass = '2';
          reasoning = 'Invasão até o pescoço do pólipo';
          confidence = 'medium';
        } else if (desc.includes('pedículo')) {
          haggittClass = '3';
          reasoning = 'Invasão do pedículo';
          confidence = 'medium';
        } else if (desc.includes('base') || desc.includes('submucosa')) {
          haggittClass = '4';
          reasoning = 'Invasão da submucosa na base';
          confidence = 'high';
        }

        if (haggittClass) {
          results.push({
            system: 'Haggitt',
            classification: haggittClass,
            description: CLASSIFICATION_SYSTEMS.haggitt[haggittClass] || 'Classificação Haggitt',
            confidence,
            reasoning,
            recommendations: getHaggittRecommendations(haggittClass)
          });
        }
      }

      setClassifications(results);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Recomendações específicas por sistema
  const getParisRecommendations = (classification: string): string[] => {
    const recommendations: { [key: string]: string[] } = {
      'Ip': ['Polipectomia com alça', 'Avaliar pedículo', 'Histopatológico completo'],
      'Is': ['Mucosectomia endoscópica', 'Avaliar invasão submucosa', 'Seguimento rigoroso'],
      'IIa': ['Mucosectomia ou polipectomia', 'Avaliar tamanho', 'Considerar cromoendoscopia'],
      'IIb': ['Biópsia dirigida', 'Avaliar necessidade de ressecção', 'Seguimento próximo'],
      'IIc': ['Biópsia múltipla', 'Avaliar malignidade', 'Considerar ESD'],
      'III': ['Não ressecável endoscopicamente', 'Encaminhar para cirurgia', 'Estadiamento completo']
    };
    return recommendations[classification] || ['Avaliar individualmente'];
  };

  const getKudoRecommendations = (classification: string): string[] => {
    const recommendations: { [key: string]: string[] } = {
      'I': ['Provavelmente normal', 'Seguimento de rotina'],
      'II': ['Lesão benigna', 'Polipectomia se indicada'],
      'IIIL': ['Adenoma com displasia leve', 'Polipectomia recomendada'],
      'IIIS': ['Adenoma com displasia moderada', 'Ressecção completa'],
      'IV': ['Alto risco de malignidade', 'Ressecção ampla', 'Histopatológico urgente'],
      'V': ['Carcinoma invasivo', 'ESD ou cirurgia', 'Estadiamento completo']
    };
    return recommendations[classification] || ['Avaliar individualmente'];
  };

  const getNiceRecommendations = (classification: string): string[] => {
    const recommendations: { [key: string]: string[] } = {
      '1': ['Hiperplásico/normal', 'Seguimento de rotina'],
      '2': ['Adenoma', 'Polipectomia recomendada', 'Seguimento conforme guidelines'],
      '3': ['Suspeita de carcinoma', 'Ressecção especializada', 'Avaliação multidisciplinar']
    };
    return recommendations[classification] || ['Avaliar individualmente'];
  };

  const getHaggittRecommendations = (classification: string): string[] => {
    const recommendations: { [key: string]: string[] } = {
      '1': ['Polipectomia suficiente', 'Seguimento de rotina'],
      '2': ['Polipectomia suficiente', 'Seguimento próximo'],
      '3': ['Avaliar margens', 'Considerar ressecção adicional'],
      '4': ['Ressecção cirúrgica', 'Estadiamento linfonodal']
    };
    return recommendations[classification] || ['Avaliar individualmente'];
  };

  // Busca rápida nas classificações
  const filteredClassifications = Object.entries(CLASSIFICATION_SYSTEMS)
    .filter(([system]) => selectedSystem === 'all' || system === selectedSystem)
    .flatMap(([system, classifications]) =>
      Object.entries(classifications)
        .filter(([key, description]) =>
          quickSearch === '' ||
          key.toLowerCase().includes(quickSearch.toLowerCase()) ||
          description.toLowerCase().includes(quickSearch.toLowerCase())
        )
        .map(([key, description]) => ({ system, key, description }))
    );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Classificador Automático de Lesões
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Formulário de Dados da Lesão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Microscope className="h-4 w-4" />
            Dados da Lesão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                Tamanho (mm)
              </label>
              <Input
                value={lesionData.size}
                onChange={(e) => setLesionData(prev => ({ ...prev, size: e.target.value }))}
                placeholder="ex: 15"
                type="number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Localização
              </label>
              <Input
                value={lesionData.location}
                onChange={(e) => setLesionData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="ex: cólon ascendente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Morfologia</label>
              <select
                value={lesionData.morphology}
                onChange={(e) => setLesionData(prev => ({ ...prev, morphology: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione...</option>
                <option value="pediculado">Pediculado</option>
                <option value="séssil">Séssil</option>
                <option value="plano">Plano/Levemente elevado</option>
                <option value="deprimido">Deprimido</option>
                <option value="ulcerado">Ulcerado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Superfície</label>
              <select
                value={lesionData.surface}
                onChange={(e) => setLesionData(prev => ({ ...prev, surface: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione...</option>
                <option value="lisa">Lisa</option>
                <option value="granular">Granular</option>
                <option value="irregular">Irregular</option>
                <option value="nodular">Nodular</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Padrão de Criptas</label>
              <Input
                value={lesionData.pit_pattern}
                onChange={(e) => setLesionData(prev => ({ ...prev, pit_pattern: e.target.value }))}
                placeholder="ex: Kudo IIIL, irregular"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Padrão Vascular</label>
              <Input
                value={lesionData.vascular_pattern}
                onChange={(e) => setLesionData(prev => ({ ...prev, vascular_pattern: e.target.value }))}
                placeholder="ex: regular, irregular, ausente"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descrição Adicional</label>
            <Input
              value={lesionData.description}
              onChange={(e) => setLesionData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Outras características relevantes..."
            />
          </div>
          
          <Button
            onClick={analyzeClassification}
            disabled={isAnalyzing}
            className="w-full flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analisando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Classificar Automaticamente
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados da Classificação */}
      {classifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Resultados da Classificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classifications.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-medium">
                        {result.system}
                      </Badge>
                      <Badge 
                        variant={result.confidence === 'high' ? 'default' : 
                                result.confidence === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {result.confidence === 'high' ? 'Alta confiança' :
                         result.confidence === 'medium' ? 'Média confiança' : 'Baixa confiança'}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">
                      {result.system} {result.classification}
                    </h3>
                    <p className="text-sm text-gray-600">{result.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const fullClassification = `${result.system} ${result.classification}: ${result.description}`;
                      onClassificationSelect?.(fullClassification);
                    }}
                  >
                    Usar
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Raciocínio:</p>
                      <p className="text-sm text-blue-800">{result.reasoning}</p>
                    </div>
                  </div>
                </div>
                
                {result.recommendations && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Recomendações:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Busca Rápida de Classificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Referência Rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Buscar classificação..."
                className="pl-10"
              />
            </div>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os sistemas</option>
              <option value="paris">Paris</option>
              <option value="kudo">Kudo</option>
              <option value="nice">NICE</option>
              <option value="haggitt">Haggitt</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filteredClassifications.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start text-left h-auto p-2"
                onClick={() => {
                  const fullClassification = `${item.system.toUpperCase()} ${item.key}: ${item.description}`;
                  onClassificationSelect?.(fullClassification);
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.system.toUpperCase()}
                    </Badge>
                    <span className="font-medium text-xs">{item.key}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Dica:</strong> Preencha o máximo de informações possível para obter classificações mais precisas. 
              O sistema analisa morfologia, padrões de superfície e características descritas para sugerir as classificações mais apropriadas.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}