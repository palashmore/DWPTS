import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeOption {
  id: string;
  name: string;
  subtitle: string;
  accentColor: string;
  secondaryAccent: string;
  surfaceColor: string;
  bgColor: string;
  textColor: string;
  badge: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'dwpts_theme';

  public readonly themes: ThemeOption[] = [
    {
      id: 'midnight-luxury',
      name: 'Midnight Luxury',
      subtitle: 'Midnight Navy + Champagne Gold',
      accentColor: '#D6B36A',
      secondaryAccent: '#F0D79A',
      surfaceColor: '#101E33',
      bgColor: '#07111F',
      textColor: '#F8FAFC',
      badge: '👑 Flagship'
    },
    {
      id: 'royal-indigo',
      name: 'Royal Indigo',
      subtitle: 'Deep Indigo + Electric Violet',
      accentColor: '#8B5CF6',
      secondaryAccent: '#A78BFA',
      surfaceColor: '#121738',
      bgColor: '#0B0E23',
      textColor: '#F8FAFC',
      badge: '✨ Royal'
    },
    {
      id: 'executive-graphite',
      name: 'Executive Graphite',
      subtitle: 'Deep Charcoal + Amber Gold',
      accentColor: '#F59E0B',
      secondaryAccent: '#FCD34D',
      surfaceColor: '#1A1D24',
      bgColor: '#0F1115',
      textColor: '#F8FAFC',
      badge: '💼 Executive'
    },
    {
      id: 'ocean-luxe',
      name: 'Ocean Luxe',
      subtitle: 'Abyss Navy + Luminous Cyan',
      accentColor: '#06B6D4',
      secondaryAccent: '#38BDF8',
      surfaceColor: '#0A233A',
      bgColor: '#041525',
      textColor: '#F8FAFC',
      badge: '🌊 Ocean'
    },
    {
      id: 'emerald-elite',
      name: 'Emerald Elite',
      subtitle: 'Deep Jade + Radiant Emerald',
      accentColor: '#10B981',
      secondaryAccent: '#34D399',
      surfaceColor: '#0C2B22',
      bgColor: '#061A14',
      textColor: '#F8FAFC',
      badge: '🌿 Elite'
    },
    {
      id: 'platinum-light',
      name: 'Platinum Light',
      subtitle: 'Pristine Slate + Champagne Gold',
      accentColor: '#B99652',
      secondaryAccent: '#1E293B',
      surfaceColor: '#FFFFFF',
      bgColor: '#F1F5F9',
      textColor: '#0F172A',
      badge: '☀️ Light'
    }
  ];

  private currentThemeSubject = new BehaviorSubject<string>('midnight-luxury');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.THEME_KEY) || 'midnight-luxury';
    this.setTheme(saved);
  }

  public get currentTheme(): string {
    return this.currentThemeSubject.value;
  }

  public setTheme(themeId: string): void {
    const valid = this.themes.find(t => t.id === themeId);
    const selected = valid ? valid.id : 'midnight-luxury';
    
    this.currentThemeSubject.next(selected);
    localStorage.setItem(this.THEME_KEY, selected);
    
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', selected);
    }
  }
}
