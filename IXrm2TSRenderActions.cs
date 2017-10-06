using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Xrm.Tools
{
    /// <summary>
    /// Interface that outlines the methods required for generating the script objects
    /// </summary>
    public interface IXrm2TSRenderActions
    {
        /// <summary>
        /// Return the fully rendered entity template 
        /// </summary>
        /// <returns></returns>
        StringBuilder RenderEntityTemplate();
        StringBuilder RenderEntityTemplate(StringBuilder appendTo);

        /// <summary>
        /// Render the base Entity Interface that will be used when calling the Web API methods 
        /// </summary>
        void RenderEntityInterface();
        void RenderEntityInterface(StringBuilder appendTo);

        /// <summary>
        /// Render the list of Attributes for both the Entity Form and the Web API calls
        /// </summary>
        void RenderEntityAttributes();
        void RenderEntityAttributes(StringBuilder appendTo = null);

        /// <summary>
        /// Render the entity class that is passed to the web API call for init and returns
        /// </summary>
        void RenderEntityClass();
        void RenderEntityClass(StringBuilder appendTo = null);
    }
}
