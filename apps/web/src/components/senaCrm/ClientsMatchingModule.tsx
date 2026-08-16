import React, { useState } from "react";
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
import { Lead, Property, ClientType } from "../../types/senaCrm";

interface ClientsMatchingModuleProps {
  leads: Lead[];
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onSelectLead: (lead: Lead) => void;
}

export const ClientsMatchingModule: React.FC<ClientsMatchingModuleProps> = ({
  leads,
  properties,
  onSelectProperty,
  onSelectLead,
}) => {
  const [selectedClientType, setSelectedClientType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || "");

  const filteredClients = leads.filter((lead) => {
    const matchesType = selectedClientType === "all" || lead.type === selectedClientType;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.document.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const currentSelectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Smart Real Estate Matching Algorithm for selected lead
  const calculateMatchingProperties = (lead?: Lead) => {
    if (!lead || !lead.interestProfile) {
      // Default match based on estimated budget
      return properties
        .map((prop) => {
          let score = 70;
          const price = prop.purpose === "locacao" ? (prop.rentalPrice || 0) * 100 : prop.salePrice;
          if (Math.abs(price - (lead?.estimatedBudget || 0)) < 1500000) score += 20;
          return {
            property: prop,
            score: Math.min(score, 98),
            reasons: ["Faixa de valor compatível"],
          };
        })
        .sort((a, b) => b.score - a.score);
    }

    const profile = lead.interestProfile;
    return properties
      .map((prop) => {
        let score = 50;
        const reasons: string[] = [];

        // Objective check
        if (
          (profile.objective === "compra" &&
            (prop.purpose === "venda" || prop.purpose === "ambos")) ||
          (profile.objective === "locacao" &&
            (prop.purpose === "locacao" || prop.purpose === "ambos"))
        ) {
          score += 15;
          reasons.push(`Finalidade compatível (${profile.objective})`);
        }

        // Property type check
        if (profile.propertyTypes.includes(prop.type)) {
          score += 15;
          reasons.push(`Tipo de imóvel: ${prop.type}`);
        }

        // Neighborhood check
        if (
          profile.preferredNeighborhoods.some((n) =>
            prop.neighborhood.toLowerCase().includes(n.toLowerCase())
          )
        ) {
          score += 15;
          reasons.push(`Localização no bairro desejado (${prop.neighborhood})`);
        }

        // Budget check
        const price = profile.objective === "locacao" ? prop.rentalPrice || 0 : prop.salePrice;
        if (price >= profile.minPrice && price <= profile.maxPrice) {
          score += 15;
          reasons.push("Dentro da faixa de preço estipulada");
        }

        // Bedrooms
        if (prop.bedrooms >= profile.minBedrooms) {
          score += 10;
          reasons.push(`Quartos adequados (${prop.bedrooms} dormitórios)`);
        }

        return {
          property: prop,
          score: Math.min(score, 99),
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const matchingResults = calculateMatchingProperties(currentSelectedLead);

  const formatCurrency = (val: number) => {
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
          {["all", "comprador", "locatario", "investidor", "proprietario"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedClientType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedClientType === type
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {type === "all" ? "Todos os Clientes" : type}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente ou documento..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Dual Layout: Client List & Active Matching Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clients List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs flex flex-col h-[76vh]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Base de Clientes ({filteredClients.length})
            </span>
            <span className="text-[10px] text-slate-400">Clique para matching</span>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
            {filteredClients.map((client) => {
              const isSelected = client.id === currentSelectedLead?.id;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedLeadId(client.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 border-amber-500/80 shadow-md shadow-amber-500/10"
                      : "bg-slate-850/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{client.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/20 capitalize">
                      {client.type}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Orçamento:{" "}
                      <strong className="text-amber-400">
                        {formatCurrency(client.estimatedBudget)}
                      </strong>
                    </span>
                    <span>{client.brokerName.split(" ")[0]}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 truncate">
                    {client.interestProfile
                      ? `🎯 ${client.interestProfile.propertyTypes.join(", ")} em ${client.interestProfile.preferredNeighborhoods.join(", ")}`
                      : "Sem perfil detalhado"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Client Interest Profile & Matching Properties (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Client Profile Header Card */}
          {currentSelectedLead && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      {currentSelectedLead.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 capitalize">
                      {currentSelectedLead.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    CPF/CNPJ: {currentSelectedLead.document} • Corretor:{" "}
                    {currentSelectedLead.brokerName}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Orçamento Máximo:</span>
                  <span className="text-sm font-black text-amber-300">
                    {formatCurrency(currentSelectedLead.estimatedBudget)}
                  </span>
                </div>
              </div>

              {/* Interest Profile Requirements Pill Grid */}
              {currentSelectedLead.interestProfile ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Objetivo</span>
                    <span className="font-bold text-white uppercase">
                      {currentSelectedLead.interestProfile.objective}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Tipos Desejados
                    </span>
                    <span className="font-bold text-white truncate block">
                      {currentSelectedLead.interestProfile.propertyTypes.join(", ")}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Bairros Preferidos
                    </span>
                    <span className="font-bold text-white truncate block">
                      {currentSelectedLead.interestProfile.preferredNeighborhoods.join(", ")}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Forma de Pagamento
                    </span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {currentSelectedLead.interestProfile.paymentMethod}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-3 text-xs text-slate-400">
                  Cadastre as preferências detalhadas no perfil do cliente para refinar o matching
                  algorítmico.
                </div>
              )}
            </div>
          )}

          {/* Matching Engine Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                Imóveis com Maior Afinidade de Matching
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              {matchingResults.length} imóveis avaliados
            </span>
          </div>

          {/* Matching Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingResults.slice(0, 4).map(({ property, score, reasons }) => (
              <div
                key={property.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Match Badge */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs border border-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{score}% Match</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white uppercase">
                      {property.code} • {property.type}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h5 className="font-bold text-xs text-white line-clamp-1">{property.title}</h5>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>
                        {property.neighborhood}, {property.city}
                      </span>
                    </div>

                    <div className="text-sm font-black text-amber-400 mt-1">
                      {property.purpose === "locacao"
                        ? `${formatCurrency(property.rentalPrice || 0)} /mês`
                        : formatCurrency(property.salePrice)}
                    </div>

                    {/* Compatibility Reasons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Critérios de Afinidade:
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

                {/* Footer Action */}
                <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Ver Ficha Completa
                  </button>
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>Apresentar ao Cliente</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
