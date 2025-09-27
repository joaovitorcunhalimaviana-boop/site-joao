'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Filter,
  Copy,
  Zap,
  Tag,
  Clock,
  Star,
  StarOff
} from 'lucide-react';
import { COLONOSCOPY_SNIPPETS } from '@/lib/colonoscopy-templates';

interface CustomSnippet {
  id: string;
  trigger: string;
  content: string;
  description: string;
  category: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

interface SnippetManagerProps {
  onSnippetSelect?: (snippet: CustomSnippet) => void;
  className?: string;
}

const SNIPPET_CATEGORIES = [
  'Anatomia',
  'Lesões',
  'Procedimentos',
  'Classificações',
  'Complicações',
  'Medicamentos',
  'Recomendações',
  'Outros'
];

export default function SnippetManager({ onSnippetSelect, className = '' }: SnippetManagerProps) {
  const [customSnippets, setCustomSnippets] = useState<CustomSnippet[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CustomSnippet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'usage' | 'alphabetical'>('recent');

  // Formulário
  const [formData, setFormData] = useState({
    trigger: '',
    content: '',
    description: '',
    category: 'Outros'
  });

  // Carregar snippets do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('colonoscopy-custom-snippets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomSnippets(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt)
        })));
      } catch (error) {
        console.error('Erro ao carregar snippets:', error);
      }
    }
  }, []);

  // Salvar snippets no localStorage
  const saveSnippets = (snippets: CustomSnippet[]) => {
    localStorage.setItem('colonoscopy-custom-snippets', JSON.stringify(snippets));
    setCustomSnippets(snippets);
  };

  // Filtrar e ordenar snippets
  const filteredSnippets = customSnippets
    .filter(snippet => {
      const matchesSearch = 
        snippet.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || snippet.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || snippet.isFavorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'alphabetical':
          return a.description.localeCompare(b.description);
        case 'recent':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  // Criar novo snippet
  const handleCreateSnippet = () => {
    if (!formData.trigger || !formData.content || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newSnippet: CustomSnippet = {
      id: Date.now().toString(),
      trigger: formData.trigger,
      content: formData.content,
      description: formData.description,
      category: formData.category,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    const updatedSnippets = [...customSnippets, newSnippet];
    saveSnippets(updatedSnippets);
    resetForm();
  };

  // Editar snippet
  const handleEditSnippet = (snippet: CustomSnippet) => {
    setEditingSnippet(snippet);
    setFormData({
      trigger: snippet.trigger,
      content: snippet.content,
      description: snippet.description,
      category: snippet.category
    });
    setIsEditing(true);
  };

  // Salvar edição
  const handleSaveEdit = () => {
    if (!editingSnippet || !formData.trigger || !formData.content || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const updatedSnippets = customSnippets.map(snippet =>
      snippet.id === editingSnippet.id
        ? {
            ...snippet,
            trigger: formData.trigger,
            content: formData.content,
            description: formData.description,
            category: formData.category,
            updatedAt: new Date()
          }
        : snippet
    );

    saveSnippets(updatedSnippets);
    resetForm();
  };

  // Deletar snippet
  const handleDeleteSnippet = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este snippet?')) {
      const updatedSnippets = customSnippets.filter(snippet => snippet.id !== id);
      saveSnippets(updatedSnippets);
    }
  };

  // Alternar favorito
  const toggleFavorite = (id: string) => {
    const updatedSnippets = customSnippets.map(snippet =>
      snippet.id === id
        ? { ...snippet, isFavorite: !snippet.isFavorite, updatedAt: new Date() }
        : snippet
    );
    saveSnippets(updatedSnippets);
  };

  // Usar snippet
  const useSnippet = (snippet: CustomSnippet) => {
    // Incrementar contador de uso
    const updatedSnippets = customSnippets.map(s =>
      s.id === snippet.id
        ? { ...s, usageCount: s.usageCount + 1, updatedAt: new Date() }
        : s
    );
    saveSnippets(updatedSnippets);

    // Callback para inserir no editor
    onSnippetSelect?.(snippet);
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      trigger: '',
      content: '',
      description: '',
      category: 'Outros'
    });
    setIsEditing(false);
    setEditingSnippet(null);
  };

  // Copiar snippet
  const copySnippet = (content: string) => {
    navigator.clipboard.writeText(content);
    // Aqui você poderia adicionar uma notificação de sucesso
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Gerenciador de Snippets
            </CardTitle>
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Snippet
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Formulário de Criação/Edição */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingSnippet ? 'Editar Snippet' : 'Novo Snippet'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trigger">Atalho/Trigger *</Label>
                <Input
                  id="trigger"
                  value={formData.trigger}
                  onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                  placeholder="ex: poli, lesao, normal"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {SNIPPET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do snippet"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Texto que será inserido quando o snippet for usado"
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={editingSnippet ? handleSaveEdit : handleCreateSnippet}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingSnippet ? 'Salvar Alterações' : 'Criar Snippet'}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar snippets..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas as categorias</option>
              {SNIPPET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="recent">Mais recentes</option>
              <option value="usage">Mais usados</option>
              <option value="alphabetical">Alfabética</option>
            </select>

            {/* Favoritos */}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Favoritos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSnippets.map((snippet) => (
          <Card key={snippet.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Cabeçalho do snippet */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{snippet.description}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(snippet.id)}
                        className="p-1 h-auto"
                      >
                        {snippet.isFavorite ? (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {snippet.trigger}
                    </code>
                  </div>
                </div>

                {/* Conteúdo do snippet */}
                <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-20 overflow-y-auto">
                  {snippet.content}
                </div>

                {/* Metadados */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {snippet.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {snippet.usageCount}x
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => useSnippet(snippet)}
                    className="flex-1 text-xs"
                  >
                    Usar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copySnippet(snippet.content)}
                    className="p-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSnippet(snippet)}
                    className="p-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSnippet(snippet.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {filteredSnippets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {customSnippets.length === 0 ? 'Nenhum snippet criado' : 'Nenhum snippet encontrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {customSnippets.length === 0 
                ? 'Crie seu primeiro snippet personalizado para agilizar seus laudos.'
                : 'Tente ajustar os filtros ou criar um novo snippet.'
              }
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Snippet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Snippets Padrão */}
      {customSnippets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Snippets Padrão do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {COLONOSCOPY_SNIPPETS.slice(0, 6).map((snippet) => (
                <Button
                  key={snippet.id}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-left h-auto p-2"
                  onClick={() => onSnippetSelect?.(snippet as any)}
                >
                  <div>
                    <div className="font-medium text-xs">{snippet.description}</div>
                    <code className="text-xs text-gray-500">{snippet.trigger}</code>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}