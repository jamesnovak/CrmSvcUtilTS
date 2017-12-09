using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using System.Collections.Generic;
using System.Linq;

namespace Xrm.Tools.Helper
{
    public class CrmActions
    {
        public static List<EntityMetadata> GetAllEntities(IOrganizationService service, ConfigurationInfo config)
        {
            // retrieve all entities (just entity metadata)
            var req = new RetrieveAllEntitiesRequest()
            {
                EntityFilters = EntityFilters.Entity,
                RetrieveAsIfPublished = config.RetrieveAsIfPublished
            };
            var resp = (RetrieveAllEntitiesResponse)service.Execute(req);

            // set the itemsource of the itembox equal to entity metadata that is customizable (takes out systemjobs and stuff like that)
            var entities = resp.EntityMetadata.Where(x => x.IsCustomizable.Value == true).ToList<EntityMetadata>();

            return entities;
        }

        public static EntityMetadata RetrieveEntityAttributeMeta(IOrganizationService service, ConfigurationInfo config, string logicalName)
        {
            // Retrieve the attribute metadata
            var req = new RetrieveEntityRequest()
            {
                LogicalName = logicalName,
                EntityFilters = EntityFilters.Attributes,
                RetrieveAsIfPublished = config.RetrieveAsIfPublished
            };
            var resp = (RetrieveEntityResponse)service.Execute(req);

            return resp.EntityMetadata;
        }
    }
}
