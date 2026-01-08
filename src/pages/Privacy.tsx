import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
            PRIVACY_POLICY
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
              DATA_COLLECTION
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite processes your code repositories and files solely for the purpose of generating documentation. 
              We do not store your source code on our servers after processing is complete.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              LOCAL_STORAGE
            </h2>
            <p className="font-body text-sm leading-relaxed">
              Your API keys, form data, and generation history are stored locally in your browser using IndexedDB. 
              This data never leaves your device unless you explicitly submit a generation request.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              API_REQUESTS
            </h2>
            <p className="font-body text-sm leading-relaxed">
              When you generate documentation, your code is sent to the FastWrite API for processing. 
              The API forwards your code to your selected AI provider (OpenAI, Google, Anthropic, etc.) 
              using your own API key. We do not retain copies of your code after processing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              THIRD_PARTY_SERVICES
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite integrates with third-party AI providers. Each provider has their own privacy policy 
              governing how they handle data. We recommend reviewing the privacy policies of your selected AI provider.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm font-mono text-white/60">
              <li>OpenAI - openai.com/privacy</li>
              <li>Google AI - ai.google/privacy</li>
              <li>Anthropic - anthropic.com/privacy</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              COOKIES
            </h2>
            <p className="font-body text-sm leading-relaxed">
              FastWrite uses minimal cookies for theme preferences and session management. 
              We do not use tracking cookies or third-party analytics.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-black text-primary uppercase tracking-widest">
              CONTACT
            </h2>
            <p className="font-body text-sm leading-relaxed">
              For privacy-related inquiries, please open an issue on our GitHub repository or contact the maintainers directly.
            </p>
          </section>
        </div>

        {/* Footer marker */}
        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary" />
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
              END_OF_DOCUMENT // 0x9A2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
