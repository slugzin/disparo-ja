// Tipos exportados para compatibilidade
export interface CaptarEmpresasRequest {
  tipoEmpresa: string;
  pais: string;
  localizacao?: string;
  idioma: string;
  quantidadeEmpresas: number;
}

export interface Empresa {
  position: number;
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  ratingCount?: number;
  category?: string;
  phoneNumber?: string;
  website?: string;
  bookingLinks?: string[];
  cid?: string;
}

export interface CaptarEmpresasResponse {
  success: boolean;
  data?: {
    empresas: Empresa[];
    totalEncontradas: number;
    parametrosBusca: {
      tipoEmpresa: string;
      localizacao: string;
      pais: string;
      idioma: string;
      quantidadeSolicitada: number;
    };
  };
  message?: string;
  error?: string;
}

export interface BuscarLocalizacoesRequest {
  q: string;
  limit?: number;
}

export interface BuscarLocalizacoesResponse {
  success: boolean;
  data?: Array<{
    name: string;
    canonicalName?: string;
    googleId?: number;
    countryCode: string;
    targetType?: string;
  }>;
  query?: string;
  total?: number;
  error?: string;
  message?: string;
}

export interface SalvarEmpresasRequest {
  empresas: Empresa[];
  parametrosBusca: {
    tipoEmpresa: string;
    localizacao: string;
    pais: string;
    idioma: string;
    quantidadeSolicitada: number;
  };
}

export interface SalvarEmpresasResponse {
  success: boolean;
  message?: string;
  empresasSalvas?: number;
  error?: string;
}

// Interface para empresa do banco - LEGADO para compatibilidade
export interface EmpresaBanco {
  id: number;
  titulo: string;
  endereco?: string;
  categoria?: string;
  telefone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  avaliacao?: number;
  total_avaliacoes?: number;
  posicao?: number;
  cid?: string;
  links_agendamento?: string;
  parametros_busca?: string;
  pesquisa?: string;
  status?: "a_contatar" | "contato_realizado" | "sem_interesse" | "negociando" | "convertido";
  capturado_em?: string;
  atualizado_em?: string;
  place_id?: string;
  ultimo_contato?: string;
  notas?: string;
  _id?: string;
}

export interface BuscarEmpresasResponse {
  success: boolean;
  data?: EmpresaBanco[];
  total?: number;
  error?: string;
}

export interface EstatisticasFunil {
  totalEmpresas: number;
  novasEstaSemana: number;
  contatosRealizadosMes: number;
  comparativoContatosMesAnterior: number;
  taxaResposta: number;
  negociosGanhosMes: number;
  funil: {
    a_contatar: number;
    contato_realizado: number;
    sem_interesse: number;
    negociando: number;
    convertido: number;
  };
  proximasAcoes: {
    respostasAguardando: Array<{
      id: number;
      titulo: string;
      horasAguardando: number;
    }>;
    followUpsSugeridos: Array<{
      id: number;
      titulo: string;
      diasDesdeContato: number;
    }>;
    novosProspects: number;
  };
  performancePorCategoria: Array<{
    categoria: string;
    total: number;
    taxaResposta: number;
  }>;
}

export interface EstatisticasFunilResponse {
  success: boolean;
  data?: EstatisticasFunil;
  error?: string;
}

// NOTA: Estas funções são LEGADAS e devem ser substituídas por hooks do Convex
// Use os hooks em src/hooks/ ao invés destas funções

// Função legada - use useAction(api.actions.captarEmpresas.captar) ao invés
export async function captarEmpresas(_dados: CaptarEmpresasRequest): Promise<CaptarEmpresasResponse> {
  console.warn('DEPRECATION: captarEmpresas() está deprecada. Use useAction(api.actions.captarEmpresas.captar) do Convex.');
  return {
    success: false,
    error: 'Esta função está deprecada. Use os hooks do Convex.'
  };
}

// Função legada - use useAction(api.actions.buscarLocalizacoes.buscar) ao invés
export async function buscarLocalizacoes(_query: string, _limit = 25): Promise<BuscarLocalizacoesResponse> {
  console.warn('DEPRECATION: buscarLocalizacoes() está deprecada. Use useAction(api.actions.buscarLocalizacoes.buscar) do Convex.');
  return {
    success: false,
    error: 'Esta função está deprecada. Use os hooks do Convex.'
  };
}

// Função legada - use useMutation(api.mutations.empresas.createMany) ao invés
export async function salvarEmpresas(_dados: SalvarEmpresasRequest): Promise<SalvarEmpresasResponse> {
  console.warn('DEPRECATION: salvarEmpresas() está deprecada. Use useMutation(api.mutations.empresas.createMany) do Convex.');
  return {
    success: false,
    error: 'Esta função está deprecada. Use os hooks do Convex.'
  };
}

// Função legada - use useQuery(api.queries.empresas.listWithFilters) ao invés
export async function buscarEmpresas(_filtros?: {
  categoria?: string;
  busca?: string;
  pesquisa?: string;
  limite?: number;
  offset?: number;
}): Promise<BuscarEmpresasResponse> {
  console.warn('DEPRECATION: buscarEmpresas() está deprecada. Use useQuery(api.queries.empresas.listWithFilters) do Convex.');
  return {
    success: false,
    error: 'Esta função está deprecada. Use os hooks do Convex.'
  };
}

// Função legada - use useQuery(api.queries.dashboard.getStats) ao invés
export async function buscarEstatisticasFunil(_modalidade?: string): Promise<EstatisticasFunilResponse> {
  console.warn('DEPRECATION: buscarEstatisticasFunil() está deprecada. Use useQuery(api.queries.dashboard.getStats) do Convex.');
  return {
    success: false,
    error: 'Esta função está deprecada. Use os hooks do Convex.'
  };
}
