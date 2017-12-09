using System;
using System.IO;
using System.Xml;
using System.Reflection;
using System.Linq;

using System.Text;
using System.Collections.Generic;

using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk;
using System.Text.RegularExpressions;

namespace Xrm.Tools
{
    public class Xrm2TypeScriptGenerator
    {
        #region Private 
        List<EntityMetadata> _entityMeta = null;
        StringBuilder _builderOutput = null;
        ConfigurationInfo _configuration = null;

        Dictionary<string, string> _projectSlugs = null;
        Dictionary<string, string> _entitySlugs = null;
        Dictionary<string, string> _attribSlugs = null;

        List<PropertyInfo> _entityProperties = null;
        List<PropertyInfo> _attributeProperties = null;

        // helper attributes for the regex match callbacks... 
        AttributeMetadata _currentAttribMeta = null;
        EntityMetadata _currentEntityMeta = null;

        #endregion

        public StringBuilder Logger { get; private set; }
        public StringBuilder GeneratedOutput { get; private set; }

        public Xrm2TypeScriptGenerator(ConfigurationInfo config, List<EntityMetadata> entityMeta)
        {
            _entityMeta = entityMeta;
            _configuration = config;
            _builderOutput = new StringBuilder();
            Logger = new StringBuilder();
            GeneratedOutput = null;

            if (_configuration.LoggingLevel == EnumLoggingLevel.None) {
                Logger.AppendLine("Logging has been disabled.");
            }

            LogMessage("Init the Entity and Attribute property info.", EnumLoggingLevel.Information);

            _entityProperties = typeof(EntityMetadata).GetProperties().ToList();
            _attributeProperties = typeof(AttributeMetadata).GetProperties().ToList();

            _projectSlugs = new Dictionary<string, string>() {
                { "{#module_name#}", _configuration.ModuleName },
                { "{#module_notes#}", _configuration.ModuleNotes }
            };
            foreach (var prop in _projectSlugs) {
                LogMessage(string.Format("Project Property: {0}={1}", prop.Key, prop.Value), EnumLoggingLevel.Verbose);
            }
        }

        /// <summary>
        /// Generate script for all classes in the provided list of EntityMetadata objects
        /// </summary>
        /// <returns></returns>
        public void GenerateAllClassTemplates()
        {
            if (!File.Exists(_configuration.ScriptTemplate))
            {
                throw new ApplicationException("The Script Template does not exist: " + _configuration.ScriptTemplate);
            }

            LogMessage("Loading template document: " + _configuration.ScriptTemplate, EnumLoggingLevel.Information);
            var doc = LoadTemplateDocument();

            // iterate on the nodes... start it off with the root element
            XmlElement templateElement = doc.DocumentElement;

            LogMessage("Begin iterating on template nodes", EnumLoggingLevel.Verbose);

            foreach (XmlNode node in templateElement.ChildNodes) {
                ProcessNode(node, _builderOutput);
            }

            GeneratedOutput = _builderOutput;
        }

        /// <summary>
        /// Process the current XmlNode - act based on each type
        /// </summary>
        /// <param name="node"></param>
        /// <param name="output"></param>
        void ProcessNode(XmlNode node, StringBuilder output, EntityMetadata entityMeta = null)
        {
            LogMessage("Process node: " + node.Name, EnumLoggingLevel.Information);

            // loop on the child nodes and process each child element
            switch (node.NodeType)
            {
                case XmlNodeType.CDATA:
                    output.AppendLine(ProcessCDataSection(node.InnerText));
                    break;

                case XmlNodeType.Element:
                    switch (node.Name)
                    {
                        case "template":
                            ProcessChildNodes(node, output);
                            break;

                        // Entity Element - iterate on each of the incoming entity metadata items
                        case "entity":
                            ProcessEntitiesList(node, output);
                            break;

                        // Attribute list... should only be a single CData element, no other children
                        // grab this template and iterate on entity attributes
                        case "attribute_list":
                            var cdata = node.FirstChild.InnerText;
                            foreach (var attrib in entityMeta.Attributes) {
                                
                                // filter based on configuration settings
                                if (_configuration.FilterAttribute(attrib.SchemaName))
                                    continue;

                                // decide whether we want to include processing a virtual attrib
                                if (attrib.AttributeType == AttributeTypeCode.Virtual && !_configuration.IncludeVirtualAttribute) {
                                    continue;
                                }

                                output.AppendLine(ProcessCDataSection(cdata, attrib));
                            }
                            break;
                    }
                    break;
            }
        }

        void ProcessEntitiesList(XmlNode node, StringBuilder output)
        {
            // iterate on each of the entities and process the <entity> element children
            foreach (var entity in _entityMeta)
            {
                // filter based on the config values
                if (_configuration.FilterEntity(entity.LogicalName))
                    continue;

                LogMessage("Processing entity: " + FirstUpper(entity.LogicalName), EnumLoggingLevel.Information);

                // init the project and propert level slugs
                _entitySlugs = new Dictionary<string, string>();
                _currentEntityMeta = entity;

                // add the other attribute properties
                foreach (var entProp in _entityProperties)
                {
                    var prop = new KeyValuePair<string, string>(entProp.Name.ToLower(),GetPropertyValue(entity, entProp));
                    
                    // get the current value for each property in the entity
                    _entitySlugs.Add(prop.Key, prop.Value);
                    LogMessage(string.Format("Entity Property: {0}={1}", entProp.Name, prop.Value), EnumLoggingLevel.Verbose);
                }

                // process the node, either CData, <attribute_list>, etc
                ProcessChildNodes(node, output, entity);
            }
        }

        /// <summary>
        /// Process each of the childe nodes for this current node
        /// </summary>
        /// <param name="node"></param>
        /// <param name="output"></param>
        private void ProcessChildNodes(XmlNode node, StringBuilder output, EntityMetadata entityMeta = null)
        {
            // Entity Element - iterate on cdata and attribute lists
            foreach (XmlNode child in node.ChildNodes)
            {
                ProcessNode(child, output, entityMeta);
            }
        }
        /// <summary>
        /// Process the CData section, escape any of the known slugs for each level 
        /// </summary>
        /// <param name="cdataText"></param>
        /// <param name="attribMeta"></param>
        /// <returns></returns>
        private string ProcessCDataSection(string cdataText, AttributeMetadata attribMeta = null)
        {
            var escapedString = cdataText;

            // iterate on the project level properties and replace slugs 
            LogMessage("Process Project level Properties", EnumLoggingLevel.Information);
            foreach (var prop in _projectSlugs) {
                escapedString = escapedString.Replace(prop.Key, prop.Value);
            }

            if (cdataText.Contains(Constants.SLUG_PREFIX_ATTR) || cdataText.Contains(Constants.SLUG_PREFIX_ENT))
            {
                if (_entitySlugs != null)
                {
                    // run the regex to find all of the Entity slugs for this section 
                    LogMessage("Process Entity level Properties", EnumLoggingLevel.Information);
                    escapedString = Regex.Replace(escapedString, Constants.REGEX_ENTITY_MATCH, matchEvaluator, RegexOptions.Multiline | RegexOptions.Compiled);
                }

                // handle the current attribute metadata 
                if (attribMeta != null)
                {
                    LogMessage("Process Attribute level Properties", EnumLoggingLevel.Information);

                    // get all of the attribute properties for the current attribute meta
                    _attribSlugs = new Dictionary<string, string>();
                    _currentAttribMeta = attribMeta;

                    foreach (var attribProp in _attributeProperties) {
                        // grab the value from the attribute metadata object
                        var prop = new KeyValuePair<string, string>(attribProp.Name.ToLower(), GetPropertyValue(attribMeta, attribProp));

                        LogMessage(string.Format("Attribute Prop: {0}={1}", attribProp.Name, prop.Value), EnumLoggingLevel.Verbose);

                        // add the lower case property name with the current value
                        _attribSlugs.Add(attribProp.Name.ToLower(), GetPropertyValue(attribMeta, attribProp));
                    }
                    // run the regex to find all of the Atrribute slugs for this section 
                    escapedString = Regex.Replace(escapedString, Constants.REGEX_ATTRIBUTE_MATCH, matchEvaluator, RegexOptions.Multiline | RegexOptions.Compiled);
                }
            }
            
            // match evaluator for the regex... handles both entites and attributes
            string matchEvaluator(Match match) {

                foreach (var g in match.Groups) {
                    g.ToString();
                }
                 
                var propertyValue = "";
                // remove all spaces so we can evaluate properly
                var matchString = Regex.Replace(match.ToString(), @"\s+", "").ToLower();

                var isAttribute = matchString.StartsWith("{#attr");

                // get the property name from between the parens 
                var startPos = matchString.IndexOf("(") + 1;
                var endPos = matchString.IndexOf(")");
                var propertyName = matchString.Substring(startPos, endPos - startPos);
                // get the property value 
                if (isAttribute) {
                    propertyValue = _attribSlugs[propertyName];
                }
                else {
                    propertyValue = _entitySlugs[propertyName];
                }

                if (matchString.Contains("upper(")) {
                    propertyValue = propertyValue.ToUpper();
                }
                else if (matchString.Contains("lower(")) {
                    propertyValue = propertyValue.ToLower();
                }
                else if (matchString.Contains("title(")) {
                    propertyValue = FirstUpper(propertyValue);
                }

                // check the special cases for attributes
                if (isAttribute)
                {
                    // check for the additional data type slug
                    if (matchString.Contains("dt(") && (propertyName == "attributetype"))
                    {
                        propertyValue = GetDataType();
                    }
                    else if (matchString.Contains("api(") && (propertyName == "schemaname"))
                    {
                        propertyValue = LookupFixer();
                    }
                }
                LogMessage(string.Format("Match: {0}, Property Name:{1}, Property Value: {2}", match.ToString(), propertyName, propertyValue), EnumLoggingLevel.Verbose);
                return propertyValue;
            };

            return escapedString;
        }

        /// <summary>
        /// Load the template... for now, embedded resource 
        /// </summary>
        /// <returns></returns>
        XmlDocument LoadTemplateDocument()
        {
            var doc = new XmlDocument();
            LogMessage("Load script template from file: " + _configuration.ScriptTemplate, EnumLoggingLevel.Information);
            doc.Load(_configuration.ScriptTemplate);
            return doc;
        }

        #region Utility functions
        string GetPropertyValue(object data, PropertyInfo p)
        {
            var propValue = "";
            object dataValue = p.GetValue(data);

            if (dataValue != null)
            {
                if (dataValue is AttributeTypeDisplayName)
                {
                    propValue = ((AttributeTypeDisplayName)dataValue).Value;
                }
                else if (dataValue is BooleanManagedProperty)
                {
                    var boolean = (BooleanManagedProperty)dataValue;
                    propValue = boolean.Value.ToString();
                }
                else if (dataValue is AttributeRequiredLevelManagedProperty)
                {
                    var reqLevel = (AttributeRequiredLevelManagedProperty)dataValue;
                    propValue = reqLevel.Value.ToString();
                }
                else if (dataValue is Label)
                {
                    var label = (Label)dataValue;
                    if (label.LocalizedLabels.Count > 0)
                    {
                        var localLabel = label.LocalizedLabels.Where(l => l.LanguageCode == _configuration.LanguageCode).First();
                        if (localLabel != null) {
                            propValue = localLabel.Label;
                        }
                    }
                }
                else
                {
                    propValue = dataValue.ToString();
                }
            }

            return propValue;
        }

        /// <summary>
        /// Format the name for the Web API call for lookups
        /// </summary>
        /// <param name="attrib"></param>
        /// <returns></returns>
        string LookupFixer()
        {
            var name = _currentAttribMeta.SchemaName.ToLower();
            switch (_currentAttribMeta.AttributeType)
            {
                case AttributeTypeCode.Lookup:
                case AttributeTypeCode.Owner:
                case AttributeTypeCode.PartyList:
                    if ((!_currentAttribMeta.IsPrimaryId.Value) && !name.Contains("activity"))
                    {
                        name = "_" + name + "_value";
                    }
                    break;
            }
            return name;
        }

        /// <summary>
        /// Convert first char to upper
        /// </summary>
        /// <param name="stringValue"></param>
        /// <returns></returns>
        string FirstUpper(string val)
        {
            char[] a = val.ToCharArray();
            a[0] = char.ToUpper(a[0]);
            return new string(a);
        }

        /// <summary>
        /// Get data type string based on AttributeTypeCode
        /// </summary>
        /// <param name="attr"></param>
        /// <returns></returns>
        string GetDataType()
        {
            return GetDataType(_currentAttribMeta.AttributeType.Value);
        }

        string GetDataType(AttributeTypeCode atc)
        {
            var dataType = "string";
            switch (atc)
            {
                case AttributeTypeCode.Virtual:
                case AttributeTypeCode.State:
                case AttributeTypeCode.Integer:
                case AttributeTypeCode.BigInt:
                case AttributeTypeCode.Money:
                case AttributeTypeCode.Decimal:
                case AttributeTypeCode.Double:
                    dataType = "number";
                    break;
            }
            LogMessage( string.Format("Get attribute script datatype: {0} => {1}", atc.ToString(), dataType), EnumLoggingLevel.Verbose);
            return dataType;
        }

        private void LogMessage(string logMessage, EnumLoggingLevel loggingLevel) {

            if (_configuration.LoggingLevel == loggingLevel)
            {
                var now = DateTime.Now;
                Logger.AppendLine(string.Format ("{0} {1}: {2}", now.ToShortDateString(), now.ToLongTimeString(), logMessage));
            }
        }

        #endregion
    }
}
