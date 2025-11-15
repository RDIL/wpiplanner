// TODO: Hook this up
export class Storage {
  private static readonly SCHEDULE_KEY = 'wpiplanner_schedule';
  private static readonly FAVORITES_KEY = 'wpiplanner_favorites';

  static saveSchedule(data: any): void {
    try {
      localStorage.setItem(this.SCHEDULE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save schedule to localStorage:', e);
    }
  }

  static loadSchedule(): any | null {
    try {
      const data = localStorage.getItem(this.SCHEDULE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load schedule from localStorage:', e);
      return null;
    }
  }

  static saveFavorites(data: any): void {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }

  static loadFavorites(): any | null {
    try {
      const data = localStorage.getItem(this.FAVORITES_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load favorites from localStorage:', e);
      return null;
    }
  }
}
