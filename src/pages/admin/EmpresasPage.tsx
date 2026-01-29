import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  MapPin,
  Globe,
  Phone,
  MessageCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  X,
  Check,
  Copy,
  CheckCircle,
  List,
  LayoutGrid
} from 'lucide-react';
import { useEmpresas, useUpdateEmpresaStatus } from '../../hooks/useEmpresas';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { Id } from '../../../convex/_generated/dataModel';

type StatusType = "a_contatar" | "contato_realizado" | "sem_interesse" | "negociando" | "convertido";

const statusConfig: Record<StatusType, { label: string; color: string; bg: string }> = {
  'a_contatar': { label: 'A Contatar', color: 'text-blue-600', bg: 'bg-blue-100' },
  'contato_realizado': { label: 'Contatado', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'negociando': { label: 'Negociando', color: 'text-purple-600', bg: 'bg-purple-100' },
  'convertido': { label: 'Convertido', color: 'text-green-600', bg: 'bg-green-100' },
  'sem_interesse': { label: 'Sem Interesse', color: 'text-red-600', bg: 'bg-red-100' }
};

const statusOrder: StatusType[] = ['a_contatar', 'contato_realizado', 'negociando', 'convertido', 'sem_interesse'];

const EmpresasPage: React.FC = () => {
  const empresas = useEmpresas();
  const updateStatus = useUpdateEmpresaStatus();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusType | 'todos'>('todos');
  const [filtroPesquisa, setFiltroPesquisa] = useState<string>('todos');
  const [showFiltros, setShowFiltros] = useState(false);
  const [sortField, setSortField] = useState<'titulo' | 'avaliacao' | 'capturadoEm'>('capturadoEm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [empresaMenuAberto, setEmpresaMenuAberto] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');

  // Pesquisas únicas para o filtro
  const pesquisasUnicas = useMemo(() => {
    if (!empresas) return [];
    const pesquisas = new Set<string>();
    empresas.forEach(e => {
      if (e.pesquisa) pesquisas.add(e.pesquisa);
    });
    return Array.from(pesquisas).sort();
  }, [empresas]);

  // Filtrar e ordenar empresas
  const empresasFiltradas = useMemo(() => {
    if (!empresas) return [];

    let resultado = [...empresas];

    // Filtro de busca
    if (busca) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(e =>
        e.titulo?.toLowerCase().includes(termo) ||
        e.endereco?.toLowerCase().includes(termo) ||
        e.telefone?.includes(termo) ||
        e.categoria?.toLowerCase().includes(termo)
      );
    }

    // Filtro de pesquisa
    if (filtroPesquisa !== 'todos') {
      resultado = resultado.filter(e => e.pesquisa === filtroPesquisa);
    }

    // Filtro de status (só no modo lista)
    if (viewMode === 'lista' && filtroStatus !== 'todos') {
      resultado = resultado.filter(e => e.status === filtroStatus);
    }

    // Ordenação
    resultado.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'titulo') {
        comparison = (a.titulo || '').localeCompare(b.titulo || '');
      } else if (sortField === 'avaliacao') {
        comparison = (a.avaliacao || 0) - (b.avaliacao || 0);
      } else {
        comparison = a.capturadoEm - b.capturadoEm;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return resultado;
  }, [empresas, busca, filtroStatus, filtroPesquisa, sortField, sortOrder, viewMode]);

  // Estatísticas
  const stats = useMemo(() => {
    if (!empresas) return { total: 0, comWhats: 0, comSite: 0 };
    return {
      total: empresas.length,
      comWhats: empresas.filter(e => e.telefone).length,
      comSite: empresas.filter(e => e.website).length
    };
  }, [empresas]);

  // Formatar telefone para WhatsApp
  const formatarParaWhatsApp = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');
    if (!numeros.startsWith('55')) {
      return '55' + numeros;
    }
    return numeros;
  };

  // Abrir WhatsApp
  const abrirWhatsApp = (telefone: string) => {
    const numero = formatarParaWhatsApp(telefone);
    window.open(`https://wa.me/${numero}`, '_blank');
  };

  // Ligar
  const ligar = (telefone: string) => {
    window.open(`tel:${telefone}`, '_self');
  };

  // Copiar telefone
  const copiarTelefone = async (telefone: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(telefone);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // Mudar status
  const handleStatusChange = async (empresaId: Id<"empresas">, novoStatus: StatusType) => {
    try {
      await updateStatus({ id: empresaId, status: novoStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
    setEmpresaMenuAberto(null);
  };

  // Toggle ordenação
  const toggleSort = (field: 'titulo' | 'avaliacao' | 'capturadoEm') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (empresas === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        {/* Título e Stats */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building className="text-accent" size={24} />
              <h1 className="text-lg font-semibold text-foreground">Empresas</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle de visualização */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'lista' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Visualização em lista"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'kanban' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Visualização em Kanban"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">{stats.total} total</span>
                <span className="text-green-600 flex items-center gap-1">
                  <MessageCircle size={12} /> {stats.comWhats}
                </span>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar empresa, telefone, endereço..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Filter size={14} />
            <span>Filtros</span>
            {(filtroStatus !== 'todos' || filtroPesquisa !== 'todos') && (
              <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-xs rounded">
                {(filtroStatus !== 'todos' ? 1 : 0) + (filtroPesquisa !== 'todos' ? 1 : 0)}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform ${showFiltros ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFiltros && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Filtro por Pesquisa */}
                {pesquisasUnicas.length > 0 && (
                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Pesquisa</label>
                    <select
                      value={filtroPesquisa}
                      onChange={(e) => setFiltroPesquisa(e.target.value)}
                      className="w-full md:w-auto px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="todos">Todas as pesquisas</option>
                      {pesquisasUnicas.map(pesquisa => (
                        <option key={pesquisa} value={pesquisa}>{pesquisa}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro por Status - só no modo lista */}
                {viewMode === 'lista' && (
                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFiltroStatus('todos')}
                        className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                          filtroStatus === 'todos'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Todos
                      </button>
                      {statusOrder.map(status => (
                        <button
                          key={status}
                          onClick={() => setFiltroStatus(status)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            filtroStatus === status
                              ? `${statusConfig[status].bg} ${statusConfig[status].color}`
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {statusConfig[status].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botão limpar filtros */}
                {(filtroStatus !== 'todos' || filtroPesquisa !== 'todos') && (
                  <button
                    onClick={() => {
                      setFiltroStatus('todos');
                      setFiltroPesquisa('todos');
                    }}
                    className="mt-3 text-xs text-accent hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cabeçalho da Tabela - Desktop (só no modo lista) */}
        {viewMode === 'lista' && (
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground border-t border-border">
            <button
              onClick={() => toggleSort('titulo')}
              className="col-span-3 flex items-center gap-1 hover:text-foreground text-left"
            >
              Empresa
              {sortField === 'titulo' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
            <div className="col-span-2">Telefone</div>
            <div className="col-span-3">Endereço</div>
            <button
              onClick={() => toggleSort('avaliacao')}
              className="col-span-1 flex items-center gap-1 hover:text-foreground"
            >
              Nota
              {sortField === 'avaliacao' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {viewMode === 'kanban' ? (
        /* Visualização Kanban */
        <div className="p-4">
          <KanbanBoard empresas={empresasFiltradas} />
        </div>
      ) : (
        /* Visualização Lista */
        <div className="divide-y divide-border">
          {empresasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Nenhuma empresa encontrada</p>
              <p className="text-sm">Tente ajustar os filtros</p>
            </div>
          ) : (
            empresasFiltradas.map((empresa) => (
              <div
                key={empresa._id}
                className="bg-card hover:bg-muted/30 transition-colors"
              >
                {/* Layout Mobile */}
                <div className="md:hidden p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{empresa.titulo}</h3>
                      <p className="text-xs text-muted-foreground truncate">{empresa.categoria}</p>
                    </div>
                    {/* Status clicável no mobile */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmpresaMenuAberto(empresaMenuAberto === empresa._id ? null : empresa._id);
                        }}
                        className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[empresa.status].bg} ${statusConfig[empresa.status].color}`}
                      >
                        {statusConfig[empresa.status].label}
                      </button>

                      {/* Menu de Status Mobile */}
                      {empresaMenuAberto === empresa._id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setEmpresaMenuAberto(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-40"
                          >
                            <div className="p-2 text-xs font-medium text-muted-foreground border-b border-border">
                              Mudar Status
                            </div>
                            {statusOrder.map(status => (
                              <button
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(empresa._id, status);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                                  empresa.status === status ? statusConfig[status].color + ' font-medium' : ''
                                }`}
                              >
                                {empresa.status === status && <CheckCircle size={14} />}
                                {statusConfig[status].label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-3 text-sm">
                    {empresa.telefone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} />
                        <span>{empresa.telefone}</span>
                        <button
                          onClick={(e) => copiarTelefone(empresa.telefone!, empresa._id, e)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {copiadoId === empresa._id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                    {empresa.endereco && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{empresa.endereco}</span>
                      </div>
                    )}
                    {empresa.avaliacao && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>{empresa.avaliacao} ({empresa.totalAvaliacoes || 0} avaliações)</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação Mobile */}
                  <div className="flex gap-2">
                    {empresa.telefone && (
                      <>
                        <button
                          onClick={() => abrirWhatsApp(empresa.telefone!)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          <MessageCircle size={18} />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => ligar(empresa.telefone!)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          <Phone size={18} />
                        </button>
                      </>
                    )}
                    {empresa.website && (
                      <a
                        href={empresa.website.startsWith('http') ? empresa.website : `https://${empresa.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm transition-colors"
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Layout Desktop - Tabela */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm group">
                  <div className="col-span-3">
                    <p className="font-medium text-foreground truncate">{empresa.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">{empresa.categoria}</p>
                  </div>
                  <div className="col-span-2">
                    {empresa.telefone ? (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{empresa.telefone}</span>
                        <button
                          onClick={(e) => copiarTelefone(empresa.telefone!, empresa._id, e)}
                          className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiadoId === empresa._id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="text-muted-foreground truncate">{empresa.endereco || '-'}</p>
                  </div>
                  <div className="col-span-1">
                    {empresa.avaliacao ? (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span>{empresa.avaliacao}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmpresaMenuAberto(empresaMenuAberto === empresa._id ? null : empresa._id);
                        }}
                        className={`px-2 py-1 text-xs rounded-full ${statusConfig[empresa.status].bg} ${statusConfig[empresa.status].color} hover:opacity-80 transition-opacity`}
                      >
                        {statusConfig[empresa.status].label}
                      </button>

                      {empresaMenuAberto === empresa._id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setEmpresaMenuAberto(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-40"
                          >
                            {statusOrder.map(status => (
                              <button
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(empresa._id, status);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors ${
                                  empresa.status === status ? statusConfig[status].color + ' font-medium' : ''
                                }`}
                              >
                                {empresa.status === status && <Check size={12} />}
                                {statusConfig[status].label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {empresa.telefone && (
                      <>
                        <button
                          onClick={() => abrirWhatsApp(empresa.telefone!)}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => ligar(empresa.telefone!)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Ligar"
                        >
                          <Phone size={18} />
                        </button>
                      </>
                    )}
                    {empresa.website && (
                      <a
                        href={empresa.website.startsWith('http') ? empresa.website : `https://${empresa.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Abrir site"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contador no final - só no modo lista */}
      {empresasFiltradas.length > 0 && viewMode === 'lista' && (
        <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
          Mostrando {empresasFiltradas.length} de {stats.total} empresas
        </div>
      )}
    </div>
  );
};

export default EmpresasPage;
