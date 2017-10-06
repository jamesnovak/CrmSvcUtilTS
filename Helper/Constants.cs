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

        private static string getFilter(string type, string ext) {
            return string.Format("{0} (*{1})|*{1}", type, ext);
        }

        //public static string GetTabs()
        //{
        //    return GetTabs(1);
        //    }
        //    public static string GetTabs(int count) {
        //    var tabs = "";
        //    for (int i=0; i < count; i++) {
        //        tabs += TAB;
        //    }
        //    return tabs;
        //}
    }
}
