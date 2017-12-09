namespace Xrm.Tools
{
    public class Constants
    {
        public const string REGEX_ATTRIBUTE_MATCH = @"(\{\#attr\s*(upper|lower|title|dt|api|)\s*\(.*?\)\#\})";
        public const string REGEX_ENTITY_MATCH = @"(\{\#ent\s*(upper|lower|title|)\s*\(.*?\)\#\})";

        public const string SLUG_PREFIX_ENT = "{#ent";
        public const string SLUG_PREFIX_ATTR = "{#attr";

        public const string FILE_TYPE_TS = "TypeScript File";
        public const string FILE_EXT_TS = ".ts";
        
        public const string FILE_TYPE_XML = "XML";
        public const string FILE_EXT_XML = ".xml";
        
        public const string FILE_DLG_FILTER_ALL_FILES = "All files (*.*)|*.*";

        // public const string TAB = "   ";
        public static string GetFileOpenFilter()
        {
            var filter = getFilter(FILE_TYPE_TS, FILE_EXT_TS);
            filter += "|" + getFilter(FILE_TYPE_XML, FILE_EXT_XML);
            filter += "|" + FILE_DLG_FILTER_ALL_FILES;

            return filter;
        }

        public static string getFilter(string type, string ext) {
            return string.Format("{0} (*{1})|*{1}", type, ext);
        }

    }
}
