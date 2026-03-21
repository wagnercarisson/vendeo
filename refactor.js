const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "app", "dashboard", "campaigns", "[id]", "_components", "CampaignPreviewClient.tsx");

let content = fs.readFileSync(FILE_PATH, "utf-8");

content = content.replace(
`    const [activeTab, setActiveTab] = useState<ActiveTab>(
        campaign.image_url || campaign.ai_generated_at ? "art" : (campaign.reels_script || campaign.reels_generated_at ? "video" : "art")
    );

    const [viewMode, setViewMode] = useState<ViewMode>(
        modeParam === "edit"
            ? "edit"
            : campaign.status === "ready" && !( !campaign.image_url && !campaign.ai_generated_at && !campaign.reels_script && !campaign.reels_generated_at)
                ? "review"
                : "view"
    );`,
`    const [activeTab, setActiveTab] = useState<ActiveTab>(
        campaign.campaign_type === "reels" ? "video" : "art"
    );

    const [isEditingBase, setIsEditingBase] = useState(
        modeParam === "edit"
    );`
);

content = content.replace('const startEditing = () => setViewMode("edit");', 'const startEditing = () => setIsEditingBase(true);');
content = content.replace('setViewMode("view");\n            router.refresh();', 'setIsEditingBase(false);\n            router.refresh();');
content = content.replace('setViewMode("review");\n        } catch', 'setIsEditingBase(false);\n        } catch');

content = content.replace(
`    async function handleApproveReview() {
        if (!previewData) return;

        try {
            setIsSaving(true);
            let finalImageUrl = previewData.image_url;`,
`    async function handleApproveReview() {
        if (!previewData) return;

        try {
            setIsSaving(true);
            let finalImageUrl = previewData.image_url;`
);

// Find JSX return
const jsxMatch = content.match(/    return \(\n        <div className="mx-auto max-w-6xl space-y-6">[\s\S]*?\n    \);\n}/);

if (jsxMatch) {
    const oldJsx = jsxMatch[0];
    const newJsx = `    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/dashboard/campaigns"
                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Link>

                <div className="flex items-center gap-2">
                    <div
                        className={cx(
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition",
                            isEditingBase
                                ? "border-black/5 bg-white text-zinc-700"
                                : campaign.status === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : currentTabHasContent
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-black/5 bg-white text-zinc-700"
                        )}
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>
                            {isEditingBase ? "Editando" :
                              campaign.status === "approved"
                                ? "Aprovada"
                                : currentTabHasContent
                                    ? "Conteúdo por IA"
                                    : "Aguardando geração"}
                        </span>
                    </div>

                    {isPlanLinked && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 shadow-sm transition">
                            <Calendar className="h-4 w-4" />
                            <span>Estratégia do Plano Semanal</span>
                        </div>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                </div>
            )}

            {isEditingBase ? (
                <CampaignEditForm
                    campaign={campaign}
                    store={campaign.stores}
                    onSave={handleSaveBaseFields}
                    onCancel={isEmptyDraft ? () => router.push("/dashboard/campaigns") : () => setIsEditingBase(false)}
                    onGenerateArt={(d) => {
                        setActiveTab("art");
                        return handleGenerateFromEdit("art", d);
                    }}
                    onGenerateVideo={(d) => {
                        setActiveTab("video");
                        return handleGenerateFromEdit("video", d);
                    }}
                    onApprove={handleApproveFromEdit}
                    activeTab={activeTab}
                    lockContext={!isEmptyDraft}
                    lockStrategyFields={isPlanLinked}
                    isSaving={isSaving}
                    isGeneratingArt={loadingText}
                    isGeneratingVideo={loadingReels}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row">
                        <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-zinc-50">
                            {heroImageUrlClean ? (
                                <img
                                    src={heroImageUrlClean}
                                    alt="Post"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center">
                                    <ImageIcon className="h-8 w-8 text-zinc-200" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h2 className="text-2xl font-bold text-zinc-900">
                                    {campaign.product_name}
                                </h2>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                  {isPlanLinked && (
                                      <span className="rounded bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700 ring-1 ring-inset ring-amber-600/10">
                                          Plano Semanal
                                      </span>
                                  )}
                                  {isApproved && (
                                      <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                          Aprovada
                                      </span>
                                  )}
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                {priceText && (
                                    <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold">
                                        {priceText}
                                    </span>
                                )}
                                <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase">
                                    {OBJECTIVE_OPTIONS.find(
                                        (o) => o.value === campaign.objective
                                    )?.label || campaign.objective}
                                </span>
                            </div>
                            <div className="mt-5 flex justify-center sm:justify-start flex-wrap gap-2">
                                <button
                                    onClick={startEditing}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                                >
                                    Editar Informações Base
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex border-b border-black/5">
                        <button
                            onClick={() => setActiveTab("art")}
                            className={cx(
                                "px-5 py-3 text-sm font-bold transition flex items-center gap-2",
                                activeTab === "art"
                                    ? "border-b-2 border-zinc-900 text-zinc-900"
                                    : "text-zinc-400"
                            )}
                        >
                            <span>Arte</span>
                            {campaign.post_status === 'none' || campaign.post_status === 'draft' ? null : (
                              <div className={cx(
                                  "w-1.5 h-1.5 rounded-full",
                                  campaign.post_status === 'approved' ? "bg-emerald-500" : "bg-amber-400"
                              )} />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("video")}
                            className={cx(
                                "px-5 py-3 text-sm font-bold transition flex items-center gap-2",
                                activeTab === "video"
                                    ? "border-b-2 border-zinc-900 text-zinc-900"
                                    : "text-zinc-400"
                            )}
                        >
                            <span>Vídeo</span>
                            {campaign.reels_status === 'none' || campaign.reels_status === 'draft' ? null : (
                              <div className={cx(
                                  "w-1.5 h-1.5 rounded-full",
                                  campaign.reels_status === 'approved' ? "bg-emerald-500" : "bg-amber-400"
                              )} />
                            )}
                        </button>
                    </div>

                    <div className="mx-auto max-w-3xl">
                        {activeTab === "art" && (
                            campaign.post_status === "draft" || campaign.post_status === "none" ? (
                                <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                                    <Sparkles className="mx-auto mb-4 h-8 w-8 text-zinc-300" />
                                    <p className="mb-6 text-sm text-zinc-500">
                                        Essa campanha não tem arte pronta.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setActiveTab("art");
                                            startEditing();
                                        }}
                                        className="rounded-xl bg-zinc-900 px-8 py-2.5 font-bold text-white transition-all hover:bg-black"
                                    >
                                        Gerar Arte com IA
                                    </button>
                                </div>
                            ) : campaign.post_status === "ready" && previewData ? (
                                <div className="space-y-6">
                                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:flex-row">
                                      <div>
                                          <h2 className="text-lg font-bold text-amber-900">
                                              Revisão da Arte
                                          </h2>
                                          <p className="max-w-md text-sm text-amber-700/80">
                                              Sua arte foi gerada, revise o conteúdo, ajuste se necessário e salve.
                                          </p>
                                      </div>
                                      <button
                                          onClick={() => { setActiveTab("art"); handleApproveReview(); }}
                                          disabled={isSaving || isChildEditing}
                                          className={\`inline-flex h-10 w-full items-center justify-center rounded-xl px-6 text-sm font-bold text-white shadow-sm transition sm:w-auto \${
                                              isChildEditing ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                                          }\`}
                                      >
                                          {isSaving ? "Salvando..." : "Aprovar Arte"}
                                      </button>
                                  </div>
                                  <PreviewReadyState
                                      preview={previewData}
                                      onUpdatePreview={setPreviewData}
                                      generate_post={true}
                                      generate_reels={false}
                                      onRegenerateArt={() => generateText(true)}
                                      onEditingChange={setIsChildEditing}
                                  />
                                  {!isChildEditing && (
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={handleSaveDraftReview}
                                            disabled={isSaving}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-900 bg-white px-6 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
                                        >
                                            {isSaving ? "Salvando..." : "Salvar rascunho"}
                                        </button>
                                    </div>
                                  )}
                                </div>
                            ) : campaign.post_status === "approved" ? (
                                <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-lg max-w-[400px] mx-auto border border-zinc-100">
                                        {campaign.image_url ? (
                                            <img
                                                src={finalArtUrlClean}
                                                alt="Arte"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full grid place-items-center bg-zinc-50 text-zinc-300">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <Field label="Legenda" value={campaign.ai_caption} />
                                        <Field
                                            label="Hashtags"
                                            value={campaign.ai_hashtags}
                                        />
                                        <SalesFeedbackInline
                                            contentType="campaign"
                                            campaignId={campaign.id}
                                        />
                                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                            <button
                                                onClick={handleCopyArt}
                                                disabled={
                                                    !campaign.image_url ||
                                                    artStatus === "copying" ||
                                                    artStatus === "saving"
                                                }
                                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                                            >
                                                {artStatus === "copied" ? (
                                                    <><Check className="h-4 w-4 text-emerald-600" /> Copiado!</>
                                                ) : artStatus === "copying" ? (
                                                    <><ImageIcon className="h-4 w-4 animate-pulse" /> Copiando...</>
                                                ) : (
                                                    <><ImageIcon className="h-4 w-4" /> Copiar Arte</>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleDownloadArt}
                                                disabled={
                                                    !campaign.image_url ||
                                                    artStatus === "saving" ||
                                                    artStatus === "copying"
                                                }
                                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
                                            >
                                                {artStatus === "saving" ? (
                                                    <><Download className="h-4 w-4 animate-bounce" /> Baixando...</>
                                                ) : (
                                                    <><Download className="h-4 w-4" /> Baixar Arte</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab("art");
                                                    startEditing();
                                                }}
                                                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                            >
                                                Regerar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null
                        )}

                        {activeTab === "video" && (
                            campaign.reels_status === "draft" || campaign.reels_status === "none" ? (
                                <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                                    <Video className="mx-auto mb-4 h-8 w-8 text-zinc-300" />
                                    <p className="mb-6 text-sm text-zinc-500">
                                        Essa campanha não tem roteiro de vídeo pronto.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setActiveTab("video");
                                            startEditing();
                                        }}
                                        className="rounded-xl bg-zinc-900 px-8 py-2.5 font-bold text-white transition-all hover:bg-black"
                                    >
                                        Gerar Roteiro de Vídeo
                                    </button>
                                </div>
                            ) : campaign.reels_status === "ready" && previewData ? (
                                <div className="space-y-6">
                                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:flex-row">
                                      <div>
                                          <h2 className="text-lg font-bold text-amber-900">
                                              Revisão do Vídeo
                                          </h2>
                                          <p className="max-w-md text-sm text-amber-700/80">
                                              Seu roteiro foi gerado, revise o conteúdo, altere o que precisar e salve.
                                          </p>
                                      </div>
                                      <button
                                          onClick={() => { setActiveTab("video"); handleApproveReview(); }}
                                          disabled={isSaving || isChildEditing}
                                          className={\`inline-flex h-10 w-full items-center justify-center rounded-xl px-6 text-sm font-bold text-white shadow-sm transition sm:w-auto \${
                                              isChildEditing ? "bg-zinc-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                                          }\`}
                                      >
                                          {isSaving ? "Salvando..." : "Aprovar Vídeo"}
                                      </button>
                                  </div>
                                  <PreviewReadyState
                                      preview={previewData}
                                      onUpdatePreview={setPreviewData}
                                      generate_post={false}
                                      generate_reels={true}
                                      onRegenerateReels={() => generateReels(true)}
                                      onEditingChange={setIsChildEditing}
                                  />
                                  {!isChildEditing && (
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={handleSaveDraftReview}
                                            disabled={isSaving}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-900 bg-white px-6 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
                                        >
                                            {isSaving ? "Salvando..." : "Salvar rascunho"}
                                        </button>
                                    </div>
                                  )}
                                </div>
                            ) : campaign.reels_status === "approved" ? (
                                <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <Field label="Hook" value={campaign.reels_hook} />
                                    <Field label="Roteiro" value={campaign.reels_script} />
                                    <SalesFeedbackInline
                                        contentType="reels"
                                        campaignId={campaign.id}
                                    />
                                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                        <button
                                            onClick={handleCopyVideoScript}
                                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                                        >
                                            {videoStatus === "copied" ? (
                                                <><Check className="h-4 w-4 text-emerald-600" /> Copiado!</>
                                            ) : (
                                                <><Copy className="h-4 w-4" /> Copiar Roteiro</>
                                            )}
                                        </button>
                                        <button
                                            onClick={handlePrintVideo}
                                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800"
                                        >
                                            <Printer className="h-4 w-4" /> Imprimir
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab("video");
                                                startEditing();
                                            }}
                                            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                        >
                                            Regerar
                                        </button>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}`;
    content = content.replace(oldJsx, newJsx);
    fs.writeFileSync(FILE_PATH, content, "utf-8");
    console.log("Success");
} else {
    console.log("Failed to match JSX");
}
