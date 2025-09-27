'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Type,
  Zap,
  Search,
  Copy,
  Download,
  FileText,
  Settings,
  Eye,
  EyeOff,
  Lightbulb,
  Target
} from 'lucide-react';
import { COLONOSCOPY_SNIPPETS, CLASSIFICATION_SYSTEMS, MEDICAL_TERMS_AUTOCOMPLETE } from '@/lib/colonoscopy-templates';

interface ColonoscopyEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
}

interface AutocompleteItem {
  text: string;
  type: 'snippet' | 'classification' | 'term';
  description?: string;
  category?: string;
}

export default function ColonoscopyEditor({ 
  content, 
  onChange, 
  onSave, 
  placeholder = "Digite seu laudo de colonoscopia..." 
}: ColonoscopyEditorProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [selectedAutocomplete, setSelectedAutocomplete] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showSnippetPanel, setShowSnippetPanel] = useState(true);
  const [showClassificationPanel, setShowClassificationPanel] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Atualizar contadores
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(content.length);
  }, [content]);

  // Gerenciar autocomplete
  const handleInputChange = (value: string) => {
    onChange(value);
    
    // Adicionar ao histórico de undo
    if (content !== value) {
      setUndoStack(prev => [...prev.slice(-19), content]);
      setRedoStack([]);
    }

    // Detectar trigger para autocomplete
    const textarea = editorRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.length >= 2) {
      const suggestions = getSuggestions(currentWord);
      if (suggestions.length > 0) {
        setAutocompleteItems(suggestions);
        setSelectedAutocomplete(0);
        setShowAutocomplete(true);
        setCursorPosition(cursorPos);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Obter sugestões
  const getSuggestions = (query: string): AutocompleteItem[] => {
    const suggestions: AutocompleteItem[] = [];
    const lowerQuery = query.toLowerCase();

    // Snippets
    COLONOSCOPY_SNIPPETS.forEach(snippet => {
      if (snippet.trigger.includes(lowerQuery) || snippet.description.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: snippet.content,
          type: 'snippet',
          description: snippet.description,
          category: snippet.category
        });
      }
    });

    // Termos médicos
    MEDICAL_TERMS_AUTOCOMPLETE.forEach(term => {
      if (term.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: term,
          type: 'term',
          description: `Termo médico: ${term}`
        });
      }
    });

    // Classificações
    Object.entries(CLASSIFICATION_SYSTEMS).forEach(([system, classifications]) => {
      Object.entries(classifications).forEach(([key, description]) => {
        if (key.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery)) {
          suggestions.push({
            text: `${system.toUpperCase()} ${key}: ${description}`,
            type: 'classification',
            description: `Classificação ${system.toUpperCase()}`,
            category: system
          });
        }
      });
    });

    return suggestions.slice(0, 10);
  };

  // Inserir sugestão
  const insertSuggestion = (suggestion: AutocompleteItem) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];
    
    const newTextBefore = textBeforeCursor.substring(0, textBeforeCursor.length - currentWord.length);
    const newContent = newTextBefore + suggestion.text + textAfterCursor;
    
    onChange(newContent);
    setShowAutocomplete(false);
    
    // Focar e posicionar cursor
    setTimeout(() => {
      const newCursorPos = newTextBefore.length + suggestion.text.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Gerenciar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAutocomplete) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedAutocomplete(prev => 
            prev < autocompleteItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedAutocomplete(prev => 
            prev > 0 ? prev - 1 : autocompleteItems.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (autocompleteItems[selectedAutocomplete]) {
            insertSuggestion(autocompleteItems[selectedAutocomplete]);
          }
          break;
        case 'Escape':
          setShowAutocomplete(false);
          break;
      }
    }

    // Atalhos do editor
    if (e.ctrlKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          onSave?.();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case ' ':
          e.preventDefault();
          setShowAutocomplete(true);
          break;
      }
    }
  };

  // Undo/Redo
  const undo = () => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1];
      setRedoStack(prev => [content, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      onChange(previousContent);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[0];
      setUndoStack(prev => [...prev, content]);
      setRedoStack(prev => prev.slice(1));
      onChange(nextContent);
    }
  };

  // Formatação de texto
  const formatText = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
      case 'numbered':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    onChange(newContent);
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  // Inserir snippet rápido
  const insertQuickSnippet = (snippet: any) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const newContent = content.substring(0, cursorPos) + snippet.content + content.substring(cursorPos);
    onChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + snippet.content.length, cursorPos + snippet.content.length);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Formatação */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                title="Negrito (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                title="Itálico (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                title="Sublinhado (Ctrl+U)"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>

            {/* Listas */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('list')}
                title="Lista com marcadores"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('numbered')}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('quote')}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={undoStack.length === 0}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={redoStack.length === 0}
                title="Refazer (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Visualização */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                title="Alternar visualização"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Painéis */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSnippetPanel(!showSnippetPanel)}
                title="Alternar painel de snippets"
              >
                <Zap className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClassificationPanel(!showClassificationPanel)}
                title="Alternar painel de classificações"
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(content)}
                title="Copiar texto"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                title="Salvar (Ctrl+S)"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
              <span>{wordCount} palavras</span>
              <span>{characterCount} caracteres</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Editor */}
        <div className={`${showSnippetPanel || showClassificationPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <Card>
            <CardContent className="p-0 relative">
              {showPreview ? (
                <div className="p-4 min-h-96 whitespace-pre-wrap font-mono text-sm">
                  {content || placeholder}
                </div>
              ) : (
                <>
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full h-96 p-4 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm"
                  />
                  
                  {/* Autocomplete */}
                  {showAutocomplete && (
                    <div
                      ref={autocompleteRef}
                      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                      style={{
                        top: '100px', // Ajustar conforme necessário
                        left: '20px',
                        width: '300px'
                      }}
                    >
                      {autocompleteItems.map((item, index) => (
                        <div
                          key={index}
                          className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            index === selectedAutocomplete ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => insertSuggestion(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.description}</div>
                              <div className="text-xs text-gray-500 truncate">{item.text}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painéis Laterais */}
        {(showSnippetPanel || showClassificationPanel) && (
          <div className="space-y-4">
            {/* Snippets Rápidos */}
            {showSnippetPanel && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Snippets Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {COLONOSCOPY_SNIPPETS.slice(0, 8).map((snippet) => (
                    <Button
                      key={snippet.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => insertQuickSnippet(snippet)}
                    >
                      <div>
                        <div className="font-medium text-xs">{snippet.description}</div>
                        <code className="text-xs text-gray-500">{snippet.trigger}</code>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Classificações */}
            {showClassificationPanel && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Classificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(CLASSIFICATION_SYSTEMS).map(([system, classifications]) => (
                    <div key={system}>
                      <h4 className="font-medium text-xs uppercase text-gray-600 mb-1">
                        {system}
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(classifications).slice(0, 3).map(([key, description]) => (
                          <Button
                            key={key}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-1"
                            onClick={() => {
                              const text = `${system.toUpperCase()} ${key}: ${description}`;
                              insertQuickSnippet({ content: text });
                            }}
                          >
                            <div className="text-xs">
                              <span className="font-medium">{key}</span>
                              <div className="text-gray-500 truncate">{description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Dicas de Uso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Dicas de produtividade:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Digite pelo menos 2 caracteres para ativar o autocomplete</li>
                <li>• Use Ctrl+Espaço para forçar o autocomplete</li>
                <li>• Ctrl+S para salvar, Ctrl+Z/Y para desfazer/refazer</li>
                <li>• Clique nos snippets laterais para inserção rápida</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}