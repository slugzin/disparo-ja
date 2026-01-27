import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, QrCode, Trash2, Wifi } from "lucide-react";
import {
  Phone,
  X,
  RefreshCw,
  Plus,
  XCircle,
  AlertCircle,
  CheckCircle,
  MessageCircle,
} from "../../utils/icons";
import { TemplateManager } from "../../components/admin/TemplateManager";
import PageHeader from "../../components/ui/PageHeader";
import { Id } from "../../../convex/_generated/dataModel";

const ConexoesPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"connections" | "templates">("connections");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [currentQR, setCurrentQR] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Queries Convex (real-time automático)
  const instances = useQuery(api.queries.whatsappInstances.list);
  const stats = useQuery(api.queries.whatsappInstances.getStats);

  // Mutations
  const removeInstance = useMutation(api.mutations.whatsappInstances.remove);

  // Actions (chamadas à WAHA API)
  const apiCreateInstance = useAction(api.actions.evolutionApi.createInstance);
  const apiConnectInstance = useAction(api.actions.evolutionApi.connectInstance);
  const apiSyncStatus = useAction(api.actions.evolutionApi.syncStatus);
  const apiDeleteInstance = useAction(api.actions.evolutionApi.deleteInstance);

  const isLoadingInstances = instances === undefined;

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const handleRefresh = async () => {
    if (!instances || instances.length === 0) return;

    setIsRefreshing(true);

    try {
      let connectionsUpdated = 0;
      let connectionsConnected = 0;

      for (const instance of instances) {
        try {
          const result = await apiSyncStatus({ instanceId: instance.instanceId });
          if (result.success) {
            connectionsUpdated++;
            if (result.status === "connected") {
              connectionsConnected++;
            }
          }
        } catch (err) {
          console.error(`Erro ao atualizar ${instance.instanceName}:`, err);
        }
      }

      if (connectionsConnected > 0) {
        setUpdateMessage(`${connectionsConnected} conexão(ões) ativa(s)!`);
      } else {
        setUpdateMessage(`${connectionsUpdated} conexão(ões) atualizada(s)`);
      }

      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const createInstance = async () => {
    if (!newInstanceName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCreateInstance({
        instanceName: newInstanceName.trim(),
      });

      if (result.success && result.instanceId) {
        setShowCreateModal(false);
        setNewInstanceName("");
        // Abrir QR code automaticamente
        setTimeout(() => {
          generateQrCode(result.instanceId!);
        }, 500);
      } else {
        setError(result.error || "Erro ao criar conexão");
      }
    } catch (err) {
      console.error("Erro ao criar conexão:", err);
      setError("Erro ao criar conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQrCode = async (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    setShowQrModal(true);
    setCurrentQR(null);
    setError(null);

    try {
      const result = await apiConnectInstance({ instanceId });

      if (result.success && result.qrcode) {
        setCurrentQR(result.qrcode);
      } else {
        setError(result.error || "Erro ao gerar QR Code");
      }
    } catch (err) {
      setError("Erro ao gerar QR Code. Tente novamente.");
    }
  };

  const deleteInstance = async (id: Id<"whatsappInstances">, instanceId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta conexão?")) return;

    try {
      await apiDeleteInstance({ instanceId });
    } catch (err) {
      // Se falhar na API externa, remove do banco mesmo assim
      await removeInstance({ id });
    }
  };

  const connectedInstances = instances?.filter((inst) => inst.status === "connected") || [];
  const disconnectedInstances = instances?.filter((inst) => inst.status !== "connected") || [];

  // Componente de Card de Conexão
  const ConnectionCard: React.FC<{
    instance: NonNullable<typeof instances>[0];
  }> = ({ instance }) => {
    const isConnected = instance.status === "connected";
    const menuId = `menu-${instance._id}`;
    const isMenuOpen = openMenuId === menuId;

    const initials = instance.instanceName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const handleMenuToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenMenuId(isMenuOpen ? null : menuId);
    };

    const handleMenuAction = (action: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenMenuId(null);

      switch (action) {
        case "qrcode":
          generateQrCode(instance.instanceId);
          break;
        case "delete":
          deleteInstance(instance._id, instance.instanceId);
          break;
        default:
          break;
      }
    };

    return (
      <div className="relative">
        <div
          className={`relative border rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-card border-border hover:border-accent/30"
          }`}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
                    isConnected ? "bg-emerald-500" : "bg-muted"
                  }`}
                >
                  {instance.profilePicUrl ? (
                    <img
                      src={instance.profilePicUrl}
                      alt={`Foto de ${instance.instanceName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">{initials}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-medium truncate">
                    {instance.instanceName}
                  </h3>
                  {instance.profileName && (
                    <div className="text-accent text-xs truncate">
                      {instance.profileName}
                    </div>
                  )}
                  <div
                    className={`text-xs flex items-center gap-1 mt-1 ${
                      isConnected ? "text-emerald-600" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {isConnected ? "Conectado" : "Desconectado"}
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="relative">
                <button
                  onClick={handleMenuToggle}
                  className="p-1 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                    {!isConnected && (
                      <button
                        onClick={(e) => handleMenuAction("qrcode", e)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent/5 transition-colors flex items-center gap-2 text-foreground"
                      >
                        <QrCode size={14} />
                        Conectar
                      </button>
                    )}
                    <button
                      onClick={(e) => handleMenuAction("delete", e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2 text-red-500"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Info */}
            {instance.lastSync && (
              <div className="text-xs text-muted-foreground">
                Última sincronização:{" "}
                {new Date(instance.lastSync).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const selectedInstance = instances?.find((i) => i.instanceId === selectedInstanceId);

  return (
    <div className="min-h-screen bg-background p-2 md:p-6">
      <div className="page-content-wrapper">
        <PageHeader
          title="Conexões"
          subtitle="Gerencie suas contas do WhatsApp para envio de mensagens."
          icon={<Phone size={32} className="text-primary" />}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingInstances}
                className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Atualizar status das conexões"
              >
                <RefreshCw
                  size={16}
                  className={`${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Atualizando..." : "Atualizar"}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Conexão
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Phone size={20} className="text-emerald-500" />
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-500">
                  {stats?.total || 0}
                </span>
                <span className="text-xs text-muted-foreground ml-2">total</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">
              Total de Conexões
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Contas configuradas
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-blue-500" />
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-500">
                  {stats?.connected || 0}
                </span>
                <span className="text-xs text-muted-foreground ml-2">ativas</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">Conectadas</h3>
            <p className="text-xs text-muted-foreground mt-1">Contas ativas</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <span className="text-2xl font-bold text-red-500">
                  {stats?.disconnected || 0}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  inativas
                </span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">Desconectadas</h3>
            <p className="text-xs text-muted-foreground mt-1">Contas inativas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab("connections")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "connections"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
              }`}
            >
              <Phone size={16} />
              WhatsApp ({instances?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "templates"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
              }`}
            >
              <MessageCircle size={16} />
              Templates
            </button>
          </div>
        </div>

        {/* Mensagem de Atualização */}
        <AnimatePresence>
          {updateMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {updateMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conteúdo Principal */}
        <div className="space-y-6">
          {activeTab === "templates" ? (
            <TemplateManager />
          ) : isLoadingInstances ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">
                  Carregando conexões...
                </p>
              </div>
            </div>
          ) : (
            <>
              {instances && instances.length > 0 ? (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Phone size={16} className="text-accent" />
                    Conexões WhatsApp ({instances.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {instances.map((instance) => (
                      <ConnectionCard key={instance._id} instance={instance} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Nenhuma conexão encontrada
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Adicione uma nova conexão para começar
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      + Nova Conexão
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Criar Nova Conexão */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Nova Conexão WhatsApp
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome do Dispositivo
                  </label>
                  <input
                    type="text"
                    value={newInstanceName}
                    onChange={(e) => setNewInstanceName(e.target.value)}
                    placeholder="Ex: WhatsApp Principal"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground"
                    disabled={isLoading}
                  />
                </div>

                <div className="bg-muted/20 border border-muted rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="text-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        Como funciona:
                      </p>
                      <ul className="space-y-1">
                        <li>Será criada uma nova instância do WhatsApp</li>
                        <li>Você receberá um QR Code para conectar</li>
                        <li>Escaneie com seu WhatsApp para ativar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={createInstance}
                  disabled={!newInstanceName.trim() || isLoading}
                  className="px-6 py-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground/20 border-t-accent-foreground rounded-full animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Criar Conexão
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de QR Code */}
      <AnimatePresence>
        {showQrModal && selectedInstance && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Conectar WhatsApp
                </h2>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="text-center space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone size={20} className="text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-foreground">
                      {selectedInstance.instanceName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Aguardando conexão...
                    </p>
                  </div>
                </div>

                {currentQR ? (
                  <div className="bg-white p-4 rounded-xl border-2 border-border">
                    <img
                      src={
                        currentQR.startsWith("data:")
                          ? currentQR
                          : `data:image/png;base64,${currentQR}`
                      }
                      alt="QR Code WhatsApp"
                      className="w-full max-w-[200px] mx-auto"
                    />
                  </div>
                ) : (
                  <div className="bg-muted/20 border-2 border-dashed border-muted rounded-xl p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">
                      Gerando QR Code...
                    </p>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageCircle
                      size={16}
                      className="text-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-xs text-muted-foreground text-left">
                      <p className="font-medium text-foreground mb-1">
                        Como conectar:
                      </p>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Toque em Mais opções &gt; Dispositivos conectados</li>
                        <li>Toque em "Conectar um dispositivo"</li>
                        <li>Aponte a câmera para este QR code</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => selectedInstanceId && generateQrCode(selectedInstanceId)}
                  className="px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Novo QR Code
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-6 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConexoesPage;
