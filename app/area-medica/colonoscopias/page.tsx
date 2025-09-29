'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { 
  Search, 
  Plus, 
  Save, 
  Copy, 
  Edit3, 
  Trash2, 
  FileText, 
  Zap, 
  Target,
  BookOpen,
  Clock,
  Filter,
  Download,
  Upload,
  Settings,
  Microscope,
  Activity,
  Star,
  Layout,
  Stethoscope
} from 'lucide-react';
import { DEFAULT_COLONOSCOPY_TEMPLATES, COLONOSCOPY_SNIPPETS } from '@/lib/colonoscopy-templates';
import ColonoscopyEditor from '@/components/ui/colonoscopy-editor';
import SnippetManager from '@/components/ui/snippet-manager';
import EndoscopicCalculators from '@/components/ui/endoscopic-calculators';
import ProductivityFeatures from '@/components/ui/productivity-features';

interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

interface Snippet {
  id: string;
  trigger: string;
  content: string;
  category: string;
  description: string;
}

const CATEGORIES = [
  'Pólipos',
  'Lesões Planas',
  'Massas',
  'Inflamatórias',
  'Vasculares',
  'Normais',
  'Complicações',
  'Biópsia',
  'Polipectomia',
  'Outros'
];

const SEGMENTS = [
  'Reto',
  'Sigmoide',
  'Descendente',
  'Transverso',
  'Ascendente',
  'Ceco',
  'Íleo Terminal'
];

const DEFAULT_SNIPPETS: Snippet[] = [];

export default function ColonoscopyPage() {
  const [activeView, setActiveView] = useState<'editor' | 'templates' | 'snippets' | 'classifier'>('editor');
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showProductivityFeatures, setShowProductivityFeatures] = useState(true);
  const [showSnippets, setShowSnippets] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>(DEFAULT_SNIPPETS);
  
  // Ref para o editor
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Formulário para novo template
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'Geral',
    description: ''
  });
  // Carregar templates salvos
  useEffect(() => {
    // FORÇAR LIMPEZA COMPLETA - zerar templates
    localStorage.removeItem('colonoscopy-templates');
    setTemplates([]);
  }, []);

  // Salvar templates
  const saveTemplates = (newTemplates: Template[]) => {
    localStorage.setItem('colonoscopy-templates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  // Criar novo template
  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) {
      alert('Por favor, preencha o título e conteúdo do template.');
      return;
    }

    const template: Template = {
      id: Date.now().toString(),
      title: newTemplate.title,
      content: newTemplate.content,
      category: newTemplate.category,
      description: newTemplate.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false,
      usageCount: 0
    };

    const updatedTemplates = [...templates, template];
    saveTemplates(updatedTemplates);
    setNewTemplate({ title: '', content: '', category: 'Geral', description: '' });
    setIsCreatingTemplate(false);
  };

  // Usar template no editor
  const useTemplate = (template: Template) => {
    setEditorContent(template.content);
    setCurrentTemplate(template);
    setActiveView('editor');
    
    // Incrementar contador de uso
    const updatedTemplates = templates.map(t =>
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    saveTemplates(updatedTemplates);
  };

  // Salvar conteúdo atual como template
  const saveCurrentAsTemplate = () => {
    if (!editorContent.trim()) {
      alert('O editor está vazio. Digite algum conteúdo antes de salvar como template.');
      return;
    }
    
    setNewTemplate({ 
      title: '', 
      content: editorContent, 
      category: 'Geral', 
      description: '' 
    });
    setIsCreatingTemplate(true);
    setActiveView('templates');
  };

  // Callback para inserir snippet no editor
  const handleSnippetSelect = (snippet: any) => {
    const cursorPos = editorContent.length;
    const newContent = editorContent + (editorContent ? '\n\n' : '') + snippet.content;
    setEditorContent(newContent);
    setActiveView('editor');
  };

  // Carregar dados salvos
  useEffect(() => {
    const savedTemplates = localStorage.getItem('colonoscopy-templates');
    const savedSnippets = localStorage.getItem('colonoscopy-snippets');
    
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
    if (savedSnippets) {
      setSnippets(JSON.parse(savedSnippets));
    }
  }, []);

  // Salvar templates
  const saveTemplate = () => {
    if (!editorContent.trim()) return;

    const template: Template = {
      id: currentTemplate?.id || Date.now().toString(),
      title: currentTemplate?.title || `Template ${templates.length + 1}`,
      category: selectedCategory === 'Todos' ? 'Outros' : selectedCategory,
      content: editorContent,
      tags: extractTags(editorContent),
      createdAt: currentTemplate?.createdAt || new Date(),
      useCount: currentTemplate?.useCount || 0
    };

    const updatedTemplates = currentTemplate
      ? templates.map(t => t.id === currentTemplate.id ? template : t)
      : [...templates, template];

    setTemplates(updatedTemplates);
    localStorage.setItem('colonoscopy-templates', JSON.stringify(updatedTemplates));
    setIsEditing(false);
    setCurrentTemplate(null);
    setEditorContent('');
  };

  // Extrair tags do conteúdo
  const extractTags = (content: string): string[] => {
    const words = content.toLowerCase().split(/\s+/);
    const medicalTerms = ['pólipo', 'adenoma', 'hiperplásico', 'séssil', 'pediculado', 'paris', 'kudo', 'haggitt'];
    return medicalTerms.filter(term => words.some(word => word.includes(term)));
  };

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Inserir snippet
  const insertSnippet = (snippet: Snippet) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newContent = editorContent.substring(0, start) + snippet.content + editorContent.substring(end);
      setEditorContent(newContent);
      
      // Focar no editor após inserção
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(start + snippet.content.length, start + snippet.content.length);
        }
      }, 0);
    }
  };

  // Detectar atalhos no editor
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault();
      setActiveView('snippets');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header currentPage="colonoscopias" />
      <main className="p-4 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400">
              Área de Colonoscopias
            </h1>
          </div>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Sistema inteligente para criação e gerenciamento de laudos de colonoscopia 
            com templates personalizáveis e funcionalidades avançadas de produtividade.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 font-medium">Templates Salvos</p>
                  <p className="text-3xl font-bold text-white">{templates.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 font-medium">Snippets Ativos</p>
                  <p className="text-3xl font-bold text-white">{snippets.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-blue-900/20 backdrop-blur-sm border border-blue-700/30">
            <TabsTrigger value="editor" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Edit3 className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="snippets" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Zap className="h-4 w-4" />
              Snippets
            </TabsTrigger>
            <TabsTrigger value="calculators" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Target className="h-4 w-4" />
              Calculadoras
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            {/* Funcionalidades de Produtividade */}
            {showProductivityFeatures && (
              <ProductivityFeatures
                editorContent={editorContent}
                onContentChange={setEditorContent}
                onSuggestionSelect={(suggestion) => {
                  // Callback quando uma sugestão é selecionada
                  console.log('Sugestão selecionada:', suggestion);
                }}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor Principal */}
              <div className="lg:col-span-2">
                <Card className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-blue-300">Configurações de Produtividade</CardTitle>
                  <CardDescription className="text-blue-200">
                    Personalize as funcionalidades avançadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-white">Assistente de Produtividade</label>
                      <p className="text-xs text-blue-300">Sugestões inteligentes e análise automática</p>
                    </div>
                    <Button
                      variant={showProductivityFeatures ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowProductivityFeatures(!showProductivityFeatures)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {showProductivityFeatures ? "Ativo" : "Inativo"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-white">Ditado por Voz</label>
                      <p className="text-xs text-blue-300">Reconhecimento de voz para ditado</p>
                    </div>
                    <Badge variant="outline" className="border-blue-400 text-blue-300">Disponível</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-white">Atalhos de Teclado</label>
                      <p className="text-xs text-blue-300">Acesso rápido às funcionalidades</p>
                    </div>
                    <Badge variant="outline" className="border-blue-400 text-blue-300">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300 mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-blue-300">
                        <Edit3 className="h-5 w-5" />
                        Editor de Laudo
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSnippets(!showSnippets)}
                          className="border-blue-400 text-blue-300 hover:bg-blue-600"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Snippets
                        </Button>
                        <Button
                          onClick={saveTemplate}
                          disabled={!editorContent.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-blue-200">
                      Use Ctrl+Tab para abrir/fechar snippets. Digite e salve seus templates personalizados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      ref={editorRef}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      onKeyDown={handleEditorKeyDown}
                      placeholder="Digite seu laudo de colonoscopia aqui...

Exemplo:
COLONOSCOPIA TOTAL

PREPARO: Adequado

ACHADOS:
- Reto: mucosa de aspecto normal
- Sigmoide: pólipo séssil de 8mm, Paris 0-Is
- Descendente: sem alterações
- Transverso: mucosa normal
- Ascendente: pequenos divertículos
- Ceco: íleo terminal visualizado, normal

PROCEDIMENTOS:
- Polipectomia com alça diatérmica do pólipo em sigmoide
- Material enviado para histopatológico

CONCLUSÃO:
Pólipo em sigmoide ressecado. Diverticulose do cólon ascendente."
                      className="w-full h-96 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Painel Lateral */}
              <div className="space-y-4">
                {/* Snippets Rápidos */}
                {showSnippets && (
                  <Card className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-300">Snippets Rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {snippets.slice(0, 5).map((snippet) => (
                        <Button
                          key={snippet.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left border-blue-400/30 text-blue-300 hover:bg-blue-600/50"
                          onClick={() => insertSnippet(snippet)}
                        >
                          <code className="text-xs bg-blue-800/50 text-blue-200 px-1 rounded mr-2">
                            {snippet.trigger}
                          </code>
                          <span className="truncate">{snippet.description}</span>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Templates Recentes - REMOVIDO */}
                {templates.length > 0 && (
                  <Card className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-300">Templates Salvos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {templates
                        .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
                        .slice(0, 5)
                        .map((template) => (
                          <Button
                            key={template.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => useTemplate(template)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            <div className="text-left">
                              <div className="font-medium truncate">{template.title}</div>
                              <div className="text-xs text-gray-500">{template.category}</div>
                            </div>
                          </Button>
                        ))}
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {/* Filtros */}
            <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
                    >
                      <option value="Todos">Todas as categorias</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-blue-400">{template.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-blue-200">
                          <Badge variant="secondary">{template.category}</Badge>
                          <span className="text-xs text-gray-500">
                            Usado {template.useCount}x
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => useTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentTemplate(template);
                            setEditorContent(template.content);
                            setIsEditing(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.content.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>
                        {template.lastUsed 
                          ? `Usado em ${template.lastUsed.toLocaleDateString()}`
                          : 'Nunca usado'
                        }
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useTemplate(template)}
                      >
                        Usar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-400 mb-2">
                    Nenhum template encontrado
                  </h3>
                  <p className="text-blue-200 mb-4">
                    {searchTerm || selectedCategory !== 'Todos'
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Comece criando seu primeiro template no editor.'
                    }
                  </p>
                  <Button onClick={() => setSearchTerm('')}>
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Snippets Tab */}
          <TabsContent value="snippets" className="space-y-4">
            <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-blue-400">Snippets e Atalhos</CardTitle>
                <CardDescription className="text-blue-200">
                  Crie atalhos rápidos para inserções frequentes. Digite o trigger no editor para usar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {snippets.map((snippet) => (
                    <Card key={snippet.id} className="p-4 bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <code className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-sm font-mono">
                          {snippet.trigger}
                        </code>
                        <Badge variant="outline">{snippet.category}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{snippet.description}</h4>
                      <p className="text-sm text-gray-600 mb-3">{snippet.content}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertSnippet(snippet)}
                      >
                        Inserir
                      </Button>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculators Tab */}
          <TabsContent value="calculators" className="space-y-4">
            <EndoscopicCalculators />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-blue-400">Exportar/Importar</CardTitle>
                  <CardDescription className="text-blue-200">
                    Faça backup dos seus templates e snippets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Templates
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Templates
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-blue-400">Estatísticas</CardTitle>
                  <CardDescription className="text-blue-200">
                    Acompanhe sua produtividade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Templates criados:</span>
                    <span className="font-medium">{templates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de usos:</span>
                    <span className="font-medium">
                      {templates.reduce((sum, t) => sum + t.useCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Snippets ativos:</span>
                    <span className="font-medium">{snippets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categoria mais usada:</span>
                    <span className="font-medium">
                      {templates.length > 0 
                        ? templates.reduce((prev, current) => prev.useCount > current.useCount ? prev : current).category
                        : 'N/A'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}