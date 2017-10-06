using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk.Metadata;
using System.Xml;

namespace Xrm.Tools
{
    public class Xrm2TSRenderCustom: Xrm2TSRenderBase, IXrm2TSRenderActions
    {
        Dictionary<string, string> _projectProps = null;
        Dictionary<string, string> _entityProps = null;

        public Xrm2TSRenderCustom(EntityMetadata entityMeta, StringBuilder appendTo, StringBuilder logger, ConfigurationInfo config) :
            base(entityMeta, appendTo, logger, config)
        {
            // init the project and propert level slugs
            _projectProps = new Dictionary<string, string>() {
                {  "{#ent_logicalname#}", _entityMeta.LogicalName },
                {  "{#ent_logicalname_title#}", firstUpper(_entityMeta.LogicalName) },
                {  "{#ent_primary_name#}", _entityMeta.PrimaryNameAttribute },
                {  "{#ent_primary_id#}", _entityMeta.PrimaryIdAttribute },
                {  "{#ent_logicalname_lower#}", _entityMeta.LogicalName.ToLower() },
                {  "{#ent_display_name#}", (_entityMeta.DisplayName.LocalizedLabels.Count > 0) ? _entityMeta.DisplayName.LocalizedLabels[0].Label : _formattedName},
                {  "{#ent_description#}", (_entityMeta.Description.LocalizedLabels.Count > 0) ? _entityMeta.Description.LocalizedLabels[0].Label : _entityMeta.LogicalName }
            };
            _entityProps = new Dictionary<string, string>() {
                {  "{#module_name#}", _configuration.ModuleName },
                { "{#module_notes#}", _configuration.ModuleNotes }
            };
        }

        public StringBuilder RenderEntityTemplate()
        {
            return RenderEntityTemplate(_sb);
        }

        public StringBuilder RenderEntityTemplate(StringBuilder appendTo)
        {
            // doc element should be template.  contains CData with script body and child <entity> tags
            // iterate on each of the nodes, replace slugs in each of the CData sections 
            // structure 
            //  <template>
            //      <![CDATA[]]>
            //      <entity>
            //          <![CDATA[]]>
            //          <attribute_list>
            //              <![CDATA[]]>
            //          </attribute_list>
            //          <![CDATA[]]>
            //      </entity>
            //      <![CDATA[]]>
            //  <template>

            Logger.AppendLine("Loading template document: " + _configuration.ScriptTemplate);
            var doc = LoadTemplateDocument();

            // iterate on the nodes... start it off with the root element
            XmlElement templateElement = doc.DocumentElement;
            Logger.AppendLine("Begin iterating on template nodes");
            foreach (XmlNode node in templateElement.ChildNodes) {
                ProcessNode(node, appendTo);
            }

            return appendTo;
        }


        /// <summary>
        /// Process the current XmlNode - act based on each type
        /// </summary>
        /// <param name="node"></param>
        /// <param name="output"></param>
        private void ProcessNode(XmlNode node, StringBuilder output)
        {
            Logger.AppendLine("Process node: " + node.Name);
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
                        case "entity":
                            // Entity Element - iterate on cdata and attribute lists
                            foreach (XmlNode child in node.ChildNodes)
                            {
                                ProcessNode(child, output);
                            }
                            break;
                        case "attribute_list":
                            // Attribute list... should only be a single CData element, no other children
                            // grab this template and iterate on entity attributes
                            var cdata = node.FirstChild.InnerText;
                            foreach (var attrib in _entityMeta.Attributes)
                            {
                                output.AppendLine(ProcessCDataSection(cdata, attrib));
                            }
                            break;
                    }
                    break;
            }
        }

        /// <summary>
        /// Process the CData section, escape any of the known slugs for each level 
        /// </summary>
        /// <param name="cdataText"></param>
        /// <param name="attrib"></param>
        /// <returns></returns>
        private string ProcessCDataSection(string cdataText, AttributeMetadata attrib = null)
        {
            var escapedString = cdataText;

            // iterate on the project level properties and replace slugs 
            foreach (var prop in _projectProps)
            {
                escapedString = escapedString.Replace(prop.Key, prop.Value);
            }

            // now, the entites
            foreach (var prop in _entityProps) {
                escapedString = escapedString.Replace(prop.Key, prop.Value);
            }

            if (attrib != null)
            {
                escapedString = escapedString
                    .Replace("{#attr_formatted_name#}", lookupFixer(attrib))
                    .Replace("{#attr_schema_name#}", attrib.SchemaName)
                    .Replace("{#attr_schema_name_lower#}", attrib.SchemaName.ToLower())
                    .Replace("{#attr_datatype_crm#}", attrib.AttributeTypeName.Value)
                    .Replace("{#attr_datatype_script#}", getDataType(attrib));
            }

            return escapedString;
        }

        /// <summary>
        /// Load the template... for now, embedded resource 
        /// </summary>
        /// <returns></returns>
        private XmlDocument LoadTemplateDocument()
        {
            var doc = new XmlDocument();

            doc.Load(_configuration.ScriptTemplate);

            return doc;
        }

        #region NotImplemented
        public void RenderEntityAttributes()
        {
            throw new NotImplementedException();
        }

        public void RenderEntityAttributes(StringBuilder appendTo = null)
        {
            throw new NotImplementedException();
        }

        public void RenderEntityClass()
        {
            throw new NotImplementedException();
        }

        public void RenderEntityClass(StringBuilder appendTo = null)
        {
            throw new NotImplementedException();
        }

        public void RenderEntityInterface()
        {
            throw new NotImplementedException();
        }

        public void RenderEntityInterface(StringBuilder appendTo)
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
