'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Brain, 
  Clock, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  BarChart3,
  Keyboard,
  MessageSquare,
  Sparkles,
  BookOpen,
  Search,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
// Colonoscopy imports removed

interface ProductivityFeaturesProps {
  editorContent: string;
  onContentChange: (content: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
}

interface Suggestion {
  text: string;
  type: 'autocomplete' | 'template' | 'correction' | 'enhancement';
  confidence: number;
  reasoning?: string;
  category?: string;
}

interface TypingStats {
  wordsPerMinute: number;
  charactersTyped: number;
  timeSpent: number;
  errorsDetected: number;
  suggestionsAccepted: number;
}

export default function ProductivityFeatures({ 
  editorContent, 
  onContentChange, 
  onSuggestionSelect,
  className = '' 
}: ProductivityFeaturesProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [typingStats, setTypingStats] = useState<TypingStats>({
    wordsPerMinute: 0,
    charactersTyped: 0,
    timeSpent: 0,
    errorsDetected: 0,
    suggestionsAccepted: 0
  });
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [sessionStartTime] = useState(Date.now());
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  const recognitionRef = useRef<any>(null);
  const typingTimerRef = useRef<NodeJS.Timeout>();

  // Atalhos de teclado
  const keyboardShortcuts = [
    { key: 'Ctrl + Space', description: 'Mostrar sugestões' },
    { key: 'Ctrl + /', description: 'Inserir snippet rápido' },
    { key: 'Ctrl + Shift + A', description: 'Análise automática' },
    { key: 'Ctrl + Shift + V', description: 'Iniciar/parar ditado por voz' },
    { key: 'Ctrl + Shift + S', description: 'Salvar como template' },
    { key: 'Ctrl + Shift + F', description: 'Formatar texto' },
    { key: 'Tab', description: 'Aceitar sugestão' },
    { key: 'Esc', description: 'Fechar sugestões' }
  ];

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setVoiceText(finalTranscript);
          onContentChange(editorContent + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceRecording(false);
      };
    }
  }, []);

  // Analisar conteúdo e gerar sugestões
  const analyzeContent = useMemo(() => {
    if (!editorContent.trim()) return [];

    const newSuggestions: Suggestion[] = [];
    const words = editorContent.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    const lastSentence = editorContent.split(/[.!?]/).pop()?.trim() || '';

    // Sugestões de autocompletar
    if (lastWord && lastWord.length > 2) {
      const matchingTerms = MEDICAL_TERMS_AUTOCOMPLETE.filter(term =>
        term.toLowerCase().startsWith(lastWord) && term.toLowerCase() !== lastWord
      );

      matchingTerms.slice(0, 3).forEach(term => {
        newSuggestions.push({
          text: term,
          type: 'autocomplete',
          confidence: 0.9,
          reasoning: `Completar "${lastWord}" com "${term}"`
        });
      });
    }

    // Sugestões de snippets baseadas no contexto
    const contextKeywords = ['pólipo', 'lesão', 'mucosa', 'divertículo', 'inflamação'];
    const hasContextKeyword = contextKeywords.some(keyword => 
      lastSentence.toLowerCase().includes(keyword)
    );

    if (hasContextKeyword) {
      const relevantSnippets = [].filter(snippet =>
        contextKeywords.some(keyword => 
          snippet.content.toLowerCase().includes(keyword) ||
          snippet.category?.toLowerCase().includes(keyword)
        )
      );

      relevantSnippets.slice(0, 2).forEach(snippet => {
        newSuggestions.push({
          text: snippet.content,
          type: 'template',
          confidence: 0.8,
          reasoning: `Snippet relevante para o contexto atual`,
          category: snippet.category
        });
      });
    }

    // Sugestões de correção/melhoria
    const commonErrors = [
      { wrong: 'colonoscopia', correct: 'colonoscopia total', context: 'início' },
      { wrong: 'normal', correct: 'mucosa de aspecto normal', context: 'descrição' },
      { wrong: 'pólipo', correct: 'pólipo séssil/pediculado', context: 'lesão' }
    ];

    commonErrors.forEach(error => {
      if (lastSentence.toLowerCase().includes(error.wrong)) {
        newSuggestions.push({
          text: error.correct,
          type: 'correction',
          confidence: 0.7,
          reasoning: `Sugestão de melhoria: "${error.wrong}" → "${error.correct}"`
        });
      }
    });

    // Sugestões de estrutura
    if (editorContent.length > 100 && !editorContent.includes('CONCLUSÃO:')) {
      newSuggestions.push({
        text: '\n\nCONCLUSÃO:\n',
        type: 'enhancement',
        confidence: 0.6,
        reasoning: 'Adicionar seção de conclusão ao laudo'
      });
    }

    return newSuggestions;
  }, [editorContent]);

  // Atualizar sugestões
  useEffect(() => {
    setSuggestions(analyzeContent);
  }, [analyzeContent]);

  // Calcular estatísticas de digitação
  useEffect(() => {
    const currentTime = Date.now();
    const timeSpent = Math.floor((currentTime - sessionStartTime) / 1000);
    const words = editorContent.trim().split(/\s+/).filter(word => word.length > 0);
    const wordsPerMinute = timeSpent > 0 ? Math.round((words.length / timeSpent) * 60) : 0;

    setTypingStats(prev => ({
      ...prev,
      wordsPerMinute,
      charactersTyped: editorContent.length,
      timeSpent
    }));
  }, [editorContent, sessionStartTime]);

  // Controle de voz
  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) return;

    if (isVoiceRecording) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    } else {
      recognitionRef.current.start();
      setIsVoiceRecording(true);
    }
  };

  // Aplicar sugestão
  const applySuggestion = (suggestion: Suggestion) => {
    let newContent = editorContent;

    if (suggestion.type === 'autocomplete') {
      const words = editorContent.split(/\s+/);
      words[words.length - 1] = suggestion.text;
      newContent = words.join(' ');
    } else {
      newContent = editorContent + suggestion.text;
    }

    onContentChange(newContent);
    onSuggestionSelect?.(suggestion.text);
    
    setTypingStats(prev => ({
      ...prev,
      suggestionsAccepted: prev.suggestionsAccepted + 1
    }));
  };

  // Análise automática completa
  const runFullAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simular análise mais profunda
    setTimeout(() => {
      const enhancedSuggestions: Suggestion[] = [
        ...analyzeContent,
        {
          text: 'Considere adicionar informações sobre o preparo intestinal',
          type: 'enhancement',
          confidence: 0.8,
          reasoning: 'Melhoria na completude do laudo'
        },
        {
          text: 'Verifique se todas as classificações estão corretas',
          type: 'correction',
          confidence: 0.7,
          reasoning: 'Revisão de qualidade'
        }
      ];
      
      setSuggestions(enhancedSuggestions);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Formatação automática
  const autoFormat = () => {
    let formatted = editorContent;
    
    // Capitalizar início de frases
    formatted = formatted.replace(/([.!?]\s*)([a-z])/g, (match, punctuation, letter) => 
      punctuation + letter.toUpperCase()
    );
    
    // Padronizar seções
    formatted = formatted.replace(/conclusão:/gi, 'CONCLUSÃO:');
    formatted = formatted.replace(/achados:/gi, 'ACHADOS:');
    formatted = formatted.replace(/procedimentos:/gi, 'PROCEDIMENTOS:');
    
    onContentChange(formatted);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Painel de Produtividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Assistente de Produtividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles principais */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runFullAnalysis}
              disabled={isAnalyzing}
              size="sm"
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Análise Completa
                </>
              )}
            </Button>

            <Button
              onClick={autoFormat}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Formatar
            </Button>

            <Button
              onClick={toggleVoiceRecording}
              variant={isVoiceRecording ? "destructive" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isVoiceRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Parar Ditado
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Ditado por Voz
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Atalhos
            </Button>
          </div>

          {/* Estatísticas de digitação */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{typingStats.wordsPerMinute}</div>
              <div className="text-xs text-blue-300">PPM</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{typingStats.charactersTyped}</div>
              <div className="text-xs text-blue-300">Caracteres</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{Math.floor(typingStats.timeSpent / 60)}m</div>
              <div className="text-xs text-blue-300">Tempo</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{typingStats.suggestionsAccepted}</div>
              <div className="text-xs text-blue-300">Sugestões</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sugestões Inteligentes */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Sugestões Inteligentes ({suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={
                          suggestion.type === 'autocomplete' ? 'default' :
                          suggestion.type === 'template' ? 'secondary' :
                          suggestion.type === 'correction' ? 'destructive' : 'outline'
                        }
                        className="text-xs"
                      >
                        {suggestion.type === 'autocomplete' ? 'Autocompletar' :
                         suggestion.type === 'template' ? 'Template' :
                         suggestion.type === 'correction' ? 'Correção' : 'Melhoria'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {suggestion.confidence > 0.8 ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : suggestion.confidence > 0.6 ? (
                          <AlertCircle className="h-3 w-3 text-yellow-600" />
                        ) : (
                          <Info className="h-3 w-3 text-blue-600" />
                        )}
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-1">{suggestion.text}</p>
                    {suggestion.reasoning && (
                      <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applySuggestion(suggestion)}
                    className="ml-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Atalhos de Teclado */}
      {showKeyboardShortcuts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Atalhos de Teclado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ditado por Voz */}
      {isVoiceRecording && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-700">Gravando...</span>
              </div>
              <Button
                onClick={toggleVoiceRecording}
                variant="outline"
                size="sm"
                className="border-red-300"
              >
                <MicOff className="h-4 w-4" />
                Parar
              </Button>
            </div>
            {voiceText && (
              <div className="mt-2 p-2 bg-white rounded border text-sm">
                {voiceText}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dicas de Produtividade */}
      <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Dica de Produtividade:</strong> Use Ctrl+Space para ver sugestões contextuais 
              enquanto digita. O sistema aprende com seus padrões de escrita para oferecer sugestões 
              mais precisas ao longo do tempo.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
