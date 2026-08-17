import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Search,
  Sparkles,
  Home,
  CheckCircle2,
  Building,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Filter,
  ArrowRight,
  SlidersHorizontal,
  ThumbsUp,
} from "lucide-react";
import type { ClientDto } from "@sena/shared";
import type { Property } from "../../types/senaCrm";
import { useClients } from "../../hooks/useClients";
import { useInterestProfile } from "../../hooks/useInterestProfile";
import { useMatches } from "../../hooks/useMatches";

interface ClientsMatchingModuleProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onSelectLead?: (lead: any) => void;
}

export const ClientsMatchingModule: React.FC<ClientsMatchingModuleProps> = ({
  properties,
  onSelectProperty,
}) => {
  const { clients, isLoading: clientsLoading } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientType, setSelectedClientType] = useState<string>("all");

  // Load interest profile and matches for selected client
  const { profile, loadProfile } = useInterestProfile(selectedClientId);
  const { matches, reload: reloadMatches } = useMatches(selectedClientId);

  // Set initial selected client
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  // Load profile when client changes
  useEffect(() => {
    if (selectedClientId) {
      loadProfile();
    }
  }, [selectedClientId]);

  // Reload matches when profile changes
  useEffect(() => {
    if (selectedClientId) {
      reloadMatches();
    }
  }, [profile]);

  const filteredClients = clients.filter((client) => {
    const matchesType =
      selectedClientType === "all" ||
      client.type === selectedClientType;
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.documentMasked?.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const currentClient = clients.find((c) => c.id === selectedClientId);

  const formatCurrency = (val?: number) => {
    if (!val) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filters */}
          {["all", "PERSON", "COMPANY"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedClientType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedClientType === type
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {type === "all" ? "Todos" : type === "PERSON" ? "Pessoas" : "Empresas"}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Dual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clients List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs flex flex-col h-[76vh]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Clientes ({filteredClients.length})
            </span>
            <span className="text-[10px] text-slate-400">Clique para matching</span>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
            {clientsLoading ? (
              <div className="text-xs text-slate-400 text-center py-8">Carregando...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">Nenhum cliente encontrado</div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = client.id === selectedClientId;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-amber-500/80 shadow-md shadow-amber-500/10"
                        : "bg-slate-850/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{client.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/20 capitalize">
                        {client.type === "PERSON" ? "PF" : "PJ"}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{client.documentMasked || "---"}</span>
                      <span>{client.responsibleBrokerName?.split(" ")[0] || "---"}</span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400">
                      {client.phone && <span>📞 {client.phone}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Profile & Matching */}
        <div className="lg:col-span-8 space-y-5">
          {/* Client Profile Header */}
          {currentClient && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      {currentClient.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 capitalize">
                      {currentClient.type === "PERSON" ? "Pessoa Física" : "Pessoa Jurídica"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentClient.documentMasked} • {currentClient.responsibleBrokerName || "Sem corretor"}
                  </p>
                </div>

                {currentClient.phone && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300">{currentClient.phone}</span>
                  </div>
                )}
              </div>

              {/* Interest Profile */}
              {profile ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Objetivo</span>
                    <span className="font-bold text-white uppercase">
                      {profile.objective === "BUY" ? "Compra" : "Locação"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Faixa Preço</span>
                    <span className="font-bold text-white text-[10px]">
                      {formatCurrency(profile.minPrice)} - {formatCurrency(profile.maxPrice)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Quartos</span>
                    <span className="font-bold text-white">
                      {profile.minBedrooms || "-"}+
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Suites</span>
                    <span className="font-bold text-white">
                      {profile.minSuites || "-"}+
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-3 text-xs text-slate-400">
                  📋 Perfil de interesse não configurado. Configure para ver matching.
                </div>
              )}
            </div>
          )}

          {/* Matching Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                Imóveis com Maior Afinidade
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              {matches.length} imóvel(is)
            </span>
          </div>

          {/* Matching Results Grid */}
          {matches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              {profile ? "Nenhum matching encontrado" : "Configure o perfil para ver matches"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.slice(0, 4).map(({ property, score, reasons }) => {
                const matchedProp = properties.find((p) => p.id === property.id);
                if (!matchedProp) return null;

                return (
                  <div
                    key={property.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image & Badge */}
                      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                        <img
                          src={matchedProp.images?.[0] || "https://via.placeholder.com/400x300?text=Property"}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs border border-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{score}%</span>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white uppercase">
                          {property.code} • {property.type}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h5 className="font-bold text-xs text-white line-clamp-1">{property.title}</h5>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>
                            {property.neighborhood}, {property.city}
                          </span>
                        </div>

                        <div className="text-sm font-black text-amber-400 mt-1">
                          {property.purpose === "venda"
                            ? formatCurrency(property.salePrice)
                            : `${formatCurrency(property.rentalPrice)} /mês`}
                        </div>

                        {/* Reasons */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Critérios:
                          </span>
                          {reasons.slice(0, 2).map((reason, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center gap-1.5 text-[11px] text-slate-300"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => onSelectProperty(matchedProp)}
                        className="text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        Ver Ficha
                      </button>
                      <button
                        onClick={() => onSelectProperty(matchedProp)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <span>Apresentar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
