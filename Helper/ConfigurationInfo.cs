using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing.Design;
using System.Text.RegularExpressions;

using Xrm.Tools.Helper;

namespace Xrm.Tools
{
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

    [DisplayName("Filter Criteria")]
    [Category("Filter Settings")]
    [Description("Class containing information about exclusion filters")]
    [DefaultProperty("FilterString")]
    public class FilterInfo {
        [DisplayName("Filter Text")]
        [Description("Provide the filter text to be applied")]
        [Category("Filter Settings")]

        public string FilterString{ get; set; }

        [DisplayName("Filter Match")]
        [Description("Choose how this Filter String will be applied")]
        [Category("Filter Settings")]
        public EnumFilterMatchType FilterMatchType { get; set; }

        public override string ToString() {
            return this.FilterMatchType.ToString() + ": " + this.FilterString;
        }
    }

    //// TODO - each framework target has a few settings?
    //// need to iron out just how to make this "pluggable"
    //public class ScriptFramework {

    //    /// <summary>
    //    /// Display name of the script framework being generated
    //    /// </summary>
    //    public string DisplayName { get; set; }

    //    /// <summary>
    //    /// Default filename for the template file
    //    /// </summary>
    //    public string TemplateFileName { get; set; }
        
    //    /// <summary>
    //    /// Contents of the template that will be saved to disk on load of the component
    //    /// </summary>
    //    public string TemplateContents { get; set; }        
    //};

    public class ConfigurationInfo
    {
        #region Constructor 
        public ConfigurationInfo() {
            ModuleName = "MyProject";
            ModuleNotes = "A CRM Typescript Project";
            ScriptTemplate = @"C:\Temp\";

            AttributeFilters = new List<FilterInfo>() {
                new FilterInfo(){ FilterString = "versionnumber", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "yominame", FilterMatchType =EnumFilterMatchType.Contains },
                new FilterInfo(){ FilterString = "importsequencenumber", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "timezoneruleversionnumber", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "utcconversiontimezonecode", FilterMatchType =EnumFilterMatchType.Equals },
                new FilterInfo(){ FilterString = "onbehalf", FilterMatchType =EnumFilterMatchType.Contains },
                new FilterInfo(){ FilterString = "overriddencreatedon", FilterMatchType =EnumFilterMatchType.Equals }
            };

            EntityFilters = new List<FilterInfo>() { new FilterInfo() { FilterString = "syncerror", FilterMatchType = EnumFilterMatchType.Equals } };

            EntityTypes = EnumEntityTypes.BothCustomAndSystem;
            RetrieveAsIfPublished = false;
            TemplateContent = Properties.Resources.Angular_Xrm_ts_xml;
            ScriptTemplate = "Angular.ts.template";
            // TODO - make this a configurable bit?
            //ScriptFrameworks = new ScriptFramework[] {
            //    new ScriptFramework() {
            //        DisplayName = "Angular",
            //        TemplateFileName = "Angular.ts.template",
            //        TemplateContents = Properties.Resources.Angular_Xrm_ts_xml
            //    }
            //};
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

        //[Browsable(false)]
        //[DisplayName("Script Frameworks")]
        //[Description("List of available script frameworks for the TypeScript output.")]
        //[Category("Project Settings")]
        //public ScriptFramework[] ScriptFrameworks { get; set; }

        [Browsable(false)]
        [DisplayName("Script Template Contents")]
        [Description("Default script frameworks for the TypeScript output.")]
        [Category("Project Settings")]
        public string TemplateContent { get; set; }

        [DisplayName("Logging Level")]
        [Description("Toggle to enable logging while generating the templates")]
        [Category("Project Settings")]
        public EnumLoggingLevel LoggingLevel { get; set; }

        #endregion
    }
}
