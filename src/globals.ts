import { SectionT } from './components/Section';

declare global {
    var __GLOBAL_VAR__: {
          sections: SectionT[];
    };
    interface Window {
        sections: SectionT[];
    }
}
  