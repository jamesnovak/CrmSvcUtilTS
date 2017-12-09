using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing.Design;

using System.IO;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;
using System.Windows.Forms;

using System.Xml;

using Xrm.Tools.Helper;

namespace Xrm.Tools
{
    #region Enums
    public enum EnumLoggingLevel
    {
        None,
        Exception,
        Information,
        Verbose
    }
    public enum EnumEntityTypes
    {
        Custom,
        System,
        BothCustomAndSystem
    }
    public enum EnumFilterMatchType
    {
        Equals,
        Contains,
        StartsWith,
        EndsWith,
        RegEx
    }
    #endregion

    [DisplayName("Filter Criteria")]
    [Category("Filter Settings")]
    [Description("Class containing information about exclusion filters")]
    [DefaultProperty("FilterString")]
    public class FilterInfo {
        private string _filterString = "";

        [DisplayName("Filter Text")]
        [Description("Provide the filter text to be applied")]
        [Category("Filter Settings")]
        public string FilterString{ get { return _filterString; }
            set {
                _filterString = value;
                // make sure this is a valid regex
                if (FilterMatchType == EnumFilterMatchType.RegEx) {
                    try {
                        Regex regex = new Regex(_filterString);
                    }
                    catch (Exception ex) {
                        MessageBox.Show($"Invalid regex expression: '{value}'\nChanging Match Type to 'Contains'\nError message: {ex.Message}", "Invalid regular expression", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        this.FilterMatchType = EnumFilterMatchType.Contains;
                    }
                }
            }
        }

        [DisplayName("Filter Match")]
        [Description("Choose how this Filter String will be applied")]
        [Category("Filter Settings")]
        public EnumFilterMatchType FilterMatchType { get; set; }

        public override string ToString() {
            return this.FilterMatchType.ToString() + ": " + this.FilterString;
        }
    }

    public class ConfigurationInfo
    {
        #region Constructor 
        public ConfigurationInfo()
        {
            var currPath = Utility.GetToolSettingsFolder();

            ModuleName = "MyProject";
            ModuleNotes = "A CRM Typescript Project";
            LanguageCode = 1033;
            SettingsFileName = Path.Combine(currPath, "TypescriptHelper.xml");

            AttributeFilters = new List<FilterInfo>() {
                new FilterInfo(){ FilterString = "versionnumber", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "yominame", FilterMatchType =EnumFilterMatchType.Contains },
                new FilterInfo(){ FilterString = "importsequencenumber", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "timezoneruleversionnumber", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "utcconversiontimezonecode", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "onbehalf", FilterMatchType =EnumFilterMatchType.Contains },
                new FilterInfo(){ FilterString = "overriddencreatedon", FilterMatchType =EnumFilterMatchType.Equals }
            };

            EntityFilters = new List<FilterInfo>() {
                new FilterInfo() { FilterString = "syncerror", FilterMatchType = EnumFilterMatchType.Equals },
                new FilterInfo() { FilterString = "_bpf_", FilterMatchType = EnumFilterMatchType.Contains }
            };

            EntityTypes = EnumEntityTypes.BothCustomAndSystem;
            RetrieveAsIfPublished = true;
            ScriptTemplate = Path.Combine(currPath, "Angular.Xrm.ts.Xml");
        }
        #endregion

        #region Helper methods 
        /// <summary>
        /// Helper method that will tell whether to filter a given Attribute based on its Schema Name
        /// </summary>
        /// <param name="schemaName">Attribute Schema Name</param>
        /// <returns></returns>
        public bool FilterAttribute(string schemaName)
        {
            return FilterItem(schemaName, AttributeFilters);
        }

        /// <summary>
        /// Helper method that will tell whether to filter a given Entity based on its Logical Name
        /// </summary>
        /// <param name="logicalName">Entity Logical Name</param>
        /// <returns></returns>
        public bool FilterEntity(string logicalName)
        {
            return FilterItem(logicalName, EntityFilters);
        }

        /// <summary>
        /// Iterate through all of the filters for the specific item, return true if it matches one of the filter criteria
        /// </summary>
        /// <param name="matchName">Item to be matched, such as Attribute Schema Name or Entity Logical Name</param>
        /// <param name="filters">Filter Info collection</param>
        private bool FilterItem(string matchName, List<FilterInfo> filters)
        {
            matchName = matchName.ToLower();
            // default to false.  must find a match to return true... allows for empty list
            bool filtersMatch = false;
            foreach (var filter in filters)
            {
                switch (filter.FilterMatchType)
                {
                    case EnumFilterMatchType.Contains:
                        filtersMatch = matchName.Contains(filter.FilterString.ToLower());
                        break;
                    case EnumFilterMatchType.EndsWith:
                        filtersMatch = matchName.EndsWith(filter.FilterString.ToLower());
                        break;
                    case EnumFilterMatchType.StartsWith:
                        filtersMatch = matchName.StartsWith(filter.FilterString.ToLower());
                        break;
                    case EnumFilterMatchType.Equals:
                        filtersMatch = (matchName == filter.FilterString.ToLower());
                        break;
                    case EnumFilterMatchType.RegEx:
                        Regex regex = new Regex(filter.FilterString);
                        Match match = regex.Match(matchName);
                        filtersMatch = match.Success;
                        break;
                }
                if (filtersMatch == true) {
                    break;
                }
            }

            return filtersMatch;
        }
        #endregion

        #region Save/Load methods
        public void ValidateCurrentTemplate()
        {
            var templateContent = Properties.Resources.Angular_Xrm_ts_xml;

            // load the script template from the embedded resource and update if different
            // check the version in the template 
            var updateTemplate = true;
            if (File.Exists(ScriptTemplate)) 
            {
                // load the template that we embedded as a resource 
                var newDoc = new XmlDocument();
                newDoc.LoadXml(templateContent);

                var newDate = DateTime.Now;
                DateTime.TryParse(newDoc.DocumentElement.GetAttribute("lastUpdate"), out newDate);

                // load the old document
                var oldDoc = new XmlDocument();
                oldDoc.Load(ScriptTemplate);

                var oldDate = DateTime.MinValue;
                DateTime.TryParse(oldDoc.DocumentElement.GetAttribute("lastUpdate"), out oldDate);

                if (newDate > oldDate) {
                    if (DialogResult.Yes != MessageBox.Show("A newer version of the template has been included with this version. " +
                        "Would you like to use the updated version?", "Updated Template", MessageBoxButtons.YesNo, MessageBoxIcon.Question)) {
                        updateTemplate = false;
                    }
                }
            }

            // update the current file... 
            if (updateTemplate) {
                File.WriteAllText(ScriptTemplate, templateContent);
            }
        }

        public void SaveConfiguration(string fileName) {
            
            // serialize to disk...
            var settings = new XmlWriterSettings { Indent = true };
            var serializer = new DataContractSerializer(typeof(ConfigurationInfo), new List<Type> { typeof(FilterInfo) });

            using (var w = XmlWriter.Create(fileName, settings)) {
                serializer.WriteObject(w, this);
            }
        }

        public ConfigurationInfo LoadConfiguration(string fileName) {
            ConfigurationInfo config = null;

            // deserialize from file
            if (File.Exists(fileName)) 
            {
                using (var reader = new StreamReader(fileName)) {
                    var serializer = new DataContractSerializer(typeof(ConfigurationInfo), new List<Type> { typeof(FilterInfo) });
                    config = (ConfigurationInfo)serializer.ReadObject(reader.BaseStream);
                }
            }

            return config;
        }

        #endregion

        #region Public properties

        [DisplayName("Module Name")]
        [Description("Module Name for the generated TypeScript")]
        [Category("Project Settings")]
        public string ModuleName { get; set; }

        [DisplayName("Module Notes")]
        [Description("Notes to be included with the generated TypeScript")]
        [Category("Project Settings")]
        public string ModuleNotes { get; set; }

        [DisplayName("Script Template")]
        [Description("Target script template for generated TypeScript output. Select an alternate template if you have made changes that you would like to be incorporated")]
        [Category("Project Settings")]
        [Editor(typeof(OpenFileNameEditor), typeof(UITypeEditor))]
        public string ScriptTemplate { get; set; }

        [DisplayName("Attributes Filters")]
        [Description("List of filters to be applied to Attribute generation. These are attributes that you want to be excluded from the generated template.")]
        [Category("Filter Settings")]
        [ListBindable(BindableSupport.Yes)]
        public List<FilterInfo> AttributeFilters { get; set; }

        [DisplayName("Include Virual Attribute Types")]
        [Description("Flag indicating whether to output Virtual Attribute types, such as owneridname") ]
        [Category("Filter Settings")]
        [DefaultValue(false)]
        public bool IncludeVirtualAttribute { get; set; }

        [DisplayName("Entity Types")]
        [Description("Which Entity types should be loaded on retrieve.")]
        [Category("Filter Settings")]
        public EnumEntityTypes EntityTypes { get; set; }

        [DisplayName("Entity Filters")]
        [Description("List of filters to be applied to Entity retrieval and generation. These are Entities that you want to be excluded from the list and not generated in the template.")]
        [Category("Filter Settings")]
        public List<FilterInfo> EntityFilters { get; set; }

        [DisplayName("Retrieve As If Published")]
        [Description("Flag indicating whether to retrieve the metadata that has not been published")]
        [Category("Project Settings")]
        public bool RetrieveAsIfPublished { get; set; }

        [DisplayName("Default Language Code")]
        [Description("Language code to be used if LocalizedLabels are present for Entity and Attribute properties")]
        [Category("Project Settings")]
        public int LanguageCode { get; set; }

        [DisplayName("Logging Level")]
        [Description("Toggle to enable logging while generating the templates")]
        [Category("Project Settings")]
        public EnumLoggingLevel LoggingLevel { get; set; }

        [Category("All Settings")]
        [Description("Name of the exported settings file")]
        public string SettingsFileName { get; set; }

        #endregion
    }
}
