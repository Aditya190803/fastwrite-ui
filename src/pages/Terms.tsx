import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen py-16 px-6 bg-background relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="group/back flex items-center gap-3 w-fit mb-8">
            <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center group-hover/back:bg-primary group-hover/back:border-primary transition-all duration-300">
              <ArrowLeft className="h-4 w-4 text-primary group-hover/back:text-black transition-colors" />
            </div>
            <span className="text-[10px] font-mono text-primary/80 group-hover/back:text-primary uppercase tracking-[0.4em] font-bold transition-colors">
              RETURN_TO_CORE
            </span>
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter leading-none italic mb-4">
            TERMS_OF_SERVICE
          </h1>
          <div className="w-32 h-[2px] bg-primary" />
          <p className="mt-6 text-[10px] font-mono text-white/60 uppercase tracking-widest">
            Last Updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-white/80">
          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              ACCEPTANCE
            </h2>
            <p className="font-body text-sm leading-relaxed">
              By using FastWrite, you agree to these terms of service. If you do not agree to these terms, 
              please do not use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              SERVICE_DESCRIPTION
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite is an AI-powered documentation generation tool. It analyzes source code and generates 
              comprehensive technical documentation using various AI providers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              USER_RESPONSIBILITIES
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm font-body">
              <li>You are responsible for the code you submit to the service</li>
              <li>You must have the rights to use any code you submit</li>
              <li>You are responsible for securing your own API keys</li>
              <li>You agree not to use the service for malicious purposes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              API_KEYS
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite uses your own API keys to communicate with AI providers. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm font-body mt-2">
              <li>Keeping your API keys secure</li>
              <li>Any charges incurred through your API usage</li>
              <li>Complying with the terms of service of your AI provider</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              INTELLECTUAL_PROPERTY
            </h2>
            <p className="font-body text-sm leading-relaxed">
              You retain all rights to your source code and the generated documentation. 
              FastWrite does not claim any ownership over content you create or process through the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              DISCLAIMER
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite is provided "as is" without warranties of any kind. We do not guarantee the accuracy, 
              completeness, or usefulness of generated documentation. Always review and verify generated content 
              before using it in production.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              LIMITATION_OF_LIABILITY
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite and its maintainers shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              MODIFICATIONS
            </h2>
            <p className="font-body text-sm leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              OPEN_SOURCE
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite is an open-source project. The source code is available on GitHub under the project's license. 
              Contributions are welcome following the project's contribution guidelines.
            </p>
          </section>
        </div>

        {/* Footer marker */}
        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary" />
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
              END_OF_DOCUMENT // 0x9A3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
