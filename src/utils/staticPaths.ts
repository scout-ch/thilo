import { getSections, type SectionT } from './data';
import { getAllSlugsForSection } from './slugMapping';

export async function generateSectionPaths(locales: string[], includeLocaleParam = false) {
  const paths: Array<{
    params: { lang?: string; slug: string };
    props: { section: SectionT; locale: string };
  }> = [];
  
  for (const locale of locales) {
    try {
      const sections = await getSections(locale);
      
      for (const section of sections) {
        const sectionId = section.id.toString();
        // Get all possible slugs for this section
        const slugVariants = getAllSlugsForSection(sectionId);
        const localizedSlug = slugVariants.find(s => s.locale === locale)?.slug;
        
        const finalSlug = localizedSlug || section.slug;
        
        if (finalSlug) {
          const params = includeLocaleParam 
            ? { lang: locale, slug: finalSlug }
            : { slug: finalSlug };
            
          paths.push({
            params,
            props: { section, locale }
          });
        }
      }
    } catch (error) {
      console.error(`Error loading sections for ${locale}:`, error);
    }
  }
  
  console.log(`Generated ${paths.length} paths for locales: ${locales.join(', ')}`);
  return paths;
}
