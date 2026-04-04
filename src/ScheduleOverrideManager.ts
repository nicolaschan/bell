import cookieManager from './LocalForageCookieManager'
import Calendar from './Calendar'

interface IScheduleOverride {
  date: string
  scheduleName: string
  display: string | null
}

class ScheduleOverrideManager {
  
  private cache: IScheduleOverride[] = []
  private cacheLoaded: boolean = false
  private cacheLoadPromise: Promise<void>

  constructor() {
    this.cacheLoadPromise = this.loadCache()
  }

  private async loadCache(): Promise<void> {
    this.cache = await cookieManager.get('schedule_overrides', [])
    this.cache = Array.isArray(this.cache) ? this.cache : []
    this.cacheLoaded = true
    await this.cleanupOldOverrides()
  }

  private async ensureCacheLoaded(): Promise<void> {
    if (!this.cacheLoaded) {
      await this.cacheLoadPromise
    }
  }

  private async saveCache(): Promise<void> {
    await cookieManager.set('schedule_overrides', this.cache)
  }

  public async setOverrideForToday (scheduleName: string, display: string | null = null): Promise<void> {
    await this.ensureCacheLoaded()
    const today = Calendar.dateToString(new Date())
    
    // Remove any existing override for today
    this.cache = this.cache.filter(o => o.date !== today)
    
    // Add new override
    this.cache.push({
      date: today,
      scheduleName,
      display
    })
    
    await this.saveCache()
  }

  public async clearOverrideForToday (): Promise<void> {
    await this.ensureCacheLoaded()
    const today = Calendar.dateToString(new Date())
    this.cache = this.cache.filter(o => o.date !== today)
    await this.saveCache()
  }

  public getOverrideForDate (date: Date): IScheduleOverride | null {
    if (!this.cacheLoaded) {
      // Block synchronously if cache isn't loaded yet (shouldn't happen in normal flow)
      // This is a fallback - the cache should be loaded by the time this is called
      return null
    }
    const dateStr = Calendar.dateToString(date)
    return this.cache.find(o => o.date === dateStr) || null
  }

  public getTodayOverride(): IScheduleOverride | null {
    return this.getOverrideForDate(new Date())
  }

  public async cleanupOldOverrides (): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Keep only overrides for today or future dates
    this.cache = this.cache.filter(o => {
      const [month, day, year] = o.date.split('/').map(Number)
      const overrideDate = new Date(year, month - 1, day)
      overrideDate.setHours(0, 0, 0, 0)
      return overrideDate >= today
    })
    
    await this.saveCache()
  }

  // Ensure cache is loaded before using the override manager
  public async waitForCache(): Promise<void> {
    await this.ensureCacheLoaded()
  }
}

export default new ScheduleOverrideManager()
