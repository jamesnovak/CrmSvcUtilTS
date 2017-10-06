namespace Xrm.Tools
{
    partial class GeneratedResultsForm
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

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.tableLayoutPanelMain = new System.Windows.Forms.TableLayoutPanel();
            this.panelActionButtons = new System.Windows.Forms.Panel();
            this.buttonCopy = new System.Windows.Forms.Button();
            this.buttonOk = new System.Windows.Forms.Button();
            this.buttonSave = new System.Windows.Forms.Button();
            this.labelInstructions = new System.Windows.Forms.Label();
            this.tabControlResults = new System.Windows.Forms.TabControl();
            this.tabGeneratedResults = new System.Windows.Forms.TabPage();
            this.textBoxResults = new System.Windows.Forms.TextBox();
            this.tabLoggingResults = new System.Windows.Forms.TabPage();
            this.textBoxLoggingResults = new System.Windows.Forms.TextBox();
            this.tableLayoutPanelMain.SuspendLayout();
            this.panelActionButtons.SuspendLayout();
            this.tabControlResults.SuspendLayout();
            this.tabGeneratedResults.SuspendLayout();
            this.tabLoggingResults.SuspendLayout();
            this.SuspendLayout();
            // 
            // tableLayoutPanelMain
            // 
            this.tableLayoutPanelMain.ColumnCount = 1;
            this.tableLayoutPanelMain.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanelMain.Controls.Add(this.panelActionButtons, 0, 2);
            this.tableLayoutPanelMain.Controls.Add(this.labelInstructions, 0, 0);
            this.tableLayoutPanelMain.Controls.Add(this.tabControlResults, 0, 1);
            this.tableLayoutPanelMain.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanelMain.Location = new System.Drawing.Point(0, 0);
            this.tableLayoutPanelMain.Margin = new System.Windows.Forms.Padding(19, 20, 19, 20);
            this.tableLayoutPanelMain.Name = "tableLayoutPanelMain";
            this.tableLayoutPanelMain.RowCount = 3;
            this.tableLayoutPanelMain.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 59F));
            this.tableLayoutPanelMain.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanelMain.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 41F));
            this.tableLayoutPanelMain.Size = new System.Drawing.Size(775, 596);
            this.tableLayoutPanelMain.TabIndex = 12;
            // 
            // panelActionButtons
            // 
            this.panelActionButtons.Controls.Add(this.buttonCopy);
            this.panelActionButtons.Controls.Add(this.buttonOk);
            this.panelActionButtons.Controls.Add(this.buttonSave);
            this.panelActionButtons.Dock = System.Windows.Forms.DockStyle.Right;
            this.panelActionButtons.Location = new System.Drawing.Point(567, 565);
            this.panelActionButtons.Margin = new System.Windows.Forms.Padding(9, 10, 9, 10);
            this.panelActionButtons.Name = "panelActionButtons";
            this.panelActionButtons.Size = new System.Drawing.Size(199, 21);
            this.panelActionButtons.TabIndex = 13;
            // 
            // buttonCopy
            // 
            this.buttonCopy.Location = new System.Drawing.Point(78, 0);
            this.buttonCopy.Name = "buttonCopy";
            this.buttonCopy.Size = new System.Drawing.Size(59, 22);
            this.buttonCopy.TabIndex = 11;
            this.buttonCopy.Text = "Copy";
            this.buttonCopy.UseVisualStyleBackColor = true;
            this.buttonCopy.Click += new System.EventHandler(this.buttonCopy_Click);
            // 
            // buttonOk
            // 
            this.buttonOk.DialogResult = System.Windows.Forms.DialogResult.OK;
            this.buttonOk.Location = new System.Drawing.Point(139, -1);
            this.buttonOk.Margin = new System.Windows.Forms.Padding(2);
            this.buttonOk.Name = "buttonOk";
            this.buttonOk.Size = new System.Drawing.Size(59, 22);
            this.buttonOk.TabIndex = 8;
            this.buttonOk.Text = "OK";
            this.buttonOk.UseVisualStyleBackColor = true;
            // 
            // buttonSave
            // 
            this.buttonSave.Location = new System.Drawing.Point(17, 0);
            this.buttonSave.Margin = new System.Windows.Forms.Padding(2);
            this.buttonSave.Name = "buttonSave";
            this.buttonSave.Size = new System.Drawing.Size(59, 22);
            this.buttonSave.TabIndex = 9;
            this.buttonSave.Text = "Save";
            this.buttonSave.UseVisualStyleBackColor = true;
            this.buttonSave.Click += new System.EventHandler(this.buttonSave_Click);
            // 
            // labelInstructions
            // 
            this.labelInstructions.BackColor = System.Drawing.SystemColors.Info;
            this.labelInstructions.Dock = System.Windows.Forms.DockStyle.Fill;
            this.labelInstructions.Location = new System.Drawing.Point(5, 5);
            this.labelInstructions.Margin = new System.Windows.Forms.Padding(5);
            this.labelInstructions.Name = "labelInstructions";
            this.labelInstructions.Padding = new System.Windows.Forms.Padding(2);
            this.labelInstructions.Size = new System.Drawing.Size(765, 49);
            this.labelInstructions.TabIndex = 1;
            this.labelInstructions.Text = "Please review the generated results below.  Your selected Entities have been gene" +
    "rated and added to the overall template that is available for download.";
            // 
            // tabControlResults
            // 
            this.tabControlResults.Controls.Add(this.tabGeneratedResults);
            this.tabControlResults.Controls.Add(this.tabLoggingResults);
            this.tabControlResults.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControlResults.Location = new System.Drawing.Point(3, 62);
            this.tabControlResults.Name = "tabControlResults";
            this.tabControlResults.SelectedIndex = 0;
            this.tabControlResults.Size = new System.Drawing.Size(769, 490);
            this.tabControlResults.TabIndex = 14;
            // 
            // tabGeneratedResults
            // 
            this.tabGeneratedResults.Controls.Add(this.textBoxResults);
            this.tabGeneratedResults.Location = new System.Drawing.Point(4, 22);
            this.tabGeneratedResults.Name = "tabGeneratedResults";
            this.tabGeneratedResults.Padding = new System.Windows.Forms.Padding(3);
            this.tabGeneratedResults.Size = new System.Drawing.Size(761, 464);
            this.tabGeneratedResults.TabIndex = 0;
            this.tabGeneratedResults.Text = "Generated Results";
            this.tabGeneratedResults.UseVisualStyleBackColor = true;
            // 
            // textBoxResults
            // 
            this.textBoxResults.Dock = System.Windows.Forms.DockStyle.Fill;
            this.textBoxResults.Location = new System.Drawing.Point(3, 3);
            this.textBoxResults.Multiline = true;
            this.textBoxResults.Name = "textBoxResults";
            this.textBoxResults.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textBoxResults.Size = new System.Drawing.Size(755, 458);
            this.textBoxResults.TabIndex = 13;
            // 
            // tabLoggingResults
            // 
            this.tabLoggingResults.Controls.Add(this.textBoxLoggingResults);
            this.tabLoggingResults.Location = new System.Drawing.Point(4, 22);
            this.tabLoggingResults.Name = "tabLoggingResults";
            this.tabLoggingResults.Padding = new System.Windows.Forms.Padding(3);
            this.tabLoggingResults.Size = new System.Drawing.Size(761, 464);
            this.tabLoggingResults.TabIndex = 1;
            this.tabLoggingResults.Text = "Logging Results";
            this.tabLoggingResults.UseVisualStyleBackColor = true;
            // 
            // textBoxLoggingResults
            // 
            this.textBoxLoggingResults.Dock = System.Windows.Forms.DockStyle.Fill;
            this.textBoxLoggingResults.Location = new System.Drawing.Point(3, 3);
            this.textBoxLoggingResults.Multiline = true;
            this.textBoxLoggingResults.Name = "textBoxLoggingResults";
            this.textBoxLoggingResults.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textBoxLoggingResults.Size = new System.Drawing.Size(755, 458);
            this.textBoxLoggingResults.TabIndex = 0;
            // 
            // GeneratedResultsForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(775, 596);
            this.ControlBox = false;
            this.Controls.Add(this.tableLayoutPanelMain);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.SizableToolWindow;
            this.KeyPreview = true;
            this.Name = "GeneratedResultsForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "View the generated results";
            this.TopMost = true;
            this.KeyUp += new System.Windows.Forms.KeyEventHandler(this.GeneratedResultsForm_KeyUp);
            this.PreviewKeyDown += new System.Windows.Forms.PreviewKeyDownEventHandler(this.GeneratedResultsForm_PreviewKeyDown);
            this.tableLayoutPanelMain.ResumeLayout(false);
            this.panelActionButtons.ResumeLayout(false);
            this.tabControlResults.ResumeLayout(false);
            this.tabGeneratedResults.ResumeLayout(false);
            this.tabGeneratedResults.PerformLayout();
            this.tabLoggingResults.ResumeLayout(false);
            this.tabLoggingResults.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel tableLayoutPanelMain;
        private System.Windows.Forms.Panel panelActionButtons;
        private System.Windows.Forms.Button buttonCopy;
        private System.Windows.Forms.Button buttonOk;
        private System.Windows.Forms.Button buttonSave;
        private System.Windows.Forms.Label labelInstructions;
        private System.Windows.Forms.TabControl tabControlResults;
        private System.Windows.Forms.TabPage tabGeneratedResults;
        private System.Windows.Forms.TextBox textBoxResults;
        private System.Windows.Forms.TabPage tabLoggingResults;
        private System.Windows.Forms.TextBox textBoxLoggingResults;
    }
}