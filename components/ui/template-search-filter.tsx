'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Hash, 
  Star, 
  Clock, 
  Tag,
  X,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { ColonoscopyTemplate } from '@/lib/colonoscopy-templates';

interface TemplateSearchFilterProps {
  templates: ColonoscopyTemplate[];
  onFilteredTemplatesChange: (templates: ColonoscopyTemplate[]) => void;
  className?: string;
}

type SortOption = 'name' | 'category' | 'lastUsed' | 'usageCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  searchTerm: string;
  selectedCategories: string[];
  dateRange: {
    start: string;
    end: string;
  };
  usageRange: {
    min: number;
    max: number;
  };
  onlyFavorites: boolean;
  sortBy: SortOption;
  sortDirection: SortDirection;
}

export default function TemplateSearchFilter({ 
  templates, 
  onFilteredTemplatesChange, 
  className = '' 
}: TemplateSearchFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: [],
    dateRange: { start: '', end: '' },
    usageRange: { min: 0, max: 100 },
    onlyFavorites: false,
    sortBy: 'lastUsed',
    sortDirection: 'desc'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Extrair categorias únicas dos templates
  const availableCategories = useMemo(() => {
    const categories = templates.map(t => t.category).filter(Boolean);
    return [...new Set(categories)].sort();
  }, [templates]);

  // Calcular estatísticas dos templates
  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);
    const avgUsage = totalTemplates > 0 ? Math.round(totalUsage / totalTemplates) : 0;
    const mostUsedCategory = availableCategories.reduce((prev, category) => {
      const categoryUsage = templates
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + (t.usageCount || 0), 0);
      const prevUsage = templates
        .filter(t => t.category === prev)
        .reduce((sum, t) => sum + (t.usageCount || 0), 0);
      return categoryUsage > prevUsage ? category : prev;
    }, availableCategories[0] || '');

    const recentlyCreated = templates.filter(t => {
      const createdDate = new Date(t.createdAt || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdDate > weekAgo;
    }).length;

    return {
      totalTemplates,
      totalUsage,
      avgUsage,
      mostUsedCategory,
      recentlyCreated,
      favoriteCount: templates.filter(t => t.isFavorite).length
    };
  }, [templates, availableCategories]);

  // Aplicar filtros e ordenação
  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    // Filtro de busca por texto
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.content.toLowerCase().includes(searchLower) ||
        template.category?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categorias
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(template =>
        filters.selectedCategories.includes(template.category || '')
      );
    }

    // Filtro por favoritos
    if (filters.onlyFavorites) {
      filtered = filtered.filter(template => template.isFavorite);
    }

    // Filtro por range de uso
    filtered = filtered.filter(template => {
      const usage = template.usageCount || 0;
      return usage >= filters.usageRange.min && usage <= filters.usageRange.max;
    });

    // Filtro por data
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(template => {
        const templateDate = new Date(template.lastUsed || template.createdAt || Date.now());
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : new Date(0);
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date();
        return templateDate >= startDate && templateDate <= endDate;
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'lastUsed':
          aValue = new Date(a.lastUsed || a.createdAt || 0).getTime();
          bValue = new Date(b.lastUsed || b.createdAt || 0).getTime();
          break;
        case 'usageCount':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) return filters.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [templates, filters]);

  // Atualizar templates filtrados quando mudarem
  useMemo(() => {
    onFilteredTemplatesChange(filteredTemplates);
  }, [filteredTemplates, onFilteredTemplatesChange]);

  // Funções de atualização de filtros
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategories: [],
      dateRange: { start: '', end: '' },
      usageRange: { min: 0, max: 100 },
      onlyFavorites: false,
      sortBy: 'lastUsed',
      sortDirection: 'desc'
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.selectedCategories.length > 0 || 
    filters.onlyFavorites || 
    filters.dateRange.start || 
    filters.dateRange.end ||
    filters.usageRange.min > 0 || 
    filters.usageRange.max < 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de Busca Principal */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                placeholder="Buscar por nome, descrição, conteúdo ou categoria..."
                className="pl-10"
              />
            </div>

            {/* Controles de ordenação */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="lastUsed">Último uso</option>
                <option value="name">Nome</option>
                <option value="category">Categoria</option>
                <option value="usageCount">Mais usado</option>
                <option value="createdAt">Data criação</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {filters.sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
                {showAdvancedFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtros ativos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {filters.searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  "{filters.searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('searchTerm', '')}
                  />
                </Badge>
              )}
              
              {filters.selectedCategories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleCategory(category)}
                  />
                </Badge>
              ))}
              
              {filters.onlyFavorites && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Favoritos
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('onlyFavorites', false)}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtro por categorias */}
            <div>
              <label className="block text-sm font-medium mb-2">Categorias</label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <Button
                    key={category}
                    variant={filters.selectedCategories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtro por favoritos */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="favorites"
                checked={filters.onlyFavorites}
                onChange={(e) => updateFilter('onlyFavorites', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="favorites" className="text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Apenas favoritos
              </label>
            </div>

            {/* Filtro por range de data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data inicial</label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data final</label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                />
              </div>
            </div>

            {/* Filtro por range de uso */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Número de usos: {filters.usageRange.min} - {filters.usageRange.max}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min="0"
                  value={filters.usageRange.min}
                  onChange={(e) => updateFilter('usageRange', { 
                    ...filters.usageRange, 
                    min: parseInt(e.target.value) || 0 
                  })}
                  placeholder="Mínimo"
                />
                <Input
                  type="number"
                  min="0"
                  value={filters.usageRange.max}
                  onChange={(e) => updateFilter('usageRange', { 
                    ...filters.usageRange, 
                    max: parseInt(e.target.value) || 100 
                  })}
                  placeholder="Máximo"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas dos Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTemplates}</div>
                <div className="text-sm text-gray-600">Total de templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalUsage}</div>
                <div className="text-sm text-gray-600">Usos totais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgUsage}</div>
                <div className="text-sm text-gray-600">Média de uso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.favoriteCount}</div>
                <div className="text-sm text-gray-600">Favoritos</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Categoria mais usada:</span>
                  <Badge variant="outline">{stats.mostUsedCategory || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Criados esta semana:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.recentlyCreated}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              Mostrando {filteredTemplates.length} de {templates.length} templates
            </div>
            
            {filteredTemplates.length > 0 && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exportar resultados
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}