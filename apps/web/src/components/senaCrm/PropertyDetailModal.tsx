import React from "react";
import {
  X,
  MapPin,
  Bed,
  Car,
  Maximize2,
  ShieldCheck,
  Calendar,
  DollarSign,
  User,
  Phone,
  Tag,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Property } from "../../types/senaCrm";

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onScheduleVisit?: (prop: Property) => void;
  onCreateProposal?: (prop: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onScheduleVisit,
  onCreateProposal,
}) => {
  if (!property) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Gallery & Header */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-950">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black">
              {property.code}
            </span>
            {property.isExclusive && (
              <span className="px-3 py-1 rounded-lg bg-slate-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold backdrop-blur-xs">
                Exclusividade SENA
              </span>
            )}
            <span className="px-3 py-1 rounded-lg bg-emerald-500/80 text-white text-xs font-bold">
              {property.status}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              {property.type} • {property.purpose.toUpperCase()}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white line-clamp-2">
              {property.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {property.address}, {property.neighborhood} — {property.city}/{property.state}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Price & Dimensions Spec Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Valor de Venda</span>
              <p className="text-base font-black text-amber-400">
                {property.salePrice > 0 ? formatCurrency(property.salePrice) : "Sob Consulta"}
              </p>
            </div>

            {property.rentalPrice && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Locação Mensal
                </span>
                <p className="text-base font-black text-teal-400">
                  {formatCurrency(property.rentalPrice)}/mês
                </p>
              </div>
            )}

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Área Total / Privativa
              </span>
              <p className="text-sm font-black text-white">
                {property.totalArea}m² ({property.privateArea}m²)
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Dormitórios & Vagas
              </span>
              <p className="text-sm font-black text-white">
                {property.bedrooms} qtos ({property.suites} suítes) • {property.parkingSpots} vg
              </p>
            </div>
          </div>

          {/* Features / Amenities */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Diferenciais & Características do Imóvel
            </h4>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feat, fIdx) => (
                <span
                  key={fIdx}
                  className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Internal Brokerage Data */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Dados Internos de Gestão da Imobiliária SENA
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Proprietário:</span>
                <strong className="text-white">{property.ownerName}</strong>
                <span className="text-[11px] text-slate-400 block">{property.ownerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Corretor Captador:</span>
                <strong className="text-white">{property.brokerCaptatorName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Status Documental:</span>
                <strong className="text-emerald-400">{property.documentationStatus}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Fechar Ficha
          </button>

          <div className="flex items-center gap-2">
            {onScheduleVisit && (
              <button
                onClick={() => {
                  onScheduleVisit(property);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
              >
                Agendar Visita
              </button>
            )}
            {onCreateProposal && (
              <button
                onClick={() => {
                  onCreateProposal(property);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all"
              >
                Criar Proposta Comercial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
