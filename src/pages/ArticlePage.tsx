import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, BookOpen, ExternalLink } from 'lucide-react';
import { getArticleBySlug } from '../data/articles';
import type { ArticleSection } from '../data/articles';

function renderSection(section: ArticleSection, index: number) {
  switch (section.type) {
    case 'heading':
      return (
        <h2 key={index} className="font-playfair text-2xl md:text-3xl text-[#F5F5F0] mt-12 mb-5 leading-tight">
          {section.content}
        </h2>
      );
    case 'text':
      return (
        <p key={index} className="font-inter text-base md:text-lg text-white/60 leading-[1.8] mb-5">
          {section.content}
        </p>
      );
    case 'image':
      return (
        <figure key={index} className="my-10 -mx-4 md:mx-0">
          <div className="rounded-xl overflow-hidden">
            <img
              src={section.content}
              alt={section.caption || 'Article image'}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
          {section.caption && (
            <figcaption className="mt-3 px-4 md:px-0 text-sm font-inter text-white/30 italic">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'quote':
      return (
        <blockquote key={index} className="my-10 relative pl-6 border-l-2 border-accent/40">
          <p className="font-playfair text-xl md:text-2xl text-white/70 italic leading-relaxed mb-3">
            "{section.content}"
          </p>
          {section.source && (
            <cite className="block font-inter text-sm text-accent/70 not-italic">
              — {section.source}
            </cite>
          )}
        </blockquote>
      );
    case 'list':
      return (
        <div key={index} className="my-8">
          {section.content && (
            <p className="font-inter text-base text-white/50 mb-4">{section.content}</p>
          )}
          <ul className="space-y-3">
            {section.items?.map((item, i) => (
              <li key={i} className="flex gap-3 font-inter text-base text-white/55 leading-relaxed">
                <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-accent/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex flex-col items-center justify-center px-6">
        <h1 className="font-playfair text-3xl text-white mb-4">Article Not Found</h1>
        <p className="font-inter text-white/40 mb-8">The article you're looking for doesn't exist.</p>
        <Link to="/editorial" className="text-accent font-inter hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Editorial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[75vh] overflow-hidden">
        <img
          src={article.heroImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/50 to-black/20" />

        {/* Back button */}
        <Link
          to="/editorial"
          className="absolute top-24 left-6 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-inter text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Editorial
        </Link>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-12 md:pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-widest text-accent bg-accent/10 backdrop-blur-md border border-accent/20 rounded-full">
                {article.tag}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-inter font-bold text-white/50">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>
            <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-white leading-[1.05] tracking-[-0.02em] mb-4">
              {article.title}
            </h1>
            <p className="font-inter text-lg text-white/40 max-w-2xl leading-relaxed">
              {article.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Article meta */}
      <div className="px-6 md:px-12 py-8 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-6 text-sm font-inter text-white/40">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-white/70">{article.author}</span>
            <span className="text-white/20">·</span>
            <span>{article.authorRole}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{article.date}</span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {article.sections.map((section, i) => renderSection(section, i))}
        </div>
      </article>

      {/* References */}
      {article.references.length > 0 && (
        <div className="px-6 md:px-12 pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="border-t border-white/[0.06] pt-10">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-accent/60" />
                <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">References</h3>
              </div>
              <ol className="space-y-3">
                {article.references.map((ref, i) => (
                  <li key={i} className="flex gap-3 font-inter text-sm text-white/35 leading-relaxed">
                    <span className="shrink-0 text-white/20 tabular-nums">[{i + 1}]</span>
                    <span>
                      {ref.text}
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 ml-2 text-accent/50 hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Back to editorial CTA */}
      <div className="px-6 md:px-12 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            to="/editorial"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-inter text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editorial
          </Link>
        </div>
      </div>
    </div>
  );
}
