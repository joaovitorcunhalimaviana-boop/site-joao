export interface ColonoscopyTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  description: string;
  useCase: string;
}

export const DEFAULT_COLONOSCOPY_TEMPLATES: ColonoscopyTemplate[] = [];

export const COLONOSCOPY_SNIPPETS = [
  {
    id: 'prep-adequate',
    trigger: 'prepadq',
    content: 'PREPARO: Adequado (Boston 7-9)',
    category: 'Preparo',
    description: 'Preparo adequado'
  },
  {
    id: 'prep-inadequate',
    trigger: 'prepinadq',
    content: 'PREPARO: Inadequado (Boston <6) - limitando a avaliação',
    category: 'Preparo',
    description: 'Preparo inadequado'
  },
  {
    id: 'normal-mucosa',
    trigger: 'mucnormal',
    content: 'mucosa de aspecto normal, sem lesões ou alterações inflamatórias',
    category: 'Achados',
    description: 'Mucosa normal'
  },
  {
    id: 'polyp-sessile',
    trigger: 'polsessil',
    content: 'pólipo séssil de {size}mm, Paris 0-Is, superfície lisa',
    category: 'Pólipos',
    description: 'Pólipo séssil padrão'
  },
  {
    id: 'polyp-pedunculated',
    trigger: 'polped',
    content: 'pólipo pediculado de {size}mm, Paris 0-Ip, pedículo de {ped}mm',
    category: 'Pólipos',
    description: 'Pólipo pediculado'
  },
  {
    id: 'biopsy-cold',
    trigger: 'biopfria',
    content: 'Realizada biópsia com pinça fria. Material enviado para análise histopatológica.',
    category: 'Procedimentos',
    description: 'Biópsia fria'
  },
  {
    id: 'polypectomy-snare',
    trigger: 'polipala',
    content: 'Polipectomia com alça diatérmica. Ressecção completa em monobloco. Material enviado para histopatológico.',
    category: 'Procedimentos',
    description: 'Polipectomia com alça'
  },
  {
    id: 'injection-submucosal',
    trigger: 'injsub',
    content: 'Injeção submucosa com soro fisiológico + adrenalina + azul de metileno',
    category: 'Procedimentos',
    description: 'Injeção submucosa'
  },
  {
    id: 'hemostasis-clip',
    trigger: 'hemoclip',
    content: 'Hemostasia com clipagem metálica',
    category: 'Procedimentos',
    description: 'Hemostasia com clip'
  },
  {
    id: 'kudo-pattern',
    trigger: 'kudo',
    content: 'Padrão de criptas Kudo tipo {type}: {description}',
    category: 'Classificação',
    description: 'Classificação de Kudo'
  },
  {
    id: 'paris-classification',
    trigger: 'paris',
    content: 'Classificação de Paris: 0-{subtype}',
    category: 'Classificação',
    description: 'Classificação de Paris'
  },
  {
    id: 'nice-classification',
    trigger: 'nice',
    content: 'NICE tipo {type}: {prediction}',
    category: 'Classificação',
    description: 'Classificação NICE'
  },
  {
    id: 'follow-up-low-risk',
    trigger: 'segbaixo',
    content: 'Seguimento: próximo exame em 5-10 anos (baixo risco)',
    category: 'Seguimento',
    description: 'Seguimento baixo risco'
  },
  {
    id: 'follow-up-high-risk',
    trigger: 'segalto',
    content: 'Seguimento: próximo exame em 3 anos (alto risco)',
    category: 'Seguimento',
    description: 'Seguimento alto risco'
  },
  {
    id: 'segments-normal',
    trigger: 'segnormal',
    content: `- Reto: mucosa normal
- Sigmoide: sem alterações
- Descendente: mucosa íntegra
- Transverso: sem lesões
- Ascendente: normal
- Ceco: íleo terminal visualizado e normal`,
    category: 'Achados',
    description: 'Todos os segmentos normais'
  }
];

export const CLASSIFICATION_SYSTEMS = {
  paris: {
    '0-Is': 'Séssil (elevado, altura > 2.5mm)',
    '0-Ip': 'Pediculado',
    '0-IIa': 'Superficial elevado (altura < 2.5mm)',
    '0-IIb': 'Completamente plano',
    '0-IIc': 'Superficial deprimido',
    '0-III': 'Escavado/ulcerado'
  },
  kudo: {
    'I': 'Normal - criptas redondas regulares',
    'II': 'Hiperplásico - criptas estreladas/papilares',
    'III-L': 'Adenoma baixo grau - criptas tubulares pequenas',
    'III-S': 'Adenoma baixo grau - criptas tubulares pequenas densas',
    'IV': 'Adenoma alto grau - criptas ramificadas/giróides',
    'V-I': 'Carcinoma invasivo - criptas irregulares/amorfas',
    'V-N': 'Carcinoma invasivo - sem estrutura de criptas'
  },
  nice: {
    '1': 'Hiperplásico - sem neoplasia',
    '2': 'Adenoma - neoplasia de baixo grau',
    '3': 'Carcinoma invasivo - neoplasia de alto grau'
  },
  haggitt: {
    '0': 'Carcinoma limitado à mucosa',
    '1': 'Carcinoma invade submucosa da cabeça do pólipo',
    '2': 'Carcinoma invade colo do pólipo',
    '3': 'Carcinoma invade submucosa do pedículo',
    '4': 'Carcinoma invade submucosa da parede intestinal'
  }
};

export const MEDICAL_TERMS_AUTOCOMPLETE = [
  'adenoma', 'hiperplásico', 'séssil', 'pediculado', 'Paris', 'Kudo', 'NICE', 'Haggitt',
  'polipectomia', 'biópsia', 'EMR', 'ESD', 'LST', 'diverticulose', 'colite',
  'mucosa', 'submucosa', 'criptas', 'vascular', 'hemostasia', 'clipagem',
  'monobloco', 'fragmentos', 'histopatológico', 'seguimento', 'rastreamento'
];