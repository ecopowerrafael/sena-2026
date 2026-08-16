export type LeadStatus =
  | "novo"
  | "contato"
  | "qualificado"
  | "apresentado"
  | "visita"
  | "proposta"
  | "negociacao"
  | "fechado"
  | "perdido";

export type ClientType = "comprador" | "proprietario" | "locador" | "locatario" | "investidor";

export type LeadOrigin =
  | "Placa no Imóvel"
  | "Outdoor"
  | "Instagram Ads"
  | "WhatsApp Direto"
  | "Facebook Ads"
  | "Google Ads"
  | "Indicação"
  | "Plantão de Vendas"
  | "Evento de Lançamento"
  | "Corretor Parceiro"
  | "Prospecção Ativa"
  | "Portal Imobiliário"
  | "Outros";

export interface ClientProfile {
  objective: "compra" | "locacao";
  propertyTypes: string[];
  preferredNeighborhoods: string[];
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minSuites?: number;
  minParkingSpots?: number;
  paymentMethod: "A Vista" | "Financiamento" | "Permuta" | "Parcelamento Direto" | "FGTS";
  needsFinancing: boolean;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  document: string; // CPF/CNPJ
  phone: string;
  whatsapp: string;
  email: string;
  type: ClientType;
  brokerId: string;
  brokerName: string;
  origin: LeadOrigin;
  campaign?: string;
  status: LeadStatus;
  lostReason?: string;
  createdAt: string;
  lastContact: string;
  nextContact?: string;
  estimatedBudget: number;
  interestedInPropertyId?: string;
  interestedInPropertyTitle?: string;
  interestProfile?: ClientProfile;
  notes: string;
}

export type PropertyType =
  | "Casa Residencial"
  | "Apartamento Padrão"
  | "Cobertura Duplex"
  | "Sobrado em Condomínio"
  | "Terreno / Lote"
  | "Chácara / Sítio"
  | "Sala Comercial"
  | "Galpão Industrial"
  | "Prédio Inteiro";

export type PropertyStatus =
  "Em Captação" | "Disponível" | "Reservado" | "Em Negociação" | "Vendido" | "Alugado" | "Suspenso";

export interface Property {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  purpose: "venda" | "locacao" | "ambos";
  ownerName: string;
  ownerPhone: string;
  brokerCaptatorId: string;
  brokerCaptatorName: string;
  salePrice: number;
  rentalPrice?: number;
  condoFee?: number;
  iptu?: number;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  totalArea: number;
  privateArea: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  features: string[];
  images: string[];
  documentationStatus: "100% Regularizada" | "Em Inventário" | "Habite-se Pendente" | "Financiável";
  isExclusive: boolean;
  status: PropertyStatus;
  createdAt: string;
  viewsCount: number;
}

export interface Broker {
  id: string;
  name: string;
  creci: string;
  phone: string;
  email: string;
  avatar: string;
  managerName: string;
  team: string;
  status: "Ativo" | "Férias" | "Inativo";
  leadsCount: number;
  salesCount: number;
  rentalsCount: number;
  vgvTotal: number;
  commissionEarned: number;
  conversionRate: number;
}

export interface Visit {
  id: string;
  clientName: string;
  clientPhone: string;
  propertyCode: string;
  propertyTitle: string;
  propertyAddress: string;
  brokerName: string;
  date: string;
  time: string;
  status: "Agendada" | "Realizada" | "Cancelada" | "Cliente Não Compareceu";
  feedback?: string;
  clientImpression?:
    | "Adorou / Fará Proposta"
    | "Gostou mas achou caro"
    | "Imóvel pequeno"
    | "Localização desfavorável"
    | "Sem interesse";
}

export interface Proposal {
  id: string;
  code: string;
  clientName: string;
  clientDocument: string;
  propertyCode: string;
  propertyTitle: string;
  brokerName: string;
  advertisedPrice: number;
  proposedPrice: number;
  downPayment: number;
  installmentsCount: number;
  installmentsValue: number;
  paymentMethodDescription: string;
  counterProposalPrice?: number;
  counterProposalNotes?: string;
  status:
    | "Em Análise"
    | "Aceita pelo Proprietário"
    | "Contraproposta Enviada"
    | "Recusada"
    | "Convertida em Venda";
  createdAt: string;
  updatedAt: string;
  history: { date: string; author: string; action: string }[];
}

export interface SaleClosure {
  id: string;
  code: string;
  clientName: string;
  ownerName: string;
  propertyCode: string;
  propertyTitle: string;
  brokerName: string;
  captatorName: string;
  finalSalePrice: number;
  saleDate: string;
  paymentType:
    "Financiamento Bancário" | "À Vista TED/PIX" | "Parcelamento Direto" | "Permuta + Saldo";
  bankFinancing?: { bank: string; approvedAmount: number; status: string };
  documentationStatus: "Escritura Lavrada" | "Contrato Assinado" | "Em Análise Jurídica";
  contractNumber: string;
  commissionTotal: number;
}

export interface CommissionDistribution {
  saleCode: string;
  propertyTitle: string;
  saleValue: number;
  totalCommissionPercentage: number;
  totalCommissionValue: number;
  agencySharePercentage: number;
  agencyShareValue: number;
  managerSharePercentage: number;
  managerShareValue: number;
  captatorSharePercentage: number;
  captatorShareValue: number;
  attendantBrokerSharePercentage: number;
  attendantBrokerShareValue: number;
  negotiationSharePercentage: number;
  negotiationShareValue: number;
  partnerSharePercentage: number;
  partnerShareValue: number;
  status: "Prevista" | "Recebida" | "Distribuída Parcial" | "Quitada";
  receivedDate?: string;
  payoutDate?: string;
}

export type RentalFunnelStage =
  | "Lead Inicial"
  | "Visita Agendada"
  | "Análise Cadastral / Score"
  | "Aprovação & Garantia"
  | "Contrato & Assinatura"
  | "Vistoria Inicial"
  | "Entrega das Chaves";

export interface RentalContract {
  id: string;
  contractNumber: string;
  propertyCode: string;
  propertyTitle: string;
  propertyAddress: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  ownerName: string;
  ownerPhone: string;
  ownerPixKey: string;
  monthlyRentalValue: number;
  condoFee: number;
  iptuFee: number;
  startDate: string;
  endDate: string;
  dueDay: number;
  guaranteeType:
    | "Seguro Fiança (Porto Seguro)"
    | "CredPago"
    | "Fiador com Imóvel"
    | "Título de Capitalização"
    | "Depósito Caução";
  adminFeePercentage: number; // e.g. 10%
  readjustmentIndex: "IPCA (IBGE)" | "IGP-M (FGV)" | "IVAR (FGV)";
  nextReadjustmentDate: string;
  status: "Ativo" | "Em Renovação" | "Atrasado" | "Em Distrato" | "Encerrado";
  paymentStatus: "Pago" | "A Vencer" | "Vencido" | "Em Atraso";
}

export interface RentalPayout {
  id: string;
  contractNumber: string;
  propertyTitle: string;
  ownerName: string;
  competenceMonth: string; // e.g. "08/2026"
  grossRentReceived: number;
  adminFeeDeduction: number;
  authorizedExpensesDeduction: number; // IPTU, conserto, taxa
  netOwnerPayout: number;
  dueDate: string;
  paidDate?: string;
  receiptNumber?: string;
  status:
    "Aguardando Recebimento" | "Recebido do Locatário" | "Repassado ao Proprietário" | "Em Atraso";
}

export interface Inspection {
  id: string;
  code: string;
  propertyCode: string;
  propertyTitle: string;
  type: "Vistoria de Entrada" | "Vistoria Periódica" | "Vistoria de Saída";
  inspectorName: string;
  date: string;
  status: "Agendada" | "Em Elaboração" | "Aprovada pelas Partes" | "Contestações Pendentes";
  photosCount: number;
  generalObservations: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyCode: string;
  propertyTitle: string;
  tenantName: string;
  issueDescription: string;
  serviceProviderName: string;
  budgetAmount: number;
  approvedByOwner: boolean;
  status: "Solicitado" | "Em Orçamento" | "Aprovado" | "Em Execução" | "Concluído";
  openedAt: string;
  resolvedAt?: string;
}

export type LotStatus =
  "Disponivel" | "Reservado" | "Em Proposta" | "Vendido" | "Bloqueado" | "Distrato";

export interface Lot {
  id: string;
  developmentId: string;
  block: string; // Quadra (ex: "Quadra A")
  lotNumber: string; // Número (ex: "Lote 14")
  areaM2: number;
  basePrice: number;
  promotionalPrice?: number;
  minDownPayment: number;
  maxInstallments: number;
  status: LotStatus;
  reservedByClientName?: string;
  reservedByBrokerName?: string;
  reservedAt?: string;
  simulation?: {
    downPayment: number;
    installments: number;
    installmentValue: number;
    interestRateAnnual: number;
  };
}

export interface Development {
  id: string;
  name: string;
  developerCompany: string;
  location: string;
  launchDate: string;
  deliveryForecast: string;
  totalLots: number;
  totalBlocks: number;
  commissionPercentage: number;
  campaignName: string;
  status: "Lançamento Recente" | "Obras Avançadas" | "Pronto para Construir" | "Últimas Unidades";
  heroImage: string;
  totalVgv: number;
  soldVgv: number;
  lots: Lot[];
}
