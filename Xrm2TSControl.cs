using System;
using System.Linq;
using System.Collections.Generic;
using System.Windows.Forms;
using System.IO;

using Microsoft.Xrm.Sdk.Metadata;

using XrmToolBox.Extensibility;
using XrmToolBox.Extensibility.Args;
using XrmToolBox.Extensibility.Interfaces;

using Xrm.Tools.Helper;
using System.Diagnostics;
using System.Linq.Expressions;

namespace Xrm.Tools
{
    public partial class Xrm2TSControl : PluginControlBase, IStatusBarMessenger, IGitHubPlugin, IHelpPlugin
    {
        #region Private items
        private List<string> _selectedItems = null;
        private List<ListViewItem> _entitiesListViewItemsColl = null; 
        private bool _performingBulkSelection = false; // let's keep the listview from flickering and crashing

        public string HelpUrl => Properties.Resources.github_help_url;

        public string RepositoryName => Properties.Resources.github_repo_name;

        public string UserName => Properties.Resources.github_user;

        #endregion
        public event EventHandler<StatusBarMessageEventArgs> SendMessageToStatusBar;

        public Xrm2TSControl()
        {
            InitializeComponent();
        }

        #region Here is where the work happens
        private void LoadEntities()
        {
            WorkAsync(new WorkAsyncInfo
            {
                Message = "Retrieving the list of Document Templates",
                AsyncArgument = propertyGridConfig.SelectedObject,
                IsCancelable = true,
                MessageWidth = 340,
                MessageHeight = 150,
                Work = (w, e) =>
                {
                    try
                    {
                        w.ReportProgress(0, "Loading Templates from CRM");

                        var config = e.Argument as ConfigurationInfo;

                        e.Result = CrmActions.GetAllEntities(Service, config);

                        w.ReportProgress(100, "Loading Templates from CRM Complete!");
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("An error occured attetmpting to load the list of Entities:\n" + ex.Message);
                    }
                },
                ProgressChanged = e =>
                {
                    SendMessageToStatusBar?.Invoke(this, new StatusBarMessageEventArgs(e.ProgressPercentage, e.UserState.ToString()));
                },
                PostWorkCallBack = e =>
                {
                    // let them do stuff again
                    ToggleMainControlsEnabled(true);

                    // launch the results window... get off this worker thread so we can work with the dialog correctly
                    BeginInvoke(new LoadEntitiesCompleteDelegate(LoadEntitiesComplete), new object[] { e.Result as List<EntityMetadata> });
                }
            });
        }

        public delegate void LoadEntitiesCompleteDelegate(List<EntityMetadata> entites);

        private void LoadEntitiesComplete(List<EntityMetadata> entities) {

            listViewEntities.Items.Clear();
            listViewEntities.Refresh();

            listViewEntities.SuspendLayout();
            listBoxSelectedEntities.SuspendLayout();

            var config = propertyGridConfig.SelectedObject as ConfigurationInfo;

            // persist the list of list view items for the filtering
            _entitiesListViewItemsColl = new List<ListViewItem>();

            foreach (var entity in entities)
            {
                // filter based on configuration settings
                if (config.FilterEntity(entity.LogicalName))
                {
                    continue;
                }
                // see if we are filtering by system and custom
                else if (config.EntityTypes != EnumEntityTypes.BothCustomAndSystem)
                {
                    if ((config.EntityTypes == EnumEntityTypes.Custom) && (!entity.IsCustomEntity.Value)) {
                        continue;
                    }
                    else if ((config.EntityTypes == EnumEntityTypes.System) && (entity.IsCustomEntity.Value))
                    {
                        continue;
                    }
                }

                var displayName = (entity.DisplayName.LocalizedLabels.Count > 0) ? entity.DisplayName.LocalizedLabels[0].Label : entity.SchemaName;
                
                // we don't want the content!
                var entityType = (entity.IsCustomEntity.Value) ? "Custom" : "System";
                var lvItem = new ListViewItem()
                {
                    Name = "Display Name",
                    ImageIndex = 0,
                    StateImageIndex = 0,
                    Text = displayName,
                    Tag = entity,  // stash the template here so we can view details later
                    Group = listViewEntities.Groups[entityType]
                };
                var state = (entity.IsManaged.Value) ? "Managed" : "Unmanaged";
                var description = (entity.Description.LocalizedLabels.Count > 0) ? entity.Description.LocalizedLabels[0].Label : "";
                lvItem.SubItems.Add(new ListViewItem.ListViewSubItem(lvItem, entity.LogicalName) { Tag = "Name", Name = "Name" });
                lvItem.SubItems.Add(new ListViewItem.ListViewSubItem(lvItem, entity.SchemaName) { Tag = "SchemaName", Name = "Schema Name" });
                lvItem.SubItems.Add(new ListViewItem.ListViewSubItem(lvItem, state) { Tag = "State", Name = "State" });
                lvItem.SubItems.Add(new ListViewItem.ListViewSubItem(lvItem, description) { Tag = "Description", Name = "Description" });

                _entitiesListViewItemsColl.Add(lvItem);
            }

            listViewEntities.Items.AddRange(_entitiesListViewItemsColl.ToArray<ListViewItem>());
            listViewEntities.ResumeLayout();
            listBoxSelectedEntities.ResumeLayout();

            // reenable the export toolbar
            ToggleToolbarButtonsEnabled(true);
        }

        /// <summary>
        /// Based on the current selection, generate the templates
        /// </summary>
        /// <param name="generateCheckedItems">Flag indicating whether to generate the checked items or the single selected item</param>
        private void GenerateTemplates(bool generateCheckedItems = false)
        {
            ToggleMainControlsEnabled(false);

            var entitiesList = new List<string>();
            // generate checked vs selected items.
            if (generateCheckedItems) {
                foreach (ListViewItem item in listViewEntities.CheckedItems) {
                    entitiesList.Add(item.SubItems["Name"].Text);
                }
            }
            else {
                var selItem = listViewEntities.SelectedItems[0];
                entitiesList.Add(selItem.SubItems["Name"].Text);
            }

            WorkAsync(new WorkAsyncInfo
            {
                Message = "Generating the script template for selected entities",
                AsyncArgument = new List<object>() { entitiesList, propertyGridConfig.SelectedObject },
                IsCancelable = true,
                MessageWidth = 340,
                MessageHeight = 150,
                Work = (w, e) =>
                {
                    Xrm2TypeScriptGenerator xrm2ts = null;
                    try
                    {
                        var args = e.Argument as List<object>;
                        var namesList = args[0] as List<string>;
                        var config = args[1] as ConfigurationInfo;

                        // collect all of the entity metadata items with the attribubte metadata
                        var selectedEntities = new List<EntityMetadata>();

                        var counter = 0;
                        var total = namesList.Count;
                        //foreach selected entity in the listbox
                        foreach (string logicalName in namesList)
                        {
                            w.ReportProgress((counter++ / total) * 100, "Loading Entity: " + logicalName);
                            selectedEntities.Add(CrmActions.RetrieveEntityAttributeMeta(Service, config, logicalName));
                        }

                        w.ReportProgress(100, "Loading Entities Complete");

                        // generate the list of selected entities
                        xrm2ts = new Xrm2TypeScriptGenerator(config, selectedEntities);

                        // TODO move the type into the script types
                        xrm2ts.GenerateAllClassTemplates();

                        e.Result = xrm2ts;
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("An error occurred attempting to generate the template for your selection:\n" + ex.Message + "\n Logging results:\n" + xrm2ts.Logger.ToString());
                    }
                },
                ProgressChanged = e =>
                {
                    SendMessageToStatusBar?.Invoke(this, new StatusBarMessageEventArgs(e.ProgressPercentage, e.UserState.ToString()));
                },
                PostWorkCallBack = e =>
                {
                    // let them do stuff again
                    ToggleMainControlsEnabled(true);

                    // launch the results window... get off this worker thread so we can work with the dialog correctly
                    BeginInvoke(new ProcessingCompleteDelegate(ProcessingComplete), new object[] { e.Result as Xrm2TypeScriptGenerator });
                }
            });
            
        }

        public delegate void ProcessingCompleteDelegate(Xrm2TypeScriptGenerator renderer);

        private void ProcessingComplete(Xrm2TypeScriptGenerator renderer) {
            
            using (var view = new GeneratedResultsForm())
            {
                view.ShowResults(renderer.GeneratedOutput.ToString(), renderer.Logger.ToString());
                view.ShowDialog();
            }
        }

        /// <summary>
        /// Center and resize the inline "modal control"
        /// </summary>
        /// <param name="childControl"></param>
        private void ResizeChildControl(UserControl childControl)
        {
            var owner = ParentForm;
            var width = owner.Width - 120;
            var height = owner.Height - 300;

            if (childControl != null)
            {
                childControl.Top = Convert.ToInt32(owner.Height / 2) - Convert.ToInt32(height / 2);
                childControl.Left = Convert.ToInt32(owner.Width / 2) - Convert.ToInt32(width / 2);
                childControl.Height = height;
                childControl.Width = width;
            }
        }

        /// <summary>
        /// Generate the template against all selected entities
        /// </summary>
        private void GenerateCheckedEntities()
        {
            if (listViewEntities.CheckedItems.Count == 0)
            {
                MessageBox.Show("Please check at least one entity from the list", "No Entities Checked");
                return;
            }
            ExecuteMethod(GenerateTemplates, true);
        }

        /// <summary>
        /// Generate the script with just one selected entity
        /// </summary>
        private void GenerateSingleEntity()
        {
            if (listViewEntities.SelectedItems.Count == 0)
            {
                MessageBox.Show("Please select at least one entity from the list", "No Entities Selected");
                return;
            }
            ExecuteMethod(GenerateTemplates, false);
        }

        /// <summary>
        /// Toggle main ui elements disabled while we show the results
        /// </summary>
        /// <param name="enabled"></param>
        private void ToggleMainControlsEnabled(bool enabled)
        {
            tableLayoutRight.Enabled = enabled;
            splitContainerMain.Enabled = enabled;
            toolStripMain.Enabled = enabled;
        }

        /// <summary>
        /// Helper method to toggle some buttons enabled state
        /// </summary>
        /// <param name="enabled"></param>
        private void ToggleToolbarButtonsEnabled(bool enabled)
        {
            toolStripTextFilter.Enabled = enabled;
            toolLinkGenerateChecked.Enabled = enabled;

            toolLinkCheckAll.Enabled = enabled;
            toolLinkGenerateSelected.Enabled = enabled;
        }

        /// <summary>
        /// Toggle all or none checked in the main list view
        /// </summary>
        /// <param name="checkAll"></param>
        private void CheckAllNone(bool checkAll)
        {
            _performingBulkSelection = true;

            listViewEntities.SuspendLayout();
            listBoxSelectedEntities.SuspendLayout();

            if (checkAll)
            {
                foreach (ListViewItem item in listViewEntities.Items) {
                    item.Checked = true;
                }
            }
            else
            {
                foreach (ListViewItem item in listViewEntities.CheckedItems) {
                    item.Checked = false;
                }
            }
            listViewEntities.ResumeLayout();
            listBoxSelectedEntities.ResumeLayout();

            _performingBulkSelection = false;

            // now that we have an updated list view, udpate the list of selected items
            UpdateSelectedItemsList();
        }
        #endregion
        
        /// <summary>
        /// Get's the name of a resource.. as long as you add it through the designer... and it's xml
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="property"></param>
        /// <returns></returns>
        static string GetNameOf<T>(Expression<Func<T>> property)
        {
            return $"{(property.Body as MemberExpression).Member.Name}.xml";
        }

        #region Initialization

        /// <summary>
        /// Handle the startup of the control
        /// </summary>
        private void InitializeControl()
        {
            // init to disabled
            ToggleToolbarButtonsEnabled(false);

            // set up some of the config info.
            var config = new ConfigurationInfo();

            config.ScriptTemplate = writeTemplates(config.ScriptTemplate, config.TemplateContent);
            writeTemplates(GetNameOf(() => Properties.Resources.AxiosTemplate), Properties.Resources.AxiosTemplate);

            string writeTemplates(string fileName, string fileContent)
            {
                var filePath = Path.Combine(Utility.GetToolSettingsFolder(), fileName);
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllText(filePath, fileContent);

                return filePath;
            }

            // set up the properties grid with the config settings
            propertyGridConfig.SelectedObject = config;
        }

        /// <summary>
        /// Update the list of selected items based on the list of Checked items in the list view
        /// </summary>
        private void UpdateSelectedItemsList()
        {
            if (_performingBulkSelection) {
                return;
            }

            if (_selectedItems == null) {
                _selectedItems = new List<string>();
            }

            if (listViewEntities.CheckedItems.Count == 0) {
                _selectedItems.Clear();
            }
            else
            {
                foreach (ListViewItem item in listViewEntities.Items)
                {
                    var displayName = string.Format("{0} ({1})", item.Text, item.SubItems["Name"].Text);
                    if (item.Checked)
                    {
                        // if not already added, add the checked item
                        if (!_selectedItems.Contains(displayName)) {
                            _selectedItems.Add(displayName);
                        }
                    }
                    else
                    {
                        // if already added, then remove it
                        if (_selectedItems.Contains(displayName)) {
                            _selectedItems.Remove(displayName);
                        }
                    }
                }
            }

            var selItemsBinding = new BindingSource();
            selItemsBinding.DataSource = _selectedItems;
            listBoxSelectedEntities.DataSource = selItemsBinding;
        }
        /// <summary>
        /// Filter the entities list using the text in the text box.
        /// </summary>
        private void FilterEntitiesList()
        {
            _performingBulkSelection = true;

            listViewEntities.SuspendLayout();
            listBoxSelectedEntities.SuspendLayout();

            // 
            if (toolStripTextFilter.Text.Length > 0)
            {
                // filter the master list and bind it to the list view
                var filteredList = _entitiesListViewItemsColl
                    .Where(i => i.Text.ToLower().Contains(toolStripTextFilter.Text.ToLower()) ||
                        i.SubItems["Name"].Text.ToLower().Contains(toolStripTextFilter.Text.ToLower())
                    );

                // for some reason, on filter, the group gets lost
                listViewEntities.Items.Clear();
                listViewEntities.Items.AddRange(filteredList.ToArray<ListViewItem>());
            }
            else
            {
                // clear filter 
                listViewEntities.Items.Clear();
                listViewEntities.Items.AddRange(_entitiesListViewItemsColl.ToArray<ListViewItem>());
            }

            // for some reason, on filter, the group gets lost
            ResetGroups(_entitiesListViewItemsColl);

            _performingBulkSelection = false;

            // now that we have an updated list view, udpate the list of selected items
            UpdateSelectedItemsList();

            listViewEntities.ResumeLayout();
            listBoxSelectedEntities.ResumeLayout();
        }

        /// <summary>
        /// Reset the groups on the list view control
        /// </summary>
        /// <param name="items"></param>
        private void ResetGroups(List<ListViewItem> items)
        {
            // for some reason, on filter, the group gets lost
            foreach (ListViewItem item in items)
            {
                var entity = item.Tag as EntityMetadata;
                var entityType = (entity.IsCustomEntity.Value) ? "Custom" : "System";
                item.Group = listViewEntities.Groups[entityType];
            }
        }

        /// <summary>
        /// Handle the sorting on each column,using the sort provider
        /// </summary>
        /// <param name="column"></param>
        private void SortEntitiesList(int column)
        {
            _performingBulkSelection = true;

            listViewEntities.SuspendLayout();
            listBoxSelectedEntities.SuspendLayout();

            if (column == int.Parse(listViewEntities.Tag.ToString()))
            {
                listViewEntities.Sorting = ((this.listViewEntities.Sorting == SortOrder.Ascending) ? SortOrder.Descending : SortOrder.Ascending);
                listViewEntities.ListViewItemSorter = new ListViewItemComparer(column, listViewEntities.Sorting);
                return;
            }
            listViewEntities.Tag = column;
            listViewEntities.ListViewItemSorter = new ListViewItemComparer(column, SortOrder.Ascending);

            _performingBulkSelection = false;

            UpdateSelectedItemsList();

            listViewEntities.ResumeLayout();
            listBoxSelectedEntities.ResumeLayout();
        }
        #endregion

        #region UI event handlers
        private void Xrm2TSControl_Load(object sender, EventArgs e)
        {
            InitializeControl();
        }
        private void ToolButtonLoadEntities_Click(object sender, EventArgs e)
        {
            ExecuteMethod(LoadEntities);
        }

        private void ListViewEntities_ItemChecked(object sender, ItemCheckedEventArgs e)
        {
            if (!_performingBulkSelection)
            {
                UpdateSelectedItemsList();
            }
        }

        private void ToolLinkGenerateChecked_Click(object sender, EventArgs e)
        {
            GenerateCheckedEntities();
        }

        private void ToolLinkGenerateSelected_Click(object sender, EventArgs e)
        {
            GenerateSingleEntity();
        }

        private void ToolButtonCloseTab_Click(object sender, EventArgs e)
        {
            this.CloseTool();
        }

        private void ToolStripTextFilter_TextChanged(object sender, EventArgs e)
        {
            FilterEntitiesList();
        }

        private void ListViewEntities_ColumnClick(object sender, ColumnClickEventArgs e)
        {
            SortEntitiesList(e.Column);
        }

        private void ToolButtonDocumentation_Click(object sender, EventArgs e)
        {
            // display the help window.
            ProcessStartInfo sInfo = new ProcessStartInfo(Properties.Resources.github_help_url);
            Process.Start(sInfo);
        }

        private void ToolLinkCheckNone_Click(object sender, EventArgs e)
        {
            CheckAllNone(false);
        }

        private void ToolLinkCheckAll_Click(object sender, EventArgs e)
        {
            CheckAllNone(true);
        }

        private void listViewEntities_DoubleClick(object sender, EventArgs e)
        {
            GenerateSingleEntity();
        }
        #endregion

    }
}
