﻿using System.Windows.Forms;
using XrmToolBox.Extensibility;
using XrmToolBox.Extensibility.Interfaces;

namespace Xrm.Tools
{
    public partial class Xrm2TSControl : PluginControlBase, IStatusBarMessenger, IGitHubPlugin, IHelpPlugin
    {
        /// <summary> 
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Xrm2TSControl));
            System.Windows.Forms.ListViewGroup listViewGroup3 = new System.Windows.Forms.ListViewGroup("System", System.Windows.Forms.HorizontalAlignment.Left);
            System.Windows.Forms.ListViewGroup listViewGroup4 = new System.Windows.Forms.ListViewGroup("Custom", System.Windows.Forms.HorizontalAlignment.Left);
            this.toolStripMain = new System.Windows.Forms.ToolStrip();
            this.toolButtonCloseTab = new System.Windows.Forms.ToolStripButton();
            this.toolButtonLoadEntities = new System.Windows.Forms.ToolStripButton();
            this.toolStripSeparator1 = new System.Windows.Forms.ToolStripSeparator();
            this.toolLinkCheckAll = new System.Windows.Forms.ToolStripLabel();
            this.toolLinkCheckNone = new System.Windows.Forms.ToolStripLabel();
            this.toolStripSeparator3 = new System.Windows.Forms.ToolStripSeparator();
            this.toolStripLabelFilter = new System.Windows.Forms.ToolStripLabel();
            this.toolStripTextFilter = new System.Windows.Forms.ToolStripTextBox();
            this.toolStripSeparator2 = new System.Windows.Forms.ToolStripSeparator();
            this.toolButtonDocumentation = new System.Windows.Forms.ToolStripButton();
            this.toolLinkGenerateChecked = new System.Windows.Forms.ToolStripButton();
            this.toolLinkGenerateSelected = new System.Windows.Forms.ToolStripButton();
            this.splitContainerMain = new System.Windows.Forms.SplitContainer();
            this.listViewEntities = new System.Windows.Forms.ListView();
            this.colDisplayName = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.colName = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.colSchemaName = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.colState = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.colDescription = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.splitContainerLeftPane = new System.Windows.Forms.SplitContainer();
            this.textCheckedEntitiesList = new System.Windows.Forms.TextBox();
            this.labelSelectedEntities = new System.Windows.Forms.Label();
            this.propertyGridConfig = new System.Windows.Forms.PropertyGrid();
            this.toolDropDownConfig = new System.Windows.Forms.ToolStripDropDownButton();
            this.toolStripMenuLoadConfig = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuSaveConfig = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMain.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerMain)).BeginInit();
            this.splitContainerMain.Panel1.SuspendLayout();
            this.splitContainerMain.Panel2.SuspendLayout();
            this.splitContainerMain.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerLeftPane)).BeginInit();
            this.splitContainerLeftPane.Panel1.SuspendLayout();
            this.splitContainerLeftPane.Panel2.SuspendLayout();
            this.splitContainerLeftPane.SuspendLayout();
            this.SuspendLayout();
            // 
            // toolStripMain
            // 
            this.toolStripMain.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolButtonCloseTab,
            this.toolButtonLoadEntities,
            this.toolStripSeparator1,
            this.toolLinkCheckAll,
            this.toolLinkCheckNone,
            this.toolStripSeparator3,
            this.toolStripLabelFilter,
            this.toolStripTextFilter,
            this.toolStripSeparator2,
            this.toolButtonDocumentation,
            this.toolLinkGenerateChecked,
            this.toolLinkGenerateSelected,
            this.toolDropDownConfig});
            this.toolStripMain.Location = new System.Drawing.Point(0, 0);
            this.toolStripMain.Name = "toolStripMain";
            this.toolStripMain.Size = new System.Drawing.Size(995, 25);
            this.toolStripMain.TabIndex = 0;
            this.toolStripMain.Text = "Typescript Helper Class Utility";
            // 
            // toolButtonCloseTab
            // 
            this.toolButtonCloseTab.Image = ((System.Drawing.Image)(resources.GetObject("toolButtonCloseTab.Image")));
            this.toolButtonCloseTab.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.toolButtonCloseTab.Name = "toolButtonCloseTab";
            this.toolButtonCloseTab.Size = new System.Drawing.Size(78, 22);
            this.toolButtonCloseTab.Text = "Close Tab";
            this.toolButtonCloseTab.Click += new System.EventHandler(this.ToolButtonCloseTab_Click);
            // 
            // toolButtonLoadEntities
            // 
            this.toolButtonLoadEntities.Image = ((System.Drawing.Image)(resources.GetObject("toolButtonLoadEntities.Image")));
            this.toolButtonLoadEntities.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.toolButtonLoadEntities.Name = "toolButtonLoadEntities";
            this.toolButtonLoadEntities.Size = new System.Drawing.Size(94, 22);
            this.toolButtonLoadEntities.Text = "Load Entities";
            this.toolButtonLoadEntities.ToolTipText = "Load / Reload Entities from the server";
            this.toolButtonLoadEntities.Click += new System.EventHandler(this.ToolButtonLoadEntities_Click);
            // 
            // toolStripSeparator1
            // 
            this.toolStripSeparator1.Name = "toolStripSeparator1";
            this.toolStripSeparator1.Size = new System.Drawing.Size(6, 25);
            // 
            // toolLinkCheckAll
            // 
            this.toolLinkCheckAll.ActiveLinkColor = System.Drawing.SystemColors.HotTrack;
            this.toolLinkCheckAll.AutoSize = false;
            this.toolLinkCheckAll.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
            this.toolLinkCheckAll.IsLink = true;
            this.toolLinkCheckAll.LinkBehavior = System.Windows.Forms.LinkBehavior.HoverUnderline;
            this.toolLinkCheckAll.LinkColor = System.Drawing.SystemColors.HotTrack;
            this.toolLinkCheckAll.Name = "toolLinkCheckAll";
            this.toolLinkCheckAll.Size = new System.Drawing.Size(75, 22);
            this.toolLinkCheckAll.Text = "Check All";
            this.toolLinkCheckAll.ToolTipText = "Check all items in the list of Entities";
            this.toolLinkCheckAll.Click += new System.EventHandler(this.ToolLinkCheckAll_Click);
            // 
            // toolLinkCheckNone
            // 
            this.toolLinkCheckNone.ActiveLinkColor = System.Drawing.SystemColors.HotTrack;
            this.toolLinkCheckNone.AutoSize = false;
            this.toolLinkCheckNone.IsLink = true;
            this.toolLinkCheckNone.LinkBehavior = System.Windows.Forms.LinkBehavior.HoverUnderline;
            this.toolLinkCheckNone.LinkColor = System.Drawing.SystemColors.HotTrack;
            this.toolLinkCheckNone.Name = "toolLinkCheckNone";
            this.toolLinkCheckNone.Size = new System.Drawing.Size(75, 22);
            this.toolLinkCheckNone.Text = "Check None";
            this.toolLinkCheckNone.ToolTipText = "Clear the checked items in the list of Entities";
            this.toolLinkCheckNone.Click += new System.EventHandler(this.ToolLinkCheckNone_Click);
            // 
            // toolStripSeparator3
            // 
            this.toolStripSeparator3.Name = "toolStripSeparator3";
            this.toolStripSeparator3.Size = new System.Drawing.Size(6, 25);
            // 
            // toolStripLabelFilter
            // 
            this.toolStripLabelFilter.AutoSize = false;
            this.toolStripLabelFilter.Margin = new System.Windows.Forms.Padding(5, 1, 0, 2);
            this.toolStripLabelFilter.Name = "toolStripLabelFilter";
            this.toolStripLabelFilter.Size = new System.Drawing.Size(40, 22);
            this.toolStripLabelFilter.Text = "Filter";
            // 
            // toolStripTextFilter
            // 
            this.toolStripTextFilter.MaxLength = 200;
            this.toolStripTextFilter.Name = "toolStripTextFilter";
            this.toolStripTextFilter.Size = new System.Drawing.Size(110, 25);
            this.toolStripTextFilter.ToolTipText = "Enter a filter for the list of entities";
            this.toolStripTextFilter.TextChanged += new System.EventHandler(this.ToolStripTextFilter_TextChanged);
            // 
            // toolStripSeparator2
            // 
            this.toolStripSeparator2.Name = "toolStripSeparator2";
            this.toolStripSeparator2.Size = new System.Drawing.Size(6, 25);
            // 
            // toolButtonDocumentation
            // 
            this.toolButtonDocumentation.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.toolButtonDocumentation.Image = ((System.Drawing.Image)(resources.GetObject("toolButtonDocumentation.Image")));
            this.toolButtonDocumentation.ImageAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.toolButtonDocumentation.Name = "toolButtonDocumentation";
            this.toolButtonDocumentation.Size = new System.Drawing.Size(65, 22);
            this.toolButtonDocumentation.Text = "GitHub";
            this.toolButtonDocumentation.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.toolButtonDocumentation.ToolTipText = "Open the online documentation";
            this.toolButtonDocumentation.Click += new System.EventHandler(this.ToolButtonDocumentation_Click);
            // 
            // toolLinkGenerateChecked
            // 
            this.toolLinkGenerateChecked.AutoSize = false;
            this.toolLinkGenerateChecked.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
            this.toolLinkGenerateChecked.Image = ((System.Drawing.Image)(resources.GetObject("toolLinkGenerateChecked.Image")));
            this.toolLinkGenerateChecked.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.toolLinkGenerateChecked.Margin = new System.Windows.Forms.Padding(3, 1, 0, 2);
            this.toolLinkGenerateChecked.Name = "toolLinkGenerateChecked";
            this.toolLinkGenerateChecked.Size = new System.Drawing.Size(110, 22);
            this.toolLinkGenerateChecked.Text = "Generate Checked";
            this.toolLinkGenerateChecked.ToolTipText = "Generate script for the checked items in the list of Entities";
            this.toolLinkGenerateChecked.Click += new System.EventHandler(this.ToolLinkGenerateChecked_Click);
            // 
            // toolLinkGenerateSelected
            // 
            this.toolLinkGenerateSelected.AutoSize = false;
            this.toolLinkGenerateSelected.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
            this.toolLinkGenerateSelected.Image = ((System.Drawing.Image)(resources.GetObject("toolLinkGenerateSelected.Image")));
            this.toolLinkGenerateSelected.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.toolLinkGenerateSelected.Margin = new System.Windows.Forms.Padding(3, 1, 0, 2);
            this.toolLinkGenerateSelected.Name = "toolLinkGenerateSelected";
            this.toolLinkGenerateSelected.Size = new System.Drawing.Size(110, 22);
            this.toolLinkGenerateSelected.Text = "Generate Selected";
            this.toolLinkGenerateSelected.ToolTipText = "Generate script against the currently selected item in the list of Entities";
            this.toolLinkGenerateSelected.Click += new System.EventHandler(this.ToolLinkGenerateSelected_Click);
            // 
            // splitContainerMain
            // 
            this.splitContainerMain.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainerMain.Location = new System.Drawing.Point(0, 25);
            this.splitContainerMain.Name = "splitContainerMain";
            // 
            // splitContainerMain.Panel1
            // 
            this.splitContainerMain.Panel1.Controls.Add(this.listViewEntities);
            // 
            // splitContainerMain.Panel2
            // 
            this.splitContainerMain.Panel2.Controls.Add(this.splitContainerLeftPane);
            this.splitContainerMain.Size = new System.Drawing.Size(995, 616);
            this.splitContainerMain.SplitterDistance = 667;
            this.splitContainerMain.SplitterWidth = 6;
            this.splitContainerMain.TabIndex = 2;
            // 
            // listViewEntities
            // 
            this.listViewEntities.CheckBoxes = true;
            this.listViewEntities.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.colDisplayName,
            this.colName,
            this.colSchemaName,
            this.colState,
            this.colDescription});
            this.listViewEntities.Dock = System.Windows.Forms.DockStyle.Fill;
            this.listViewEntities.FullRowSelect = true;
            listViewGroup3.Header = "System";
            listViewGroup3.Name = "System";
            listViewGroup3.Tag = "System";
            listViewGroup4.Header = "Custom";
            listViewGroup4.Name = "Custom";
            listViewGroup4.Tag = "Custom";
            this.listViewEntities.Groups.AddRange(new System.Windows.Forms.ListViewGroup[] {
            listViewGroup3,
            listViewGroup4});
            this.listViewEntities.HideSelection = false;
            this.listViewEntities.Location = new System.Drawing.Point(0, 0);
            this.listViewEntities.MultiSelect = false;
            this.listViewEntities.Name = "listViewEntities";
            this.listViewEntities.Size = new System.Drawing.Size(667, 616);
            this.listViewEntities.Sorting = System.Windows.Forms.SortOrder.Descending;
            this.listViewEntities.TabIndex = 0;
            this.listViewEntities.Tag = "0";
            this.listViewEntities.UseCompatibleStateImageBehavior = false;
            this.listViewEntities.View = System.Windows.Forms.View.Details;
            this.listViewEntities.ColumnClick += new System.Windows.Forms.ColumnClickEventHandler(this.ListViewEntities_ColumnClick);
            this.listViewEntities.ItemChecked += new System.Windows.Forms.ItemCheckedEventHandler(this.ListViewEntities_ItemChecked);
            this.listViewEntities.DoubleClick += new System.EventHandler(this.listViewEntities_DoubleClick);
            // 
            // colDisplayName
            // 
            this.colDisplayName.Tag = "DisplayName";
            this.colDisplayName.Text = "Display Name";
            this.colDisplayName.Width = 100;
            // 
            // colName
            // 
            this.colName.Tag = "Name";
            this.colName.Text = "Name";
            this.colName.Width = 100;
            // 
            // colSchemaName
            // 
            this.colSchemaName.Tag = "SchemaName";
            this.colSchemaName.Text = "Schema Name";
            this.colSchemaName.Width = 100;
            // 
            // colState
            // 
            this.colState.Tag = "State";
            this.colState.Text = "State";
            // 
            // colDescription
            // 
            this.colDescription.Tag = "Description";
            this.colDescription.Text = "Description";
            this.colDescription.Width = 300;
            // 
            // splitContainerLeftPane
            // 
            this.splitContainerLeftPane.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainerLeftPane.Location = new System.Drawing.Point(0, 0);
            this.splitContainerLeftPane.Name = "splitContainerLeftPane";
            this.splitContainerLeftPane.Orientation = System.Windows.Forms.Orientation.Horizontal;
            // 
            // splitContainerLeftPane.Panel1
            // 
            this.splitContainerLeftPane.Panel1.Controls.Add(this.propertyGridConfig);
            // 
            // splitContainerLeftPane.Panel2
            // 
            this.splitContainerLeftPane.Panel2.Controls.Add(this.textCheckedEntitiesList);
            this.splitContainerLeftPane.Panel2.Controls.Add(this.labelSelectedEntities);
            this.splitContainerLeftPane.Size = new System.Drawing.Size(322, 616);
            this.splitContainerLeftPane.SplitterDistance = 334;
            this.splitContainerLeftPane.SplitterWidth = 6;
            this.splitContainerLeftPane.TabIndex = 12;
            // 
            // textCheckedEntitiesList
            // 
            this.textCheckedEntitiesList.Dock = System.Windows.Forms.DockStyle.Fill;
            this.textCheckedEntitiesList.Location = new System.Drawing.Point(0, 26);
            this.textCheckedEntitiesList.Multiline = true;
            this.textCheckedEntitiesList.Name = "textCheckedEntitiesList";
            this.textCheckedEntitiesList.ReadOnly = true;
            this.textCheckedEntitiesList.Size = new System.Drawing.Size(322, 250);
            this.textCheckedEntitiesList.TabIndex = 11;
            // 
            // labelSelectedEntities
            // 
            this.labelSelectedEntities.Dock = System.Windows.Forms.DockStyle.Top;
            this.labelSelectedEntities.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.labelSelectedEntities.Location = new System.Drawing.Point(0, 0);
            this.labelSelectedEntities.Name = "labelSelectedEntities";
            this.labelSelectedEntities.Size = new System.Drawing.Size(322, 26);
            this.labelSelectedEntities.TabIndex = 10;
            this.labelSelectedEntities.Text = "Checked Entities";
            this.labelSelectedEntities.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // propertyGridConfig
            // 
            this.propertyGridConfig.Dock = System.Windows.Forms.DockStyle.Fill;
            this.propertyGridConfig.LineColor = System.Drawing.SystemColors.ControlDark;
            this.propertyGridConfig.Location = new System.Drawing.Point(0, 0);
            this.propertyGridConfig.Name = "propertyGridConfig";
            this.propertyGridConfig.Size = new System.Drawing.Size(322, 334);
            this.propertyGridConfig.TabIndex = 15;
            // 
            // toolDropDownConfig
            // 
            this.toolDropDownConfig.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
            this.toolDropDownConfig.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripMenuLoadConfig,
            this.toolStripMenuSaveConfig});
            this.toolDropDownConfig.Image = ((System.Drawing.Image)(resources.GetObject("toolDropDownConfig.Image")));
            this.toolDropDownConfig.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.toolDropDownConfig.Name = "toolDropDownConfig";
            this.toolDropDownConfig.Size = new System.Drawing.Size(94, 22);
            this.toolDropDownConfig.Text = "Configuration";
            // 
            // toolStripMenuLoadConfig
            // 
            this.toolStripMenuLoadConfig.Name = "toolStripMenuLoadConfig";
            this.toolStripMenuLoadConfig.Size = new System.Drawing.Size(177, 22);
            this.toolStripMenuLoadConfig.Text = "Load Configuration";
            this.toolStripMenuLoadConfig.Click += new System.EventHandler(this.toolStripMenuLoadConfig_Click);
            // 
            // toolStripMenuSaveConfig
            // 
            this.toolStripMenuSaveConfig.Name = "toolStripMenuSaveConfig";
            this.toolStripMenuSaveConfig.Size = new System.Drawing.Size(177, 22);
            this.toolStripMenuSaveConfig.Text = "Save Configuration";
            this.toolStripMenuSaveConfig.Click += new System.EventHandler(this.toolStripMenuSaveConfig_Click);
            // 
            // Xrm2TSControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.Controls.Add(this.splitContainerMain);
            this.Controls.Add(this.toolStripMain);
            this.Name = "Xrm2TSControl";
            this.Size = new System.Drawing.Size(995, 641);
            this.Load += new System.EventHandler(this.Xrm2TSControl_Load);
            this.toolStripMain.ResumeLayout(false);
            this.toolStripMain.PerformLayout();
            this.splitContainerMain.Panel1.ResumeLayout(false);
            this.splitContainerMain.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerMain)).EndInit();
            this.splitContainerMain.ResumeLayout(false);
            this.splitContainerLeftPane.Panel1.ResumeLayout(false);
            this.splitContainerLeftPane.Panel2.ResumeLayout(false);
            this.splitContainerLeftPane.Panel2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainerLeftPane)).EndInit();
            this.splitContainerLeftPane.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private ToolStrip toolStripMain;
        private ToolStripButton toolButtonCloseTab;
        private ToolStripButton toolButtonLoadEntities;
        private SplitContainer splitContainerMain;
        private ListView listViewEntities;
        private ColumnHeader colDisplayName;
        private ColumnHeader colName;
        private ColumnHeader colSchemaName;
        private ColumnHeader colState;
        private ColumnHeader colDescription;
        private ToolStripLabel toolStripLabelFilter;
        private ToolStripTextBox toolStripTextFilter;
        private ToolStripSeparator toolStripSeparator1;
        private ToolStripSeparator toolStripSeparator2;
        private ToolStripButton toolButtonDocumentation;
        private ToolStripLabel toolLinkCheckAll;
        private ToolStripLabel toolLinkCheckNone;
        private ToolStripSeparator toolStripSeparator3;
        private ToolStripButton toolLinkGenerateChecked;
        private ToolStripButton toolLinkGenerateSelected;
        private SplitContainer splitContainerLeftPane;
        private TextBox textCheckedEntitiesList;
        private Label labelSelectedEntities;
        private ToolStripDropDownButton toolDropDownConfig;
        private ToolStripMenuItem toolStripMenuLoadConfig;
        private ToolStripMenuItem toolStripMenuSaveConfig;
        private PropertyGrid propertyGridConfig;
    }
}
