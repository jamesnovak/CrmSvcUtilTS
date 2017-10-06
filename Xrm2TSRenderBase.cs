using System.Text;

using Microsoft.Xrm.Sdk.Metadata;
using System.Text.RegularExpressions;
using System.Collections.Generic;

namespace Xrm.Tools
{
    /// <summary>
    /// Abstract base class for the EntityRendering component
    /// </summary>
    public abstract class Xrm2TSRenderBase
    {
        #region Protected 
        protected EntityMetadata _entityMeta = null;
        protected StringBuilder _sb = null;
        protected string _formattedName = null;
        protected ConfigurationInfo _configuration { get; private set; }
        #endregion

        public StringBuilder Logger { get; private set; }

        public Xrm2TSRenderBase(EntityMetadata entityMeta, StringBuilder appendTo, StringBuilder logger, ConfigurationInfo config) {
            _sb = appendTo;
            _entityMeta = entityMeta;
            _formattedName = firstUpper(_entityMeta.LogicalName);
            Logger = logger;
            _configuration = config;
        }

        #region Utility functions 
        /// <summary>
        /// Format the name for the Web API call for lookups
        /// </summary>
        /// <param name="attrib"></param>
        /// <returns></returns>
        protected string lookupFixer(AttributeMetadata attrib)
        {
            var name = attrib.LogicalName;
            if ((attrib.AttributeType.Value == AttributeTypeCode.Lookup) && (!attrib.IsPrimaryId.Value) && !name.Contains("activity")) {
                name = "_" + name + "_value";
            }
            return name;
        }

        /// <summary>
        /// Convert first char to upper
        /// </summary>
        /// <param name="stringValue"></param>
        /// <returns></returns>
        protected string firstUpper(string val)
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
        protected string getDataType(AttributeMetadata attr)
        {
            var dataType = "string";
            // assign a type based on attributetypecode
            if (attr.AttributeType == AttributeTypeCode.Virtual || attr.AttributeType == AttributeTypeCode.State ||
                attr.AttributeType == AttributeTypeCode.Integer || attr.AttributeType == AttributeTypeCode.BigInt ||
                attr.AttributeType == AttributeTypeCode.Money || attr.AttributeType == AttributeTypeCode.Decimal ||
                attr.AttributeType == AttributeTypeCode.Double)
            {
                dataType = "number";
            }
            return dataType;
        }

        #endregion
    }

}
