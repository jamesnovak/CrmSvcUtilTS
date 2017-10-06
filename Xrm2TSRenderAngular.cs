using System.Text;
using Microsoft.Xrm.Sdk.Metadata;

namespace Xrm.Tools
{

    /// <summary>
    /// Implementation for Angular libraries
    /// </summary>
    public class Xrm2TSRenderAngular : Xrm2TSRenderBase, IXrm2TSRenderActions
    {
        #region Constructors
        public Xrm2TSRenderAngular(EntityMetadata entityMeta, StringBuilder appendTo, StringBuilder logger, ConfigurationInfo config) : 
            base(entityMeta, appendTo, logger, config) {}
        #endregion

        /// <summary>
        /// Render the entire class and return the results as a StringBuilder
        /// </summary>
        /// <returns></returns>
        public StringBuilder RenderEntityTemplate() {
            return RenderEntityTemplate(_sb);
        }
        public StringBuilder RenderEntityTemplate(StringBuilder appendTo)
        {
            Logger.AppendLine(string.Format("{0}: Begin Rendering Entity template", _formattedName));
            appendTo.Append(Constants.GetTabs())
                .AppendLine(string.Format("//** @description AUTO GENERATED CLASSES FOR {0}", _formattedName));

            RenderEntityInterface(appendTo);
            RenderEntityAttributes(appendTo);
            RenderEntityClass(appendTo);

            Logger.AppendLine(string.Format("{0}: End Rendering Entity template", _formattedName));

            return appendTo;
        }

        /// <summary>
        /// 
        /// </summary>
        public void RenderEntityInterface() {
            RenderEntityInterface(_sb);
        }
        public void RenderEntityInterface(StringBuilder appendTo)
        {
            Logger.AppendLine(string.Format("{0}: Rendering Entity Interface Web API method calls", _formattedName));

            appendTo.Append(Constants.GetTabs())
                .AppendLine(string.Format("//** @description WebAPI collection interface for {0} */", _formattedName))
                .Append(Constants.GetTabs())
                .AppendLine(string.Format("export interface I{0}s extends IRetrieveMultipleData<I{1}> {{}}", _formattedName, _formattedName))
                .Append(Constants.GetTabs())
                .AppendLine(string.Format("//** @description WebAPI interface for {0} */", _formattedName))
                .Append(Constants.GetTabs())
                .AppendLine(string.Format("export interface I{0} {{", _formattedName))
                .Append(Constants.GetTabs(2))
                .AppendLine("[key: string]: string | number");

            Logger.AppendLine(string.Format("{0}: Rendering Entity Interface Web API attributes", _formattedName));
            foreach (var attr in _entityMeta.Attributes)
            {
                // filter based on configuration settings
                if (_configuration.FilterAttribute(attr.SchemaName))
                    continue;

                appendTo.Append(Constants.GetTabs(2))
                    .AppendLine(string.Format("{0}?: {1}", lookupFixer(attr), getDataType(attr)));
            }

            // close out the class
            appendTo.AppendLine(Constants.GetTabs(1) + "}");
        }

        /// <summary>
        /// Render the list of Attributes for both the Entity Form and the Web API calls
        /// </summary>
        public void RenderEntityAttributes()
        {
            RenderEntityAttributes(_sb);
        }

        /// <summary>
        /// Render the list of Attributes for both the Entity Form and the Web API calls
        /// </summary>
        /// <param name="appendTo">String builder to which the results will be appeneded</param>
        public void RenderEntityAttributes(StringBuilder appendTo)
        {
            Logger.AppendLine(string.Format("{0}: Rendering Entity Attributes class for Forms and Web API", _formattedName));

            appendTo.Append(Constants.GetTabs())
               .AppendLine(string.Format("//** Collection of Attribute structures for {0} */", _formattedName))
               .Append(Constants.GetTabs())
               .AppendLine(string.Format("export class {0}Attributes {{", _formattedName));


            Logger.AppendLine(string.Format("{0}: Rendering Entity Attributes Class collection", _formattedName));
            // render each of the entity attribute structures here
            foreach (var attr in _entityMeta.Attributes) {

                // filter based on configuration settings
                if (_configuration.FilterAttribute(attr.SchemaName))
                    continue;

                appendTo.Append(Constants.GetTabs(2))
                   .AppendLine(string.Format("{0}:IAttribName = {{ name:\"{0}\", api_name:\"{1}\" }}", attr.LogicalName, lookupFixer(attr)));
            }
            // close out the class
            appendTo.Append(Constants.GetTabs())
                .AppendLine("}");
        }

        /// <summary>
        /// Render the Entity class passed to the web API call for init and return values
        /// </summary>
        public void RenderEntityClass() {
            RenderEntityClass(_sb);
        }

        public void RenderEntityClass(StringBuilder appendTo) {

            Logger.AppendLine(string.Format("{0}: Rendering Entity Class details", _formattedName));

            appendTo.Append(Constants.GetTabs())
                .AppendLine(string.Format("/** @description Instantiates a {0} Entity to be used for CRUD based operations", _formattedName))
                .Append(Constants.GetTabs())
                .AppendLine("* @param {object} initData An optional parameter for a create and update entities */")
                .Append(Constants.GetTabs())
                .AppendLine(string.Format("export class {0} extends Entity {{", _formattedName))
                .Append(Constants.GetTabs())
                .AppendLine("[key: string]: string|number")
                .Append(Constants.GetTabs())
                .AppendLine(string.Format("public route: string = \"{0}s\";", _formattedName.ToLower()))
                .AppendLine();

            Logger.AppendLine(string.Format("{0}: Rendering Entity Attributes for Entity class", _formattedName));

            // generate the public class attributes
            foreach (var attr in _entityMeta.Attributes)
            {
                // filter based on configuration settings
                if (_configuration.FilterAttribute(attr.SchemaName))
                    continue;

                appendTo.Append(Constants.GetTabs(2))
                    .AppendLine(string.Format("public {0}: {1};", lookupFixer(attr), getDataType(attr)));
            }

            Logger.AppendLine(string.Format("{0}: Rendering Entity Class constructor", _formattedName));

            // generate the class constructor, populating the attributes
            appendTo.AppendLine()
                .Append(Constants.GetTabs(2))
                .AppendLine(string.Format("constructor(initData?: I{0}) {{", _formattedName))
                .Append(Constants.GetTabs(3))
                .AppendLine(string.Format("super(\"{0}s\");", _formattedName.ToLower()))
                .Append(Constants.GetTabs(3))
                .AppendLine("if (initData == undefined) { return; }")
                .AppendLine();

            Logger.AppendLine(string.Format( "{0}: Rendering attribute initilization in class constructor", _formattedName));
            foreach (var attr in _entityMeta.Attributes)
            {
                // filter based on configuration settings
                if (_configuration.FilterAttribute(attr.SchemaName))
                    continue;

                var name = lookupFixer(attr);
                appendTo.Append(Constants.GetTabs(3))
                    .AppendLine(string.Format("this.{0} = initData.{1};", name, name));
            }
            // close out the class
            appendTo.Append(Constants.GetTabs(3))
               .AppendLine(string.Format("this.id = initData.{0};", _entityMeta.PrimaryIdAttribute))
               .Append(Constants.GetTabs(2))
               .AppendLine("}")
               .Append(Constants.GetTabs())
               .AppendLine("}");
        }
    }
}
