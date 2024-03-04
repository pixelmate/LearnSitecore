using Foundation.LearnSitecore.ScribanExtensions.Model;
using Scriban.Runtime;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.XA.Foundation.Abstractions;
using Sitecore.XA.Foundation.Scriban.Pipelines.GenerateScribanContext;
using System;
namespace Foundation.LearnSitecore.ScribanExtensions.Pipeline
{
    public class LinkExtensions : IGenerateScribanContextProcessor
    {
        protected readonly IPageMode PageMode;
        private readonly IContext context;
        private delegate LinkInfo LinkInfoDelegate(Item item, object linkFieldName);

        public LinkExtensions(IPageMode pageMode, IContext context)
        {
            PageMode = pageMode;
            this.context = context;
        }

        public void Process(GenerateScribanContextPipelineArgs args)
        {
            var linkInfo = new LinkInfoDelegate(GetLinkInfo);
            args.GlobalScriptObject.Import("sc_link_info", (Delegate)linkInfo);
        }

        public LinkInfo GetLinkInfo(Item item, object field)
        {
            if (item == null
                || String.IsNullOrWhiteSpace((string)field)
                || item.Fields[(string)field] == null
                )
            {
                return null;
            }

            LinkField lnkField = (LinkField)item.Fields[(string)field];
            if (lnkField == null)
            {
                return null;
            }

            return new LinkInfo(lnkField);
        }
    }
}