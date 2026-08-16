import React, { useState } from "react";
import {
  Home,
  Plus,
  Search,
  Filter,
  Grid3X3,
  ListFilter,
  Building,
  MapPin,
  Bed,
  Car,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Tag,
  DollarSign,
  User,
} from "lucide-react";
import { Property, PropertyType, PropertyStatus, Broker } from "../../types/senaCrm";

interface PropertiesModuleProps {
  properties: Property[];
  brokers: Broker[];
  onAddProperty: (newProp: Partial<Property>) => void;
  onSelectProperty: (property: Property) => void;
}

export const PropertiesModule: React.FC<PropertiesModuleProps> = ({
  properties,
  brokers,
  onAddProperty,
  onSelectProperty,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");

  const [isNewPropModalOpen, setIsNewPropModalOpen] = useState(false);

  // New Property Form State
  const [propTitle, setPropTitle] = useState("");
  const [propType, setPropType] = useState<PropertyType>("Casa Residencial");
  const [propPurpose, setPropPurpose] = useState<"venda" | "locacao" | "ambos">("venda");
  const [propSalePrice, setPropSalePrice] = useState<number>(3500000);
  const [propRentalPrice, setPropRentalPrice] = useState<number>(15000);
  const [propOwnerName, setPropOwnerName] = useState("");
  const [propOwnerPhone, setPropOwnerPhone] = useState("");
  const [propBrokerCaptatorId, setPropBrokerCaptatorId] = useState(brokers[0]?.id || "");
  const [propAddress, setPropAddress] = useState("");
  const [propNeighborhood, setPropNeighborhood] = useState("");
  const [propCity, setPropCity] = useState("São Paulo");
  const [propTotalArea, setPropTotalArea] = useState(450);
  const [propPrivateArea, setPropPrivateArea] = useState(380);
  const [propBedrooms, setPropBedrooms] = useState(4);
  const [propSuites, setPropSuites] = useState(4);
  const [propParkingSpots, setPropParkingSpots] = useState(4);
  const [propIsExclusive, setPropIsExclusive] = useState(true);
  const [propImageUrl, setPropImageUrl] = useState(
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
  );

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || prop.type === typeFilter;
    const matchesStatus = statusFilter === "all" || prop.status === statusFilter;
    const matchesPurpose = purposeFilter === "all" || prop.purpose === purposeFilter;

    return matchesSearch && matchesType && matchesStatus && matchesPurpose;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle) return;

    const captator = brokers.find((b) => b.id === propBrokerCaptatorId);
    const newCode = `SENA-${800 + properties.length + 1}`;

    onAddProperty({
      code: newCode,
      title: propTitle,
      type: propType,
      purpose: propPurpose,
      ownerName: propOwnerName || "Proprietário Privativo",
      ownerPhone: propOwnerPhone || "(11) 99999-8888",
      brokerCaptatorId: propBrokerCaptatorId,
      brokerCaptatorName: captator?.name || "Rodrigo Mendonça",
      salePrice: propPurpose === "locacao" ? 0 : Number(propSalePrice),
      rentalPrice: propPurpose === "venda" ? undefined : Number(propRentalPrice),
      address: propAddress || "Rua Principal, 100",
      neighborhood: propNeighborhood || "Alphaville",
      city: propCity,
      state: "SP",
      totalArea: Number(propTotalArea),
      privateArea: Number(propPrivateArea),
      bedrooms: Number(propBedrooms),
      suites: Number(propSuites),
      bathrooms: Number(propSuites) + 2,
      parkingSpots: Number(propParkingSpots),
      features: ["Piscina", "Espaço Gourmet", "Automação", "Segurança 24h"],
      images: [propImageUrl],
      documentationStatus: "100% Regularizada",
      isExclusive: propIsExclusive,
      status: "Disponível",
      createdAt: new Date().toISOString().split("T")[0],
      viewsCount: 1,
    });

    setIsNewPropModalOpen(false);
    setPropTitle("");
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case "Disponível":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Em Negociação":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Reservado":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Vendido":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Alugado":
        return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "Em Captação":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "Suspenso":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar código, título, bairro..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Purpose Filter */}
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Venda & Locação</option>
            <option value="venda">Apenas Venda</option>
            <option value="locacao">Apenas Locação</option>
            <option value="ambos">Venda ou Locação</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Status</option>
            <option value="Disponível">Disponível</option>
            <option value="Em Negociação">Em Negociação</option>
            <option value="Reservado">Reservado</option>
            <option value="Vendido">Vendido</option>
            <option value="Alugado">Alugado</option>
            <option value="Em Captação">Em Captação</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Casa Residencial">Casa Residencial</option>
            <option value="Cobertura Duplex">Cobertura Duplex</option>
            <option value="Apartamento Padrão">Apartamento Padrão</option>
            <option value="Terreno / Lote">Terreno / Lote</option>
            <option value="Sala Comercial">Sala Comercial</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* Grid vs Table View */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Visualização em Cards"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "table"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Visualização em Tabela"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsNewPropModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Novo Imóvel
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Photo & Overlays */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-extrabold text-amber-300 backdrop-blur-xs border border-amber-500/30">
                      {property.code}
                    </span>
                    {property.isExclusive && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-[10px] font-bold text-slate-950 shadow-xs">
                        Exclusividade SENA
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-xs border ${getStatusBadge(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-slate-950/80 text-[11px] font-semibold text-slate-200">
                    {property.type}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {property.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {property.neighborhood}, {property.city} - {property.state}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="pt-2">
                    {property.purpose === "locacao" ? (
                      <div className="text-base font-black text-amber-400">
                        {formatCurrency(property.rentalPrice || 0)}{" "}
                        <span className="text-xs font-normal text-slate-400">/mês</span>
                      </div>
                    ) : property.purpose === "ambos" ? (
                      <div>
                        <span className="text-base font-black text-amber-400">
                          {formatCurrency(property.salePrice)}
                        </span>
                        <span className="text-xs text-slate-400 block font-normal">
                          ou {formatCurrency(property.rentalPrice || 0)} /mês
                        </span>
                      </div>
                    ) : (
                      <div className="text-base font-black text-amber-400">
                        {formatCurrency(property.salePrice)}
                      </div>
                    )}
                  </div>

                  {/* Features / Dimensions Specs */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-300 text-center">
                    <div className="p-1 rounded bg-slate-850">
                      <span className="text-[10px] text-slate-400 block">Área</span>
                      <span className="font-bold text-white">{property.totalArea}m²</span>
                    </div>
                    <div className="p-1 rounded bg-slate-850">
                      <span className="text-[10px] text-slate-400 block">Quartos</span>
                      <span className="font-bold text-white">{property.bedrooms}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-850">
                      <span className="text-[10px] text-slate-400 block">Suítes</span>
                      <span className="font-bold text-white">{property.suites}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-850">
                      <span className="text-[10px] text-slate-400 block">Vagas</span>
                      <span className="font-bold text-white">{property.parkingSpots}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Captator & Action */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 truncate">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">
                    Captador:{" "}
                    <strong className="text-slate-200">
                      {property.brokerCaptatorName.split(" ")[0]}
                    </strong>
                  </span>
                </div>

                <span className="text-[11px] text-amber-400 font-semibold group-hover:underline">
                  Ver Ficha →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Código & Imóvel</th>
                  <th className="py-3 px-4">Tipo & Bairro</th>
                  <th className="py-3 px-4">Valores (Venda / Aluguel)</th>
                  <th className="py-3 px-4">Metragem & Cômodos</th>
                  <th className="py-3 px-4">Captador & Proprietário</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-amber-400 block">{prop.code}</span>
                      <span className="font-bold text-white line-clamp-1">{prop.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{prop.type}</div>
                      <div className="text-[11px] text-slate-400">
                        {prop.neighborhood}, {prop.city}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {prop.purpose === "locacao" ? (
                        <div className="font-bold text-amber-400">
                          {formatCurrency(prop.rentalPrice || 0)} /mês
                        </div>
                      ) : (
                        <div className="font-bold text-amber-400">
                          {formatCurrency(prop.salePrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        {prop.totalArea}m² totais ({prop.privateArea}m² priv.)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {prop.bedrooms} qtos ({prop.suites} suítes) • {prop.parkingSpots} vagas
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{prop.brokerCaptatorName}</div>
                      <div className="text-[11px] text-slate-400">Prop: {prop.ownerName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(prop.status)}`}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectProperty(prop)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
                      >
                        Abrir Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Property Form */}
      {isNewPropModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Cadastrar Novo Imóvel no Acervo</h3>
                <p className="text-xs text-slate-400">
                  Inserção de nova captação exclusiva ou padrão
                </p>
              </div>
              <button
                onClick={() => setIsNewPropModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Título do Imóvel *
                  </label>
                  <input
                    type="text"
                    required
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    placeholder="Ex: Mansão Suspensa com Vista para o Parque Ibirapuera"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tipo de Imóvel</label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as PropertyType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Casa Residencial">Casa Residencial</option>
                    <option value="Apartamento Padrão">Apartamento Padrão</option>
                    <option value="Cobertura Duplex">Cobertura Duplex</option>
                    <option value="Sobrado em Condomínio">Sobrado em Condomínio</option>
                    <option value="Terreno / Lote">Terreno / Lote</option>
                    <option value="Sala Comercial">Sala Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Finalidade Comercial
                  </label>
                  <select
                    value={propPurpose}
                    onChange={(e) => setPropPurpose(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="venda">Apenas Venda</option>
                    <option value="locacao">Apenas Locação</option>
                    <option value="ambos">Venda e Locação</option>
                  </select>
                </div>

                {propPurpose !== "locacao" && (
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Valor de Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={propSalePrice}
                      onChange={(e) => setPropSalePrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-bold text-amber-300"
                    />
                  </div>
                )}

                {propPurpose !== "venda" && (
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Valor de Locação Mensal (R$)
                    </label>
                    <input
                      type="number"
                      value={propRentalPrice}
                      onChange={(e) => setPropRentalPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-bold text-amber-300"
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Bairro / Condomínio *
                  </label>
                  <input
                    type="text"
                    required
                    value={propNeighborhood}
                    onChange={(e) => setPropNeighborhood(e.target.value)}
                    placeholder="Ex: Alphaville Residencial 1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={propCity}
                    onChange={(e) => setPropCity(e.target.value)}
                    placeholder="São Paulo / Barueri"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Nome do Proprietário
                  </label>
                  <input
                    type="text"
                    value={propOwnerName}
                    onChange={(e) => setPropOwnerName(e.target.value)}
                    placeholder="Ex: Dr. Roberto Martins"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Telefone do Proprietário
                  </label>
                  <input
                    type="text"
                    value={propOwnerPhone}
                    onChange={(e) => setPropOwnerPhone(e.target.value)}
                    placeholder="(11) 98888-9999"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Corretor Captador
                  </label>
                  <select
                    value={propBrokerCaptatorId}
                    onChange={(e) => setPropBrokerCaptatorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.creci})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Foto Principal (URL)
                  </label>
                  <input
                    type="text"
                    value={propImageUrl}
                    onChange={(e) => setPropImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dimensions specs */}
              <div className="grid grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Área Total (m²)</label>
                  <input
                    type="number"
                    value={propTotalArea}
                    onChange={(e) => setPropTotalArea(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Quartos</label>
                  <input
                    type="number"
                    value={propBedrooms}
                    onChange={(e) => setPropBedrooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Suítes</label>
                  <input
                    type="number"
                    value={propSuites}
                    onChange={(e) => setPropSuites(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Vagas</label>
                  <input
                    type="number"
                    value={propParkingSpots}
                    onChange={(e) => setPropParkingSpots(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPropModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  Cadastrar Imóvel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
