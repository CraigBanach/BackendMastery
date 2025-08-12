export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const fs = await import('fs')
    const path = await import('path')
    
    const logFile = path.join(process.cwd(), 'logs/api-requests.log')
    
    // Ensure logs directory exists
    const logDir = path.dirname(logFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    
    const originalFetch = global.fetch
    global.fetch = async (...args) => {
      const getUrl = () => {
        if (typeof args[0] === 'string') return args[0]
        if (args[0] instanceof Request) return args[0].url
        if (args[0] instanceof URL) return args[0].toString()
        return 'unknown'
      }
      const url = getUrl()
      const method = args[1]?.method || 'GET'
      const start = Date.now()
      
      try {
        const response = await originalFetch(...args)
        const duration = Date.now() - start
        
        // Clone response to read body without consuming it
        const responseClone = response.clone()
        const responseBody = await responseClone.text()
        
        const logEntry = `${new Date().toISOString()} [${method}] ${url} -> ${response.status} ${response.statusText} (${duration}ms)\nResponse Body: ${responseBody}\n---\n`
        fs.appendFileSync(logFile, logEntry)
        
        // Also log to console for immediate visibility
        console.log(`API Request: [${method}] ${url} -> ${response.status} (${duration}ms)`)
        console.log(`Response Body:`, responseBody)
        
        return response
      } catch (error) {
        const duration = Date.now() - start
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        
        const logEntry = `${new Date().toISOString()} [${method}] ${url} -> ERROR: ${errorMsg} (${duration}ms)\n`
        fs.appendFileSync(logFile, logEntry)
        
        console.error(`API Request Error: [${method}] ${url} -> ${errorMsg} (${duration}ms)`)
        
        throw error
      }
    }
  }
}