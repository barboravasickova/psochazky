/* Decap CMS – čeština + úpravy pro Psocházky (správné API: druhý argument = překlady) */
(function () {
  var cs = CMS.getLocale("cs");
  if (!cs) {
    console.error("Decap CMS: vestavěná lokalizace cs není k dispozici.");
    return;
  }

  CMS.registerLocale("cs", {
    auth: cs.auth,
    app: cs.app,
    collection: {
      sidebar: Object.assign({}, cs.collection.sidebar, { collections: " " }),
      collectionTop: cs.collection.collectionTop,
      entries: cs.collection.entries,
      groups: cs.collection.groups,
      defaultFields: cs.collection.defaultFields,
    },
    editor: {
      editorControl: cs.editor.editorControl,
      editorControlPane: cs.editor.editorControlPane,
      editor: cs.editor.editor,
      editorInterface: cs.editor.editorInterface,
      editorToolbar: Object.assign({}, cs.editor.editorToolbar, {
        publishing: "Publikuje se na web…",
        publish: "Publikovat na web",
        publishAndCreateNew: "Publikovat na web a vytvořit nový",
        publishAndDuplicate: "Publikovat na web a duplikovat",
        backCollection: "Úprava: %{collectionLabel}",
        published: "Publikováno",
      }),
      editorWidgets: cs.editor.editorWidgets,
    },
    mediaLibrary: cs.mediaLibrary,
    ui: {
      default: cs.ui.default,
      errorBoundary: cs.ui.errorBoundary,
      settingsDropdown: cs.ui.settingsDropdown,
      toast: Object.assign({}, cs.ui.toast, {
        entrySaved: "Uloženo.",
        entryPublished: "Publikováno – web se během chvilky aktualizuje.",
      }),
    },
    workflow: cs.workflow,
  });
})();
