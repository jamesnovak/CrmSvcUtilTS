using System;
using System.Windows.Forms;
using System.IO;

namespace Xrm.Tools
{
    public partial class GeneratedResults : UserControl
    {
        public EventArgs e = null;
        public event OnCompleteHandler OnComplete;
        public delegate void OnCompleteHandler(EventArgs e);
        public GeneratedResults()
        {
            InitializeComponent();
        }
        public void ShowResults(string templateResults, string loggingResults)
        {
            textBoxResults.Text = templateResults;
            textBoxLoggingResults.Text = loggingResults;
        }

        private void buttonOk_Click(object sender, EventArgs e)
        {
            CloseMe();
        }

        private void buttonSave_Click(object sender, EventArgs e)
        {
            using (var saveDlg = new SaveFileDialog()
            {
                InitialDirectory = Path.GetPathRoot(Environment.SystemDirectory),
                Filter = Constants.GetFileOpenFilter(),
                FilterIndex = 1,
                RestoreDirectory = true
            })
            {
                if (saveDlg.ShowDialog() == DialogResult.OK)
                {
                    var fileName = saveDlg.FileName;
                    var doSave = true;
                    if (File.Exists(fileName)) {
                        if (MessageBox.Show(string.Format("The file '{0}' already exists. Would you like to overwrire it?", fileName), 
                            "Overwrite?", 
                            MessageBoxButtons.YesNoCancel, 
                            MessageBoxIcon.Warning) != DialogResult.Yes) {
                            doSave = false;
                        }
                    }

                    if (doSave) {
                        File.WriteAllText(fileName, textBoxResults.Text);
                    }
                }
            }
        }

        private void buttonCopy_Click(object sender, EventArgs e)
        {
            Clipboard.Clear();
            textBoxResults.SelectAll();
            Clipboard.SetText(this.textBoxResults.Text);
        }

        private void GeneratedResults_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Escape) {
                CloseMe();
            }
        }

        private void CloseMe()
        {
            Hide();
            OnComplete?.Invoke(null);
        }
    }
}
