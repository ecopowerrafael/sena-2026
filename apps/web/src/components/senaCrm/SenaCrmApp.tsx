import React, { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pathFromTab, tabFromPath } from "../../routes/senaRoutes";
import { useAuth } from "../../features/auth/AuthProvider";
import { useLeads } from "../../hooks/useLeads";
import { useBrokers } from "../../hooks/useBrokers";
import { useProperties } from "../../hooks/useProperties";
import { useClients } from "../../hooks/useClients";
import { useVisits } from "../../hooks/useVisits";
import { useProposals } from "../../hooks/useProposals";
import { useSales } from "../../hooks/useSales";
import { useCommissions } from "../../hooks/useCommissions";
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
  const {
    properties: apiProperties,
    isLoading: propertiesLoading,
    error: propertiesError,
    addProperty: apiAddProperty,
    updateProperty: apiUpdateProperty,
  } = useProperties();
  const {
    clients: apiClients,
    isLoading: clientsLoading,
    error: clientsError,
    addClient: apiAddClient,
  } = useClients();
  const {
    visits: apiVisits,
    isLoading: visitsLoading,
    error: visitsError,
    createVisit: apiCreateVisit,
    updateVisit: apiUpdateVisit,
  } = useVisits();
  const {
    proposals: apiProposals,
    isLoading: proposalsLoading,
    error: proposalsError,
    createProposal: apiCreateProposal,
    updateProposal: apiUpdateProposal,
    approveProposal: apiApproveProposal,
  } = useProposals();
  const {
    sales: apiSales,
    isLoading: salesLoading,
    error: salesError,
    updateSale: apiUpdateSale,
  } = useSales();
  const {
    commissions: apiCommissions,
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useCommissions();

  // Core State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [sales, setSales] = useState<SaleClosure[]>([]);
  const [commissions, setCommissions] = useState<CommissionDistribution[]>([]);
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

  useEffect(() => {
    setProperties(apiProperties);
  }, [apiProperties]);

  // API data is now consumed directly by modules via hooks
  // Legacy state syncing removed - modules access real data from hooks

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
  const handleAddProperty = async (newProp: Partial<Property>) => {
    try {
      await apiAddProperty(newProp);
    } catch (err) {
      console.error("Failed to add property:", err);
    }
  };

  // Handlers: Visits
  // Visits handled by useVisits hook

  // Handlers: Proposals & Sales
  // Proposals & Sales handled by useProposals/useSales hooks

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
              properties={properties}
              onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
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
              properties={properties}
            />
          )}

          {(currentTab === "propostas" || currentTab === "vendas") && (
            <ProposalsSalesModule
              properties={properties}
            />
          )}

          {currentTab === "equipe-comissoes" && <CommissionsModule />}

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
