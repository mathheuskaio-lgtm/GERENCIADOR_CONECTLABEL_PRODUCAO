import { useState } from "react";
import {
  Plus, Factory, Monitor, X, ChevronRight, ChevronLeft, Trash2, Package,
  Layers, Repeat, Calendar, Hash, Tag, Box, Lock, Unlock, ListOrdered,
} from "lucide-react";

const STAGES = {
  flexo: [
    { id: "layout_aprovado", label: "Layout aprovado" },
    { id: "cliche_solicitado", label: "Clichê solicitado" },
    { id: "cliche_chegou", label: "Clichê/faca chegou" },
    { id: "rebobinadeira", label: "Rebobinadeira" },
    { id: "impressora_kromia", label: "Impressora Kromia" },
    { id: "revisora", label: "Revisora" },
    { id: "empacotando", label: "Empacotando" },
  ],
  digital: [
    { id: "layout_aprovado", label: "Layout aprovado" },
    { id: "em_preparacao", label: "Em preparação" },
    { id: "impressao_mimaki", label: "Impressão Mimaki" },
    { id: "corte_vicut", label: "Corte Vicut" },
    { id: "revisao", label: "Revisão" },
    { id: "empacotamento", label: "Empacotamento" },
  ],
};

const STAGE_COLORS = [
  "bg-slate-500", "bg-amber-500", "bg-sky-500", "bg-violet-500",
  "bg-orange-500", "bg-pink-500", "bg-emerald-500",
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyForm() {
  return {
    pa: "", nome: "", material: "", dataEntrega: "",
    quantidade: "", carreiras: "", repeticoes: "", observacoes: "",
    liberado: true,
  };
}

function emptyOpState() {
  return { ordens: [], fila: [], contador: 0 };
}

export default function ProducaoApp() {
  const [operation, setOperation] = useState("flexo");
  const [data, setData] = useState({ flexo: emptyOpState(), digital: emptyOpState() });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [showFila, setShowFila] = useState(true);

  const stages = STAGES[operation];
  const opState = data[operation];
  const opAccent = operation === "flexo" ? "bg-orange-600" : "bg-blue-600";
  const opAccentText = operation === "flexo" ? "text-orange-600" : "text-blue-600";
  const opAccentLight = operation === "flexo" ? "bg-orange-50" : "bg-blue-50";
  const opAccentBorder = operation === "flexo" ? "border-orange-200" : "border-blue-200";
  const opLabel = operation === "flexo" ? "Produção Flexo" : "Produção Digital";

  const updateOp = (fn) => {
    setData((prev) => ({ ...prev, [operation]: fn(prev[operation]) }));
  };

  const addOrder = () => {
    if (!form.nome.trim() || !form.carreiras || !form.repeticoes) return;
    updateOp((op) => {
      const numero = op.contador + 1;
      const responsaveis = {};
      stages.forEach((s) => (responsaveis[s.id] = ""));
      const newOrder = {
        id: makeId(),
        numero,
        pa: form.pa.trim(),
        nome: form.nome.trim(),
        material: form.material.trim(),
        dataEntrega: form.dataEntrega,
        quantidade: form.quantidade ? Number(form.quantidade) : "",
        carreiras: Number(form.carreiras),
        repeticoes: Number(form.repeticoes),
        observacoes: form.observacoes.trim(),
        responsaveis,
        etapa: stages[0].id,
        liberado: form.liberado,
        criadoEm: Date.now(),
        atualizadoEm: Date.now(),
      };
      if (form.liberado) {
        return { ...op, contador: numero, ordens: [...op.ordens, newOrder] };
      }
      return { ...op, contador: numero, fila: [...op.fila, newOrder] };
    });
    setForm(emptyForm());
    setShowModal(false);
  };

  const liberarDaFila = (id) => {
    updateOp((op) => {
      const order = op.fila.find((o) => o.id === id);
      if (!order) return op;
      return {
        ...op,
        fila: op.fila.filter((o) => o.id !== id),
        ordens: [...op.ordens, { ...order, liberado: true, atualizadoEm: Date.now() }],
      };
    });
  };

  const moveStage = (id, dir) => {
    updateOp((op) => ({
      ...op,
      ordens: op.ordens.map((o) => {
        if (o.id !== id) return o;
        const idx = stages.findIndex((s) => s.id === o.etapa);
        const next = idx + dir;
        if (next < 0 || next >= stages.length) return o;
        return { ...o, etapa: stages[next].id, atualizadoEm: Date.now() };
      }),
    }));
  };

  const setResponsavel = (id, stageId, value) => {
    updateOp((op) => ({
      ...op,
      ordens: op.ordens.map((o) =>
        o.id === id
          ? { ...o, responsaveis: { ...o.responsaveis, [stageId]: value }, atualizadoEm: Date.now() }
          : o
      ),
    }));
  };

  const deleteOrder = (id, fromFila) => {
    updateOp((op) =>
      fromFila
        ? { ...op, fila: op.fila.filter((o) => o.id !== id) }
        : { ...op, ordens: op.ordens.filter((o) => o.id !== id) }
    );
  };

  return (
    <div className="flex h-full min-h-[700px] w-full bg-slate-100 text-slate-800">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-5 py-6 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-tight">ConectLabel</h1>
          <p className="text-xs text-slate-400 mt-0.5">Painel de produção</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-2">
          <button
            onClick={() => setOperation("flexo")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              operation === "flexo" ? "bg-orange-600 text-white shadow-lg shadow-orange-900/30" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Factory size={18} />
            Produção Flexo
            {data.flexo.ordens.length > 0 && (
              <span className="ml-auto text-xs bg-black/20 px-2 py-0.5 rounded-full">{data.flexo.ordens.length}</span>
            )}
          </button>
          <button
            onClick={() => setOperation("digital")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              operation === "digital" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Monitor size={18} />
            Produção Digital
            {data.digital.ordens.length > 0 && (
              <span className="ml-auto text-xs bg-black/20 px-2 py-0.5 rounded-full">{data.digital.ordens.length}</span>
            )}
          </button>
        </nav>
        <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
          {stages.length} etapas • {opState.fila.length} na fila
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`flex items-center justify-between px-6 py-4 border-b bg-white ${opAccentBorder}`}>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{opLabel}</h2>
            <p className="text-sm text-slate-500">Acompanhamento das ordens de produção</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFila((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border ${
                showFila ? `${opAccentLight} ${opAccentText} ${opAccentBorder}` : "text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <ListOrdered size={16} />
              Fila ({opState.fila.length})
            </button>
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm ${opAccent} hover:opacity-90 transition-opacity shadow-md`}
            >
              <Plus size={18} />
              Nova Ordem
            </button>
          </div>
        </header>

        {/* Fila panel */}
        {showFila && (
          <div className="px-6 pt-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <Lock size={14} /> Fila de espera (não liberadas)
              </h3>
              {opState.fila.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma ordem na fila.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {opState.fila.map((o) => (
                    <div key={o.id} className="min-w-[220px] border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-400">#{o.numero}</span>
                        <button onClick={() => deleteOrder(o.id, true)} className="text-slate-300 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{o.nome}</p>
                      {o.pa && <p className="text-xs text-slate-500">PA: {o.pa}</p>}
                      <button
                        onClick={() => liberarDaFila(o.id)}
                        className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 rounded-md text-white ${opAccent} hover:opacity-90`}
                      >
                        <Unlock size={12} /> Liberar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Board */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage, idx) => {
              const stageOrders = opState.ordens.filter((o) => o.etapa === stage.id);
              return (
                <div key={stage.id} className="w-72 shrink-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[idx % STAGE_COLORS.length]}`} />
                    <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                      {stageOrders.length}
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-200/60 rounded-xl p-2.5 space-y-2.5 min-h-[400px]">
                    {stageOrders.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-8">Nenhuma ordem</div>
                    )}
                    {stageOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg p-3.5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-400">#{order.numero}</span>
                            {order.pa && (
                              <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {order.pa}
                              </span>
                            )}
                          </div>
                          <button onClick={() => deleteOrder(order.id, false)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="font-semibold text-sm text-slate-800 mb-1.5">{order.nome}</p>
                        <div className="flex flex-col gap-1 text-xs text-slate-500 mb-2.5">
                          {order.material && (
                            <div className="flex items-center gap-1.5">
                              <Tag size={12} className="text-slate-400" />
                              {order.material}
                            </div>
                          )}
                          {order.quantidade !== "" && (
                            <div className="flex items-center gap-1.5">
                              <Box size={12} className="text-slate-400" />
                              {order.quantidade} un.
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Layers size={12} className="text-slate-400" />
                            {order.carreiras} carreiras
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Repeat size={12} className="text-slate-400" />
                            {order.repeticoes} repetições
                          </div>
                          {order.dataEntrega && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-slate-400" />
                              Entrega: {new Date(order.dataEntrega + "T00:00:00").toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                        {order.observacoes && (
                          <p className="text-xs text-slate-500 italic mb-2.5 border-t border-slate-100 pt-2">
                            {order.observacoes}
                          </p>
                        )}
                        <div className="mb-2.5">
                          <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                            Responsável nesta etapa
                          </label>
                          <input
                            type="text"
                            value={order.responsaveis[stage.id] || ""}
                            onChange={(e) => setResponsavel(order.id, stage.id, e.target.value)}
                            placeholder="Nome..."
                            className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                          <button
                            disabled={idx === 0}
                            onClick={() => moveStage(order.id, -1)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ChevronLeft size={13} />
                            Voltar
                          </button>
                          <button
                            disabled={idx === stages.length - 1}
                            onClick={() => moveStage(order.id, 1)}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-white ${opAccent} disabled:opacity-30 hover:opacity-90`}
                          >
                            Avançar
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className={`flex items-center justify-between px-5 py-4 border-b ${opAccentLight}`}>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className={opAccentText} />
                Nova Ordem — {opLabel}
              </h3>
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm()); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">
                    <Hash size={12} /> PA
                  </label>
                  <input
                    type="text"
                    value={form.pa}
                    onChange={(e) => setForm({ ...form, pa: e.target.value })}
                    placeholder="Ex: pa250"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Data de entrega</label>
                  <input
                    type="date"
                    value={form.dataEntrega}
                    onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nome do pedido</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: rt chiclete"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Material</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    placeholder="Ex: bopp branco"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantidade}
                    onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Carreiras</label>
                  <input
                    type="number"
                    min="0"
                    value={form.carreiras}
                    onChange={(e) => setForm({ ...form, carreiras: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Repetições</label>
                  <input
                    type="number"
                    min="0"
                    value={form.repeticoes}
                    onChange={(e) => setForm({ ...form, repeticoes: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Observações (opcional)</label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.liberado}
                  onChange={(e) => setForm({ ...form, liberado: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Liberar direto para a etapa "{stages[0].label}" (senão vai para a fila)
              </label>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t bg-slate-50">
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm()); }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={addOrder}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white ${opAccent} hover:opacity-90`}
              >
                Criar Ordem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}