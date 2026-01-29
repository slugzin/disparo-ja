import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Star, MapPin, Phone, Globe, MessageCircle } from 'lucide-react';
import type { EmpresaKanban } from '../../types/kanban';

interface KanbanCardProps {
  empresa: EmpresaKanban;
  onWhatsApp?: (empresa: EmpresaKanban) => void;
  isAContatar?: boolean;
  isDragging?: boolean;
}

export function KanbanCard({ empresa, onWhatsApp, isAContatar, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `empresa-${empresa._id}`,
    data: empresa
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition: 'transform 0.2s ease-in-out'
  } : undefined;

  const formatarParaWhatsApp = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');
    if (!numeros.startsWith('55')) {
      return '55' + numeros;
    }
    return numeros;
  };

  const abrirWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (empresa.telefone) {
      const numero = formatarParaWhatsApp(empresa.telefone);
      window.open(`https://wa.me/${numero}`, '_blank');
    }
  };

  const ligar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (empresa.telefone) {
      window.open(`tel:${empresa.telefone}`, '_self');
    }
  };

  const totalAvaliacoes = empresa.total_avaliacoes || empresa.totalAvaliacoes || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative bg-card backdrop-blur-sm border border-border rounded-xl overflow-hidden
        hover:border-accent/50 transition-all duration-300 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-0' : 'opacity-100'}
        transform-gpu hover:scale-[1.02] hover:-translate-y-1
        hover:shadow-xl hover:shadow-accent/10
      `}
    >
      {/* Card Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{empresa.titulo}</h3>
            <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium truncate max-w-full">
              {empresa.categoria || 'Sem categoria'}
            </span>
          </div>
        </div>

        {/* Avaliação */}
        {empresa.avaliacao && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-foreground font-medium text-xs">{empresa.avaliacao}</span>
            </div>
            {totalAvaliacoes > 0 && (
              <span className="text-muted-foreground text-xs">
                ({totalAvaliacoes})
              </span>
            )}
          </div>
        )}

        {/* Endereço */}
        {empresa.endereco && (
          <div className="flex items-start gap-1.5 text-muted-foreground text-xs">
            <MapPin size={10} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{empresa.endereco}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3">
        {/* Contatos */}
        <div className="space-y-1.5 mb-3">
          {empresa.telefone && (
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-green-500" />
              <span className="text-muted-foreground text-xs truncate">{empresa.telefone}</span>
            </div>
          )}

          {empresa.website && (
            <div className="flex items-center gap-2">
              <Globe size={12} className="text-blue-500" />
              <a
                href={empresa.website.startsWith('http') ? empresa.website : `https://${empresa.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-500 hover:text-blue-400 transition-colors text-xs truncate"
              >
                {empresa.website.replace(/^https?:\/\//, '').slice(0, 25)}
              </a>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        {empresa.telefone && (
          <div className="flex gap-2">
            <button
              onClick={abrirWhatsApp}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <button
              onClick={ligar}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Phone size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Efeito de Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
