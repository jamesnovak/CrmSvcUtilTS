using System;
using System.ComponentModel;
using System.Drawing.Design;
using System.IO;
using System.Windows.Forms;

namespace Xrm.Tools.Helper
{
    /// <summary>
    /// Helper class that will display the Open File Dialog in the Property Grid
    /// thanks to: https://stackoverflow.com/questions/1858960/how-can-i-get-a-propertygrid-to-show-a-savefiledialog
    /// </summary>
    public class OpenFileNameEditor : UITypeEditor
    {
        public override UITypeEditorEditStyle GetEditStyle(ITypeDescriptorContext context) {
            return UITypeEditorEditStyle.Modal;
        }

        public override object EditValue(ITypeDescriptorContext context, IServiceProvider provider, object value)
        {
            if (context == null || context.Instance == null || provider == null) {
                return base.EditValue(context, provider, value);
            }

            using (var openDlg = new OpenFileDialog() {
                Title = context.PropertyDescriptor.DisplayName,
                Filter = Constants.GetFileOpenFilter(),
                CheckFileExists = true
            })
            {
                if (value != null) {

                    openDlg.FileName = value.ToString();
                    openDlg.InitialDirectory = Path.GetDirectoryName(value.ToString());
                }
                if (openDlg.ShowDialog() == DialogResult.OK) {
                    value = openDlg.FileName;
                }
            }

            return value;
        }
    }
}
