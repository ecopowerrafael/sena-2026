import React, { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pathFromTab, tabFromPath } from "../../routes/senaRoutes";
import { useAuth } from "../../features/auth/AuthProvider";
import { useLeads } from "../../hooks/useLeads";
import { useBrokers } from "../../hooks/useBrokers";
import { useLeadOrigins } from "../../hooks/useLeadOrigins";
import { useLeadCampaigns } from "../../hooks/useLeadCampaigns";
import { SenaSidebar, SenaTab } from "./SenaSidebar";
import { SenaHeader } from "./SenaHeader";
import { DashboardModule } from "./DashboardModule";
import { LeadsFunnelModule } from "./LeadsFunnelModule";
import { ClientsMatchingModule } from "./ClientsMatchingModule";
import { PropertiesModule } from "./PropertiesModule";
import { VisitsModule } from "./VisitsModule";
import { ProposalsSalesModule } from "./ProposalsSalesModule";
import { CommissionsModule } from "./CommissionsModule";
import { RentalsModule } from "./RentalsModule";
import { DevelopmentsLotsModule } from "./DevelopmentsLotsModule";
import { BrokersModule } from "./BrokersModule";
import { ReportsModule } from "./ReportsModule";
import { PropertyDetailModal } from "./PropertyDetailModal";

import {
  INITIAL_PROPERTIES,
  INITIAL_VISITS,
  INITIAL_PROPOSALS,
  INITIAL_SALES,
  INITIAL_COMMISSIONS,
  INITIAL_RENTAL_CONTRACTS,
  INITIAL_RENTAL_PAYOUTS,
  INITIAL_INSPECTIONS,
  INITIAL_MAINTENANCE,
  INITIAL_DEVELOPMENTS,
} from "../../data/senaCrmData";

import {
  Lead,
  LeadStatus,
  Property,
  Broker,
  Visit,
  Proposal,
  SaleClosure,
  CommissionDistribution,
  RentalContract,
  RentalPayout,
  Inspection,
  MaintenanceRequest,
  Development,
  LotStatus,
} from "../../types/senaCrm";

interface SenaCrmAppProps {
  onBackToHome?: () => void;
}

export const SenaCrmApp: React.FC<SenaCrmAppProps> = ({ onBackToHome }) => {
  // A tab ativa passa a vir da URL (React Router); a aparência e o fluxo continuam iguais.
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = tabFromPath(location.pathname);
  const setCurrentTab = useCallback(
    (tab: SenaTab) => {
      navigate(pathFromTab(tab));
    },
    [navigate]
  );

  const { user, logout } = useAuth();
  const handleLogout = useCallback(() => {
    void logout().then(() => navigate("/login", { replace: true }));
  }, [logout, navigate]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // API Hooks for real data
  const { origins } = useLeadOrigins();
  const { campaigns } = useLeadCampaigns();
  const {
    leads: apiLeads,
    isLoading: leadsLoading,
    error: leadsError,
    addLead: apiAddLead,
    updateLeadStatus: apiUpdateLeadStatus,
  } = useLeads(origins, campaigns);
  const {
    brokers: apiBrokers,
    isLoading: brokersLoading,
    error: brokersError,
    addBroker: apiAddBroker,
  } = useBrokers();

  // Core State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [sales, setSales] = useState<SaleClosure[]>(INITIAL_SALES);
  const [commissions, setCommissions] = useState<CommissionDistribution[]>(INITIAL_COMMISSIONS);
  const [rentalContracts, setRentalContracts] =
    useState<RentalContract[]>(INITIAL_RENTAL_CONTRACTS);
  const [rentalPayouts, setRentalPayouts] = useState<RentalPayout[]>(INITIAL_RENTAL_PAYOUTS);
  const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [developments, setDevelopments] = useState<Development[]>(INITIAL_DEVELOPMENTS);

  // Modals
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<Property | null>(null);

  // Sync API data with local state
  useEffect(() => {
    setLeads(apiLeads);
  }, [apiLeads]);

  useEffect(() => {
    setBrokers(apiBrokers);
  }, [apiBrokers]);

  // Handlers: Leads
  const handleAddLead = async (newLead: Partial<Lead>) => {
    try {
      await apiAddLead(newLead);
    } catch (err) {
      console.error("Failed to add lead:", err);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus, lostReason?: string) => {
    try {
      await apiUpdateLeadStatus(leadId, newStatus, lostReason);
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  // Handlers: Properties
  const handleAddProperty = (newProp: Partial<Property>) => {
    const fullProp: Property = {
      id: `prop-${Date.now()}`,
      code: newProp.code || `SENA-${800 + properties.length + 1}`,
      title: newProp.title || "Imóvel Novo de Alto Padrão",
      type: newProp.type || "Casa Residencial",
      purpose: newProp.purpose || "venda",
      ownerName: newProp.ownerName || "Proprietário",
      ownerPhone: newProp.ownerPhone || "(11) 99999-9999",
      brokerCaptatorId: newProp.brokerCaptatorId || brokers[0]?.id || "brk-1",
      brokerCaptatorName: newProp.brokerCaptatorName || "Rodrigo Mendonça",
      salePrice: newProp.salePrice || 2500000,
      rentalPrice: newProp.rentalPrice,
      condoFee: newProp.condoFee || 1500,
      iptu: newProp.iptu || 500,
      address: newProp.address || "Rua Exemplo, 100",
      neighborhood: newProp.neighborhood || "Alphaville",
      city: newProp.city || "Barueri",
      state: "SP",
      totalArea: newProp.totalArea || 350,
      privateArea: newProp.privateArea || 300,
      bedrooms: newProp.bedrooms || 4,
      suites: newProp.suites || 3,
      bathrooms: newProp.bathrooms || 5,
      parkingSpots: newProp.parkingSpots || 4,
      features: newProp.features || ["Piscina", "Gourmet"],
      images: newProp.images || [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
      ],
      documentationStatus: "100% Regularizada",
      isExclusive: newProp.isExclusive ?? true,
      status: "Disponível",
      createdAt: new Date().toISOString().split("T")[0],
      viewsCount: 1,
    };
    setProperties([fullProp, ...properties]);
  };

  // Handlers: Visits
  const handleAddVisit = (newVisit: Partial<Visit>) => {
    const fullVisit: Visit = {
      id: `v-${Date.now()}`,
      clientName: newVisit.clientName || "Cliente",
      clientPhone: newVisit.clientPhone || "(11) 99999-9999",
      propertyCode: newVisit.propertyCode || "SENA-801",
      propertyTitle: newVisit.propertyTitle || "Imóvel",
      propertyAddress: newVisit.propertyAddress || "Endereço",
      brokerName: newVisit.brokerName || "Rodrigo Mendonça",
      date: newVisit.date || "2026-08-16",
      time: newVisit.time || "14:00",
      status: newVisit.status || "Agendada",
      feedback: newVisit.feedback || "",
    };
    setVisits([fullVisit, ...visits]);
  };

  const handleUpdateVisitFeedback = (
    visitId: string,
    feedback: string,
    impression: any,
    status: any
  ) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId ? { ...v, feedback, clientImpression: impression, status } : v
      )
    );
  };

  // Handlers: Proposals & Sales
  const handleAddProposal = (newProp: Partial<Proposal>) => {
    const fullProposal: Proposal = {
      id: `propdeal-${Date.now()}`,
      code: newProp.code || `PROP-2026-0${proposals.length + 50}`,
      clientName: newProp.clientName || "Cliente",
      clientDocument: newProp.clientDocument || "000.000.000-00",
      propertyCode: newProp.propertyCode || "SENA-801",
      propertyTitle: newProp.propertyTitle || "Imóvel",
      brokerName: newProp.brokerName || "Rodrigo Mendonça",
      advertisedPrice: newProp.advertisedPrice || 5000000,
      proposedPrice: newProp.proposedPrice || 4800000,
      downPayment: newProp.downPayment || 1000000,
      installmentsCount: 1,
      installmentsValue: (newProp.proposedPrice || 4800000) - (newProp.downPayment || 1000000),
      paymentMethodDescription: newProp.paymentMethodDescription || "À vista",
      status: "Em Análise",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      history: newProp.history || [],
    };
    setProposals([fullProposal, ...proposals]);
  };

  const handleSendCounterProposal = (proposalId: string, counterPrice: number, notes: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              counterProposalPrice: counterPrice,
              counterProposalNotes: notes,
              status: "Contraproposta Enviada",
              history: [
                ...p.history,
                {
                  date: `${new Date().toISOString().split("T")[0]} 14:00`,
                  author: "Gerência SENA / Proprietário",
                  action: `Contraproposta no valor de R$ ${counterPrice.toLocaleString("pt-BR")}. Obs: ${notes}`,
                },
              ],
            }
          : p
      )
    );
  };

  const handleApproveProposal = (proposalId: string, finalSaleDetails: Partial<SaleClosure>) => {
    // 1. Mark proposal as accepted
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: "Aceita pelo Proprietário",
              history: [
                ...p.history,
                {
                  date: `${new Date().toISOString().split("T")[0]} 16:30`,
                  author: "Diretoria SENA",
                  action: "Proposta aprovada com sucesso e venda homologada.",
                },
              ],
            }
          : p
      )
    );

    // 2. Create SaleClosure
    const fullSale: SaleClosure = {
      id: `sale-${Date.now()}`,
      code: finalSaleDetails.code || `VENDA-2026-0${sales.length + 20}`,
      clientName: finalSaleDetails.clientName || "Comprador",
      ownerName: finalSaleDetails.ownerName || "Vendedor",
      propertyCode: finalSaleDetails.propertyCode || "SENA-801",
      propertyTitle: finalSaleDetails.propertyTitle || "Imóvel",
      brokerName: finalSaleDetails.brokerName || "Rodrigo Mendonça",
      captatorName: finalSaleDetails.captatorName || "Rodrigo Mendonça",
      finalSalePrice: finalSaleDetails.finalSalePrice || 5000000,
      saleDate: new Date().toISOString().split("T")[0],
      paymentType: finalSaleDetails.paymentType || "Financiamento Bancário",
      bankFinancing: finalSaleDetails.bankFinancing,
      documentationStatus: "Contrato Assinado",
      contractNumber: finalSaleDetails.contractNumber || "CCV-SENA-2026",
      commissionTotal: finalSaleDetails.commissionTotal || 300000,
    };
    setSales([fullSale, ...sales]);

    // 3. Mark property as 'Vendido'
    setProperties((prev) =>
      prev.map((prop) =>
        prop.code === fullSale.propertyCode ? { ...prop, status: "Vendido" } : prop
      )
    );

    // 4. Create Commission Distribution (40% imobiliária, 10% gerente, 25% captador, 25% atendente)
    const commTotal = fullSale.commissionTotal;
    const newCommission: CommissionDistribution = {
      saleCode: fullSale.code,
      propertyTitle: fullSale.propertyTitle,
      saleValue: fullSale.finalSalePrice,
      totalCommissionPercentage: 6.0,
      totalCommissionValue: commTotal,
      agencySharePercentage: 40.0,
      agencyShareValue: commTotal * 0.4,
      managerSharePercentage: 10.0,
      managerShareValue: commTotal * 0.1,
      captatorSharePercentage: 25.0,
      captatorShareValue: commTotal * 0.25,
      attendantBrokerSharePercentage: 25.0,
      attendantBrokerShareValue: commTotal * 0.25,
      negotiationSharePercentage: 0,
      negotiationShareValue: 0,
      partnerSharePercentage: 0,
      partnerShareValue: 0,
      status: "Prevista",
    };
    setCommissions([newCommission, ...commissions]);
  };

  // Handlers: Lots
  const handleUpdateLotStatus = (
    devId: string,
    lotId: string,
    newStatus: LotStatus,
    buyerInfo?: any
  ) => {
    setDevelopments((prev) =>
      prev.map((d) => {
        if (d.id !== devId) return d;
        const updatedLots = d.lots.map((lot) => {
          if (lot.id !== lotId) return lot;
          return {
            ...lot,
            status: newStatus,
            reservedByClientName: buyerInfo?.reservedBy || lot.reservedByClientName,
          };
        });

        return {
          ...d,
          lots: updatedLots,
        };
      })
    );
  };

  // Handlers: Brokers
  const handleAddBroker = async (newB: any) => {
    try {
      await apiAddBroker(newB);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao criar corretor";
      throw new Error(errorMsg);
    }
  };

  const handleQuickModal = (type: "lead" | "property" | "proposal" | "visit") => {
    if (type === "lead") setCurrentTab("leads");
    if (type === "property") setCurrentTab("imoveis");
    if (type === "proposal") setCurrentTab("propostas");
    if (type === "visit") setCurrentTab("visitas");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <SenaSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onBackToPortfolio={() => {
          if (onBackToHome) onBackToHome();
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <SenaHeader
          currentTab={currentTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenQuickModal={handleQuickModal}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {currentTab === "dashboard" && (
            <DashboardModule
              leads={leads}
              properties={properties}
              brokers={brokers}
              rentalContracts={rentalContracts}
              sales={sales}
              developments={developments}
              onNavigateTab={setCurrentTab}
            />
          )}

          {(currentTab === "leads" || currentTab === "funil") && (
            <LeadsFunnelModule
              leads={leads}
              brokers={brokers}
              properties={properties}
              origins={origins}
              campaigns={campaigns}
              onAddLead={handleAddLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSelectLead={(l) => {}}
            />
          )}

          {(currentTab === "clientes" || currentTab === "proprietarios") && (
            <ClientsMatchingModule
              leads={leads}
              properties={properties}
              onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
              onSelectLead={(l) => {}}
            />
          )}

          {currentTab === "imoveis" && (
            <PropertiesModule
              properties={properties}
              brokers={brokers}
              onAddProperty={handleAddProperty}
              onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
            />
          )}

          {currentTab === "visitas" && (
            <VisitsModule
              visits={visits}
              properties={properties}
              brokers={brokers}
              leads={leads}
              onAddVisit={handleAddVisit}
              onUpdateVisitFeedback={handleUpdateVisitFeedback}
            />
          )}

          {(currentTab === "propostas" || currentTab === "vendas") && (
            <ProposalsSalesModule
              proposals={proposals}
              sales={sales}
              properties={properties}
              brokers={brokers}
              leads={leads}
              onAddProposal={handleAddProposal}
              onApproveProposal={handleApproveProposal}
              onSendCounterProposal={handleSendCounterProposal}
            />
          )}

          {currentTab === "equipe-comissoes" && <CommissionsModule commissions={commissions} />}

          {(currentTab === "locacoes-contratos" ||
            currentTab === "locacoes-repasses" ||
            currentTab === "locacoes-vistorias" ||
            currentTab === "locacoes-manutencoes") && (
            <RentalsModule
              rentalContracts={rentalContracts}
              rentalPayouts={rentalPayouts}
              inspections={inspections}
              maintenances={maintenances}
              initialSubTab={
                currentTab === "locacoes-repasses"
                  ? "repasses"
                  : currentTab === "locacoes-vistorias"
                    ? "vistorias"
                    : currentTab === "locacoes-manutencoes"
                      ? "manutencoes"
                      : "contratos"
              }
            />
          )}

          {(currentTab === "loteamentos-empreendimentos" ||
            currentTab === "loteamentos-espelho" ||
            currentTab === "loteamentos-simulador" ||
            currentTab === "loteamentos-reservas") && (
            <DevelopmentsLotsModule
              developments={developments}
              onUpdateLotStatus={handleUpdateLotStatus}
            />
          )}

          {(currentTab === "equipe-corretores" || currentTab === "equipe-ranking") && (
            <BrokersModule brokers={brokers} onAddBroker={handleAddBroker} />
          )}

          {(currentTab === "sistema-usuarios" || currentTab === "sistema-configuracoes") && (
            <ReportsModule
              sales={sales}
              properties={properties}
              visits={visits}
              commissions={commissions}
              rentalPayouts={rentalPayouts}
              developments={developments}
              brokers={brokers}
            />
          )}
        </main>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedPropertyForDetail}
        onClose={() => setSelectedPropertyForDetail(null)}
        onScheduleVisit={(p) => {
          setCurrentTab("visitas");
        }}
        onCreateProposal={(p) => {
          setCurrentTab("propostas");
        }}
      />
    </div>
  );
};
