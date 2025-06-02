// Performance monitoring utility for tracking search performance

class PerformanceMonitor {
    constructor() {
        this.searchMetrics = new Map();
        this.sessionStats = {
            totalSearches: 0,
            totalTime: 0,
            averageTime: 0,
            fastestSearch: Infinity,
            slowestSearch: 0,
            searchesByType: new Map(),
            startTime: Date.now()
        };
        this.isEnabled = true;
    }

    /**
     * Start timing a search operation
     * @param {string} searchId - Unique identifier for the search
     * @param {string} searchType - Type of search (location, coordinate, text, pcode)
     * @param {string} query - Search query
     * @param {object} params - Search parameters
     */
    startSearch(searchId, searchType, query, params = {}) {
        if (!this.isEnabled) return;

        this.searchMetrics.set(searchId, {
            searchType,
            query,
            params,
            startTime: performance.now(),
            endTime: null,
            duration: null,
            results: null,
            success: null,
            error: null
        });
    }

    /**
     * End timing a search operation
     * @param {string} searchId - Unique identifier for the search
     * @param {Array} results - Search results
     * @param {boolean} success - Whether search was successful
     * @param {Error} error - Error if search failed
     */
    endSearch(searchId, results = [], success = true, error = null) {
        if (!this.isEnabled) return;

        const metric = this.searchMetrics.get(searchId);
        if (!metric) return;

        const endTime = performance.now();
        const duration = endTime - metric.startTime;

        // Update metric
        metric.endTime = endTime;
        metric.duration = duration;
        metric.results = results;
        metric.success = success;
        metric.error = error;

        // Update session stats
        this.updateSessionStats(metric);

        // Log performance for slow searches
        if (duration > 1000) { // Log searches taking more than 1 second
            console.warn(`🐌 Slow search detected: ${metric.searchType} "${metric.query}" took ${duration.toFixed(2)}ms`);
        } else if (duration < 100) { // Log very fast searches
            console.log(`⚡ Fast search: ${metric.searchType} "${metric.query}" took ${duration.toFixed(2)}ms`);
        }

        // Clean up old metrics (keep last 50)
        if (this.searchMetrics.size > 50) {
            const oldestKey = this.searchMetrics.keys().next().value;
            this.searchMetrics.delete(oldestKey);
        }
    }

    /**
     * Update session statistics
     * @param {object} metric - Search metric
     */
    updateSessionStats(metric) {
        this.sessionStats.totalSearches++;
        this.sessionStats.totalTime += metric.duration;
        this.sessionStats.averageTime = this.sessionStats.totalTime / this.sessionStats.totalSearches;
        this.sessionStats.fastestSearch = Math.min(this.sessionStats.fastestSearch, metric.duration);
        this.sessionStats.slowestSearch = Math.max(this.sessionStats.slowestSearch, metric.duration);

        // Update search type counts
        const typeCount = this.sessionStats.searchesByType.get(metric.searchType) || 0;
        this.sessionStats.searchesByType.set(metric.searchType, typeCount + 1);
    }

    /**
     * Get search performance statistics
     * @returns {object} Performance statistics
     */
    getStats() {
        const recentSearches = Array.from(this.searchMetrics.values())
            .filter(metric => metric.endTime)
            .slice(-10); // Last 10 searches

        const sessionDuration = Date.now() - this.sessionStats.startTime;

        return {
            session: {
                ...this.sessionStats,
                sessionDuration: sessionDuration,
                searchesPerMinute: (this.sessionStats.totalSearches / (sessionDuration / 60000)).toFixed(2)
            },
            recent: {
                count: recentSearches.length,
                averageTime: recentSearches.length > 0 
                    ? (recentSearches.reduce((sum, metric) => sum + metric.duration, 0) / recentSearches.length).toFixed(2)
                    : 0,
                successRate: recentSearches.length > 0 
                    ? ((recentSearches.filter(metric => metric.success).length / recentSearches.length) * 100).toFixed(1)
                    : 100
            },
            performance: {
                enabled: this.isEnabled,
                fastestSearch: this.sessionStats.fastestSearch === Infinity ? 0 : this.sessionStats.fastestSearch.toFixed(2),
                slowestSearch: this.sessionStats.slowestSearch.toFixed(2),
                averageSearch: this.sessionStats.averageTime.toFixed(2)
            }
        };
    }

    /**
     * Get detailed metrics for analysis
     * @returns {Array} Array of search metrics
     */
    getDetailedMetrics() {
        return Array.from(this.searchMetrics.values())
            .filter(metric => metric.endTime)
            .map(metric => ({
                searchType: metric.searchType,
                query: metric.query.substring(0, 50), // Truncate long queries
                duration: metric.duration.toFixed(2),
                resultCount: metric.results?.length || 0,
                success: metric.success,
                timestamp: new Date(this.sessionStats.startTime + metric.endTime).toISOString()
            }));
    }

    /**
     * Log performance summary to console
     */
    logPerformanceSummary() {
        const stats = this.getStats();
        
        console.group('🚀 Search Performance Summary');
        console.log(`Total searches: ${stats.session.totalSearches}`);
        console.log(`Average time: ${stats.performance.averageSearch}ms`);
        console.log(`Fastest: ${stats.performance.fastestSearch}ms`);
        console.log(`Slowest: ${stats.performance.slowestSearch}ms`);
        console.log(`Recent success rate: ${stats.recent.successRate}%`);
        console.log(`Searches per minute: ${stats.session.searchesPerMinute}`);
        
        console.log('\nSearches by type:');
        for (const [type, count] of stats.session.searchesByType) {
            console.log(`  ${type}: ${count}`);
        }
        console.groupEnd();
    }

    /**
     * Export performance data for analysis
     * @returns {string} CSV formatted performance data
     */
    exportPerformanceData() {
        const metrics = this.getDetailedMetrics();
        
        if (metrics.length === 0) {
            return 'No performance data available';
        }

        const headers = ['timestamp', 'searchType', 'query', 'duration', 'resultCount', 'success'];
        const rows = metrics.map(metric => [
            metric.timestamp,
            metric.searchType,
            `"${metric.query}"`,
            metric.duration,
            metric.resultCount,
            metric.success
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    /**
     * Reset performance metrics
     */
    reset() {
        this.searchMetrics.clear();
        this.sessionStats = {
            totalSearches: 0,
            totalTime: 0,
            averageTime: 0,
            fastestSearch: Infinity,
            slowestSearch: 0,
            searchesByType: new Map(),
            startTime: Date.now()
        };
        console.log('Performance metrics reset');
    }

    /**
     * Enable or disable performance monitoring
     * @param {boolean} enabled - Whether to enable monitoring
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Create a unique search ID
     * @returns {string} Unique search identifier
     */
    generateSearchId() {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience function for wrapping search operations
export function withPerformanceTracking(searchType, query, searchFunction, params = {}) {
    const searchId = performanceMonitor.generateSearchId();
    
    performanceMonitor.startSearch(searchId, searchType, query, params);
    
    try {
        const result = searchFunction();
        
        // Handle both sync and async results
        if (result && typeof result.then === 'function') {
            return result
                .then(results => {
                    performanceMonitor.endSearch(searchId, results, true);
                    return results;
                })
                .catch(error => {
                    performanceMonitor.endSearch(searchId, [], false, error);
                    throw error;
                });
        } else {
            performanceMonitor.endSearch(searchId, result, true);
            return result;
        }
    } catch (error) {
        performanceMonitor.endSearch(searchId, [], false, error);
        throw error;
    }
} 