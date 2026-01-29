import { Id } from "../../convex/_generated/dataModel";

// Tipo de empresa do banco Convex
export interface EmpresaConvex {
  _id: Id<"empresas">;
  _creationTime: number;
  titulo: string;
  endereco?: string;
  categoria?: string;
  telefone?: string;
  website?: string;
  avaliacao?: number;
  totalAvaliacoes?: number;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  pesquisa?: string;
  status: "a_contatar" | "contato_realizado" | "sem_interesse" | "negociando" | "convertido";
  capturadoEm: number;
  ultimoContato?: number;
  notas?: string;
}

// Tipo legado para compatibilidade com componentes antigos (snake_case)
export interface EmpresaBanco {
  id: number;
  titulo: string;
  endereco?: string;
  categoria?: string;
  telefone?: string;
  website?: string;
  avaliacao?: number;
  total_avaliacoes?: number;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  pesquisa?: string;
  status?: "a_contatar" | "contato_realizado" | "sem_interesse" | "negociando" | "convertido";
  capturado_em?: string;
  ultimo_contato?: string;
  notas?: string;
  _id?: Id<"empresas">;
}

// Função para converter de Convex para legado
export function convexToLegacy(empresa: EmpresaConvex): EmpresaBanco {
  return {
    id: empresa._id as unknown as number,
    titulo: empresa.titulo,
    endereco: empresa.endereco,
    categoria: empresa.categoria,
    telefone: empresa.telefone,
    website: empresa.website,
    avaliacao: empresa.avaliacao,
    total_avaliacoes: empresa.totalAvaliacoes,
    place_id: empresa.placeId,
    latitude: empresa.latitude,
    longitude: empresa.longitude,
    pesquisa: empresa.pesquisa,
    status: empresa.status,
    capturado_em: new Date(empresa.capturadoEm).toISOString(),
    ultimo_contato: empresa.ultimoContato ? new Date(empresa.ultimoContato).toISOString() : undefined,
    notas: empresa.notas,
    _id: empresa._id
  };
}

// Função para converter de legado para Convex (para criar/atualizar)
export function legacyToConvex(empresa: Partial<EmpresaBanco>): Partial<Omit<EmpresaConvex, "_id" | "_creationTime">> {
  return {
    titulo: empresa.titulo,
    endereco: empresa.endereco,
    categoria: empresa.categoria,
    telefone: empresa.telefone,
    website: empresa.website,
    avaliacao: empresa.avaliacao,
    totalAvaliacoes: empresa.total_avaliacoes,
    placeId: empresa.place_id,
    latitude: empresa.latitude,
    longitude: empresa.longitude,
    pesquisa: empresa.pesquisa,
    status: empresa.status,
    notas: empresa.notas
  };
}
